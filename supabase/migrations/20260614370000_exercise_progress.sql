-- Per-learner write-code exercise progress (#128, parent #81). The learner
-- self-reports starting and passing a write-code exercise; this stores that state
-- plus an optional reflection. Evidence-only and suggestion-only: it never
-- auto-declares mastery (mastery lives in skill_events) and is separate from FSRS.
-- Same per-user isolation pattern as attempts/reviews/placement (RLS). Idempotent.

create table if not exists public.exercise_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  status text not null default 'started'
    check (status in ('started', 'completed')),
  reflection text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, exercise_id)
);

alter table public.exercise_progress enable row level security;

create index if not exists exercise_progress_user_idx
  on public.exercise_progress (user_id, exercise_id);

drop policy if exists "exercise_progress_select_own" on public.exercise_progress;
drop policy if exists "exercise_progress_insert_own" on public.exercise_progress;
drop policy if exists "exercise_progress_update_own" on public.exercise_progress;
drop policy if exists "exercise_progress_delete_own" on public.exercise_progress;

create policy "exercise_progress_select_own"
on public.exercise_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "exercise_progress_insert_own"
on public.exercise_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "exercise_progress_update_own"
on public.exercise_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "exercise_progress_delete_own"
on public.exercise_progress
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Explicit base grants for fresh databases (see 20260614330000). Self-reported
-- per-user rows under RLS.
grant select, insert, update, delete on public.exercise_progress to authenticated;
