-- ============================================================================
-- «Завершить создание» (2026-09-29): защита зафиксированной сборки персонажа.
-- Выполнить целиком в Supabase → SQL Editor. Можно запускать повторно.
-- Уже созданных персонажей НЕ блокирует: игроки дозавершат их сами кнопкой «Завершить создание».
-- ============================================================================
create or replace function private.guard_locked_build()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  ok boolean := true;
  total int := 0;
  k text;
  v text;
begin
  if public.is_admin() or coalesce((old.data ->> 'locked')::boolean, false) is not true then
    return new;
  end if;

  -- Зафиксировано: клан, характеристики, Человечность и навыки остаются прежними; снять фиксацию может только админ
  new.clan_id := old.clan_id;
  new.data := new.data || jsonb_build_object(
    'locked', true,
    'clanId', old.data -> 'clanId',
    'abilities', old.data -> 'abilities',
    'humanity', old.data -> 'humanity',
    'skills', old.data -> 'skills',
    'clanSkill', coalesce(old.data -> 'clanSkill', 'null'::jsonb),
    'skillAbility', coalesce(old.data -> 'skillAbility', '{}'::jsonb));

  -- Дисциплины: уровни только растут, не выше 3, всего не больше 3 + доп. очки от Мастера
  for k, v in select key, value from jsonb_each_text(coalesce(new.data -> 'disciplines', '{}'::jsonb)) loop
    if v !~ '^[0-9]+$' or v::int > 3 or coalesce((old.data -> 'disciplines' ->> k)::int, 0) > v::int then ok := false; end if;
    if v ~ '^[0-9]+$' then total := total + v::int; end if;
  end loop;
  for k in select jsonb_object_keys(coalesce(old.data -> 'disciplines', '{}'::jsonb)) loop
    if new.data -> 'disciplines' -> k is null then ok := false; end if;
  end loop;
  if total > 3 + coalesce((new.data ->> 'bonusPoints')::int, 0) then ok := false; end if;
  if not ok then
    new.data := jsonb_set(new.data, '{disciplines}', coalesce(old.data -> 'disciplines', '{}'::jsonb));
  end if;
  return new;
end $$;

-- Имя триггера после characters_admin_fields (по алфавиту): доп. очки к этому моменту уже защищены
drop trigger if exists characters_locked_build on public.characters;
create trigger characters_locked_build
  before update on public.characters
  for each row execute function private.guard_locked_build();
