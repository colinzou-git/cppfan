-- Roadmap #82 / #130: persist per-learner capstone milestone progress. This is
-- each learner self-reported project progress (manual checklist / exercise
-- tests / reflection), isolated per user with the same RLS pattern as attempts
-- and reviews. milestone_id / project_id reference the typed capstone catalog
-- (src/features/labs/capstone-tracks.ts), which is not DB-backed, so there is no
-- FK. Progress is kept separate from FSRS scheduling and never auto-declares
-- mastery. Idempotent.

create table if not exists public.capstone_milestone_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null,
  milestone_id text not null,
  status text not null default 'started'
    check (status in ('started', 'completed')),
  verification text,
  reflection text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, milestone_id)
);

alter table public.capstone_milestone_progress enable row level security;

create index if not exists capstone_milestone_progress_user_project_idx
  on public.capstone_milestone_progress (user_id, project_id);

drop trigger if exists set_capstone_milestone_progress_updated_at on public.capstone_milestone_progress;

create trigger set_capstone_milestone_progress_updated_at
before update on public.capstone_milestone_progress
for each row
execute function public.set_updated_at();

-- Per-user data: a learner reads and manages only their own progress rows.
drop policy if exists "capstone_progress_select_own" on public.capstone_milestone_progress;
drop policy if exists "capstone_progress_insert_own" on public.capstone_milestone_progress;
drop policy if exists "capstone_progress_update_own" on public.capstone_milestone_progress;

create policy "capstone_progress_select_own"
on public.capstone_milestone_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "capstone_progress_insert_own"
on public.capstone_milestone_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "capstone_progress_update_own"
on public.capstone_milestone_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
