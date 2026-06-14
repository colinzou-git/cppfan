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

-- Stub: in CI there is no real session, so auth.uid() reads a settable GUC
-- (app.test_uid). It defaults to NULL when unset, matching the previous stub, so
-- existing smokes are unaffected; the RLS-isolation smoke (#96) sets it to
-- impersonate a user. missing_ok = true so an unset GUC returns NULL, not error.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$ select nullif(current_setting('app.test_uid', true), '')::uuid $$;

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

-- Supabase grants the authenticated role usage on the auth schema and execute on
-- auth.uid(); replicate that so RLS policies (which call auth.uid()) can be
-- evaluated when we impersonate a user in the RLS-isolation smoke (#96).
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
