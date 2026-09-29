-- ============================================================================
-- Навыки v2 и скрытый уровень персонажа (2026-09-29).
-- Выполнить целиком в Supabase → SQL Editor. Можно запускать повторно.
-- ============================================================================

-- 1. Скрытый уровень: читает и меняет только админ. Игроки таблицу не видят.
create table if not exists public.character_levels (
  character_id text primary key references public.characters(id) on delete cascade,
  level        int  not null default 1 check (level between 1 and 10),
  updated_at   timestamptz not null default now()
);
alter table public.character_levels enable row level security;
drop policy if exists "levels: только админ" on public.character_levels;
create policy "levels: только админ" on public.character_levels
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
revoke all on public.character_levels from anon;
grant select, insert, update, delete on public.character_levels to authenticated;

-- 2. Поля, которые меняет только админ: + навыки от Мастера (bonusSkills)
create or replace function private.guard_admin_fields()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.data := new.data || jsonb_build_object('bonusPoints', 0, 'generation', 12, 'bloodPotency', 1, 'bonusSkills', '{}'::jsonb);
  else
    new.data := new.data || jsonb_build_object(
      'bonusPoints', coalesce(old.data -> 'bonusPoints', '0'),
      'generation', coalesce(old.data -> 'generation', '12'),
      'bloodPotency', coalesce(old.data -> 'bloodPotency', '1'),
      'bonusSkills', coalesce(old.data -> 'bonusSkills', '{}'::jsonb));
  end if;
  return new;
end $$;

-- 3. Перенос навыков у существующих персонажей:
--    Компьютеры / Инженерия / Ремесло → Техника; Исполнение → Искусство;
--    выбранные дополнительные навыки (Акробатика, Медицина, Этикет, Знание улиц, Выживание, Лидерство,
--    Обращение с животными, Искусство) становятся навыками от Мастера с тем же бонусом, а выбор освобождается.
alter table public.characters disable trigger characters_admin_fields;   -- иначе защита откатит перенос
do $$
declare
  r record; d jsonb; k text; v text; bonus jsonb;
  core text[] := array['athletics','intimidation','stealth','sleight','occult','tech','lore','perception','insight','persuasion','deception'];
begin
  for r in select id, data from public.characters loop
    d := r.data;
    bonus := coalesce(d -> 'bonusSkills', '{}'::jsonb);
    foreach k in array array['two', 'one'] loop
      v := d -> 'skills' ->> k;
      if v in ('computers', 'engineering', 'crafts') then v := 'tech'; end if;
      if v = 'performance' then v := 'art'; end if;
      if v is null then continue; end if;
      if v = any(core) then
        d := jsonb_set(d, array['skills', k], to_jsonb(v));
      else
        bonus := bonus || jsonb_build_object(v, least(5, coalesce((bonus ->> v)::int, 0) + case when k = 'two' then 2 else 1 end));
        d := jsonb_set(d, array['skills', k], 'null'::jsonb);
      end if;
    end loop;
    d := d || jsonb_build_object('bonusSkills', bonus);
    if d is distinct from r.data then
      update public.characters set data = d where id = r.id;
    end if;
  end loop;
end $$;
alter table public.characters enable trigger characters_admin_fields;

-- Проверка: навыки персонажей после переноса
select name, clan_id, data -> 'skills' as skills, data -> 'bonusSkills' as bonus_skills from public.characters order by name;
