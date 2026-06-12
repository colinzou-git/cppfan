-- Minimal Supabase-compatible objects so the app migrations can be applied
-- against a vanilla Postgres in CI. Supabase provides the auth schema, the
-- auth.uid() helper, and the anon/authenticated/service_role roles; a plain
-- Postgres does not, so we create stubs sufficient for the migrations' DDL,
-- FKs, RLS policies, and grants to apply.
create extension if not exists pgcrypto;

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text
);

-- Stub: returns NULL in CI (no real session). Enough for policies that reference
-- auth.uid() to compile and apply.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$ select null::uuid $$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit;
  end if;
end $$;

grant usage on schema public to anon, authenticated, service_role;
