-- cppFan profile and onboarding table.
--
-- Apply this migration after Supabase Auth is configured.
-- Each row is owned by one auth.users record.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null,
  experience_level text not null default 'beginner'
    check (experience_level in ('beginner', 'some_cpp', 'intermediate', 'advanced')),
  daily_new_skills_goal integer not null default 1
    check (daily_new_skills_goal >= 0 and daily_new_skills_goal <= 10),
  daily_review_minutes integer not null default 15
    check (daily_review_minutes >= 5 and daily_review_minutes <= 120),
  learning_goals text[] not null default '{}',
  preferred_platforms text[] not null default '{}',
  onboarding_completed boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create index if not exists profiles_onboarding_completed_idx
  on public.profiles (onboarding_completed);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
