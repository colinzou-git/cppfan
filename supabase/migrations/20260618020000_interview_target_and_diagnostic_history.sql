-- Dedicated interview target preferences and diagnostic history (#175).
-- These records are recommendation context only and never mastery or FSRS state.

create table if not exists public.interview_targets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  target_profile text not null check (target_profile in ('google_staff_systems')),
  cpp_standard text not null check (cpp_standard in ('cpp17', 'cpp20', 'cpp23')),
  target_date date,
  recent_practice text not null check (
    recent_practice in ('none', 'within_month', 'within_three_months', 'within_year', 'over_year')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.interview_targets enable row level security;

drop policy if exists "interview_targets_select_own" on public.interview_targets;
drop policy if exists "interview_targets_insert_own" on public.interview_targets;
drop policy if exists "interview_targets_update_own" on public.interview_targets;
drop policy if exists "interview_targets_delete_own" on public.interview_targets;

create policy "interview_targets_select_own"
on public.interview_targets for select to authenticated
using ((select auth.uid()) = user_id);
create policy "interview_targets_insert_own"
on public.interview_targets for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "interview_targets_update_own"
on public.interview_targets for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "interview_targets_delete_own"
on public.interview_targets for delete to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.interview_targets to authenticated;

create table if not exists public.diagnostic_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_id uuid not null,
  completed_at timestamptz not null default now(),
  unique (user_id, submission_id)
);

create table if not exists public.diagnostic_attempt_scores (
  attempt_id uuid not null references public.diagnostic_attempts(id) on delete cascade,
  section_id text not null check (
    section_id in ('diag.arrays_window', 'diag.graph_dependency', 'diag.ds_design', 'diag.cpp_debugging')
  ),
  score double precision not null check (score >= 0 and score <= 1),
  primary key (attempt_id, section_id)
);

create index if not exists diagnostic_attempts_user_completed_idx
  on public.diagnostic_attempts (user_id, completed_at desc);

alter table public.diagnostic_attempts enable row level security;
alter table public.diagnostic_attempt_scores enable row level security;

drop policy if exists "diagnostic_attempts_select_own" on public.diagnostic_attempts;
drop policy if exists "diagnostic_attempts_insert_own" on public.diagnostic_attempts;
drop policy if exists "diagnostic_attempt_scores_select_own" on public.diagnostic_attempt_scores;
drop policy if exists "diagnostic_attempt_scores_insert_own" on public.diagnostic_attempt_scores;

create policy "diagnostic_attempts_select_own"
on public.diagnostic_attempts for select to authenticated
using ((select auth.uid()) = user_id);
create policy "diagnostic_attempts_insert_own"
on public.diagnostic_attempts for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "diagnostic_attempt_scores_select_own"
on public.diagnostic_attempt_scores for select to authenticated
using (
  exists (
    select 1 from public.diagnostic_attempts a
    where a.id = attempt_id and a.user_id = (select auth.uid())
  )
);
create policy "diagnostic_attempt_scores_insert_own"
on public.diagnostic_attempt_scores for insert to authenticated
with check (
  exists (
    select 1 from public.diagnostic_attempts a
    where a.id = attempt_id and a.user_id = (select auth.uid())
  )
);

grant select, insert on public.diagnostic_attempts, public.diagnostic_attempt_scores to authenticated;
