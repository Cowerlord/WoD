-- =========================================================
-- Становление Сородича — схема базы Supabase
-- Выполнить один раз целиком: Supabase → SQL Editor → New query → Run.
-- Скрипт можно запускать повторно: он не удаляет данные. Предупреждение Supabase о «destructive operations»
-- относится к drop policy/trigger if exists — они пересоздаются следом, данные не трогаются.
-- =========================================================

-- Регистрации на сайте нет: аккаунты создаёт админ функцией private.create_player (см. конец файла).
-- В Supabase также стоит выключить Authentication → Sign In / Providers → «Allow new users to sign up».

-- ---------- Настройки ----------
create schema if not exists private;
revoke all on schema private from anon, authenticated;

create table if not exists private.settings (
  key   text primary key,
  value text not null
);
-- Политик нет: из браузера таблица недоступна, читают её только функции ниже (security definer)
alter table private.settings enable row level security;
insert into private.settings (key, value) values
  ('max_characters', '10')
on conflict (key) do nothing;

-- ---------- Профили ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text not null check (username ~ '^[A-Za-z0-9_.-]{3,24}$'),   -- регистр для показа, вход без учёта регистра
  role       text not null default 'player' check (role in ('player', 'admin')),
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));

-- Профиль создаётся вместе с аккаунтом. Пометку wod=created в raw_app_meta_data браузер поставить не может,
-- поэтому регистрация через API отклоняется, даже если в настройках Supabase её забыли выключить.
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(new.raw_app_meta_data ->> 'wod', '') <> 'created' then
    raise exception 'SIGNUP_DISABLED';
  end if;
  insert into public.profiles (id, username, role)
  values (new.id, new.raw_user_meta_data ->> 'username', coalesce(new.raw_app_meta_data ->> 'wod_role', 'player'));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
drop policy if exists "profiles: читают все вошедшие" on public.profiles;
create policy "profiles: читают все вошедшие" on public.profiles
  for select to authenticated using (true);
-- Политик на insert/update/delete нет: ник и роль из браузера не меняются.
-- Назначить админа: update public.profiles set role = 'admin' where username = 'ник';

-- ---------- Персонажи ----------
create table if not exists public.characters (
  id         text primary key check (id ~ '^[A-Za-z0-9_-]{1,40}$'),
  owner_id   uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  name       text not null default '' check (char_length(name) <= 200),
  clan_id    text check (char_length(clan_id) <= 40),
  data       jsonb not null check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 3000000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists characters_owner_idx on public.characters (owner_id);

-- Не больше N персонажей на аккаунт (N — private.settings.max_characters)
create or replace function private.check_character_limit()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.owner_id::text));   -- два параллельных insert не обойдут лимит
  if (select count(*) from public.characters where owner_id = new.owner_id)
     >= (select value::int from private.settings where key = 'max_characters') then
    raise exception 'CHARACTER_LIMIT';
  end if;
  return new;
end $$;

drop trigger if exists characters_limit on public.characters;
create trigger characters_limit
  before insert on public.characters
  for each row execute function private.check_character_limit();

-- Владельца и дату создания поменять нельзя, дата изменения ставится сервером
create or replace function private.touch_character()
returns trigger language plpgsql as $$
begin
  new.owner_id   := old.owner_id;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists characters_touch on public.characters;
create trigger characters_touch
  before update on public.characters
  for each row execute function private.touch_character();

alter table public.characters enable row level security;

drop policy if exists "characters: читают все вошедшие" on public.characters;
create policy "characters: читают все вошедшие" on public.characters
  for select to authenticated using (true);

drop policy if exists "characters: создают только своих" on public.characters;
create policy "characters: создают только своих" on public.characters
  for insert to authenticated with check (owner_id = (select auth.uid()));

drop policy if exists "characters: меняет владелец или админ" on public.characters;
create policy "characters: меняет владелец или админ" on public.characters
  for update to authenticated
  using (owner_id = (select auth.uid()) or (select public.is_admin()))
  with check (owner_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "characters: удаляет владелец или админ" on public.characters;
create policy "characters: удаляет владелец или админ" on public.characters
  for delete to authenticated
  using (owner_id = (select auth.uid()) or (select public.is_admin()));

-- Лимит для интерфейса (счётчик «N / 10»)
create or replace function public.character_limit()
returns int language sql stable security definer set search_path = '' as $$
  select value::int from private.settings where key = 'max_characters';
$$;

-- anon ничего не видит; вошедшим — только то, что разрешают политики выше
revoke all on public.profiles, public.characters from anon;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.characters to authenticated;
revoke execute on function public.is_admin(), public.character_limit() from anon, public;
grant execute on function public.is_admin(), public.character_limit() to authenticated;

-- ---------- Управление аккаунтами (только из SQL Editor) ----------
-- Логин на сайте — ник; под капотом это email <ник в нижнем регистре>@players.wod.local
-- (домен совпадает с LOGIN_DOMAIN в vampire-creator.html).
--   select private.create_player('Ник', 'пароль');            -- игрок
--   select private.create_player('Ник', 'пароль', 'admin');   -- админ
--   select private.set_password('Ник', 'новый-пароль');
--   update public.profiles set role = 'admin' where lower(username) = 'ник';
--   delete from auth.users where email = 'ник@players.wod.local';   -- удалить аккаунт вместе с персонажами
create or replace function private.create_player(p_username text, p_password text, p_role text default 'player')
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id    uuid := gen_random_uuid();
  v_email text := lower(p_username) || '@players.wod.local';
begin
  if p_username !~ '^[A-Za-z0-9_.-]{3,24}$' then raise exception 'Ник: 3–24 символа, латиница, цифры, _ . -'; end if;
  if char_length(p_password) < 6 then raise exception 'Пароль — минимум 6 символов'; end if;
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
          extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
          jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'wod', 'created', 'wod_role', p_role),
          jsonb_build_object('username', p_username), now(), now(), '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text,
          jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
          'email', now(), now(), now());
  return v_id;
end $$;

create or replace function private.set_password(p_username text, p_password text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if char_length(p_password) < 6 then raise exception 'Пароль — минимум 6 символов'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at = now()
  where email = lower(p_username) || '@players.wod.local';
  if not found then raise exception 'Нет такого ника'; end if;
end $$;

revoke all on function private.create_player(text, text, text), private.set_password(text, text) from public, anon, authenticated;

-- ---------- Пинг, чтобы бесплатный проект не засыпал (вызывает .github/workflows/keepalive.yml) ----------
create or replace function public.ping()
returns int language sql stable security definer set search_path = '' as $$
  select count(*)::int from (select 1 from public.characters limit 1) t;
$$;
revoke all on function public.ping() from public;
grant execute on function public.ping() to anon, authenticated;

-- ---------- Поля, которые меняет только админ: доп. очки, Поколение, Сила Крови ----------
-- Игрок при создании получает стартовые значения, при сохранении у него остаются прежние
create or replace function private.guard_admin_fields()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.data := new.data || jsonb_build_object('bonusPoints', 0, 'generation', 12, 'bloodPotency', 1);
  else
    new.data := new.data || jsonb_build_object(
      'bonusPoints', coalesce(old.data -> 'bonusPoints', '0'),
      'generation', coalesce(old.data -> 'generation', '12'),
      'bloodPotency', coalesce(old.data -> 'bloodPotency', '1'));
  end if;
  return new;
end $$;

drop trigger if exists characters_bonus on public.characters;
drop function if exists private.guard_bonus_points();
drop trigger if exists characters_admin_fields on public.characters;

-- Все игроки — 12-е Поколение (13-е больше не выбирается)
update public.characters
set data = data || jsonb_build_object('generation', 12, 'bloodPotency', 1)
where coalesce(data ->> 'generation', '13') = '13';

create trigger characters_admin_fields
  before insert or update on public.characters
  for each row execute function private.guard_admin_fields();

-- ---------- Общие данные кампании: «Жара» Маскарада (читают все, меняет админ) ----------
create table if not exists public.campaign (
  id         int primary key default 1 check (id = 1),
  heat       int not null default 0 check (heat between 0 and 5),
  updated_at timestamptz not null default now()
);
insert into public.campaign (id) values (1) on conflict (id) do nothing;
alter table public.campaign enable row level security;
drop policy if exists "campaign: читают все вошедшие" on public.campaign;
create policy "campaign: читают все вошедшие" on public.campaign
  for select to authenticated using (true);
drop policy if exists "campaign: меняет админ" on public.campaign;
create policy "campaign: меняет админ" on public.campaign
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
revoke all on public.campaign from anon;
grant select, update on public.campaign to authenticated;
