-- Frente de Batalla · esquema de cuentas (pegar completo en Supabase > SQL Editor > Run)

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,16}$'),
  avatar int not null default 25 check (avatar between 1 and 1025),
  played int not null default 0 check (played >= 0),
  wins int not null default 0 check (wins >= 0),
  gstats jsonb not null default '{}'::jsonb,
  cp_score int not null default 0 check (cp_score between 0 and 1000000),
  cp_titles int not null default 0 check (cp_titles between 0 and 20),
  pet_sp int not null default 0,
  pet_lv int not null default 0 check (pet_lv between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pet jsonb,
  cp jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.saves enable row level security;

drop policy if exists "perfiles visibles" on public.profiles;
create policy "perfiles visibles" on public.profiles for select using (true);
drop policy if exists "editar mi perfil" on public.profiles;
create policy "editar mi perfil" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "mis partidas" on public.saves;
create policy "mis partidas" on public.saves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- el nombre de usuario no se puede cambiar desde la web
revoke update on public.profiles from anon, authenticated;
grant update (avatar, played, wins, gstats, cp_score, cp_titles, pet_sp, pet_lv) on public.profiles to authenticated;

-- crea el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, avatar)
  values (new.id, lower(new.raw_user_meta_data->>'username'),
          coalesce((new.raw_user_meta_data->>'avatar')::int, 25));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create index if not exists profiles_wins_idx on public.profiles (wins desc);
create index if not exists profiles_cp_idx on public.profiles (cp_score desc);
create index if not exists profiles_pet_idx on public.profiles (pet_lv desc);

-- =====================================================================
-- REGISTRO DE ACEPTACIÓN (términos y privacidad) · añadido 2026-10-17
-- Guarda cuándo y cómo aceptó cada persona cada documento. Solo se puede
-- INSERTAR y LEER lo propio: nadie puede editar ni borrar registros desde la web.
-- =====================================================================
create table if not exists public.consents (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  email_hash text,                                   -- sha256 del correo (prueba si se borra la cuenta)
  doc text not null check (doc in ('terms','privacy')),
  version text not null,                             -- versión del documento aceptado (ej. 2026-10-17)
  method text not null check (method in ('signup','reaccept')),
  accepted_at timestamptz not null default now(),    -- hora del SERVIDOR (no manipulable)
  client_at timestamptz,                             -- hora declarada por el navegador
  user_agent text,
  ip text
);
create index if not exists consents_user_idx on public.consents (user_id, version);

alter table public.consents enable row level security;
drop policy if exists "ver mis aceptaciones" on public.consents;
create policy "ver mis aceptaciones" on public.consents for select using (auth.uid() = user_id);
drop policy if exists "registrar mi aceptacion" on public.consents;
create policy "registrar mi aceptacion" on public.consents for insert with check (auth.uid() = user_id);
revoke all on public.consents from anon, authenticated;
grant select, insert on public.consents to authenticated;

create extension if not exists pgcrypto with schema extensions;

-- fuerza hora e IP desde el servidor, ignora lo que mande el navegador
create or replace function public.consents_stamp()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
declare h json;
begin
  new.accepted_at := now();
  begin
    h := current_setting('request.headers', true)::json;
    new.ip := coalesce(split_part(h->>'x-forwarded-for', ',', 1), h->>'cf-connecting-ip');
  exception when others then null;
  end;
  if new.email_hash is null and new.user_id is not null then
    select encode(digest(lower(email), 'sha256'), 'hex') into new.email_hash from auth.users where id = new.user_id;
  end if;
  return new;
end $$;
drop trigger if exists consents_stamp_t on public.consents;
create trigger consents_stamp_t before insert on public.consents
for each row execute function public.consents_stamp();

-- al registrarse: guarda el perfil Y la aceptación que viajó en los datos del registro
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
declare c jsonb := new.raw_user_meta_data->'consent'; d text;
begin
  insert into public.profiles (id, username, avatar)
  values (new.id, lower(new.raw_user_meta_data->>'username'),
          coalesce((new.raw_user_meta_data->>'avatar')::int, 25));
  if c is not null and c->>'terms' is not null and c->>'privacy' is not null then
    foreach d in array array['terms','privacy'] loop
      insert into public.consents (user_id, doc, version, method, client_at, user_agent, email_hash)
      values (new.id, d, left(c->>d, 20), 'signup',
              nullif(c->>'client_at','')::timestamptz, left(c->>'ua', 300),
              encode(digest(lower(new.email), 'sha256'), 'hex'));
    end loop;
  end if;
  return new;
end $$;
