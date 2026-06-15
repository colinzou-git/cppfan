-- Per-learner timed interview session state (#177). Persists the current session
-- (problem, mode, duration, phase, elapsed, status) so progress survives a
-- refresh. One current session row per learner (unique user_id); starting a new
-- one overwrites it. Self-reported state under RLS (it drives the learner
-- practice UI, not mastery), separate from FSRS. Idempotent.

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  mode text not null default 'practice'
    check (mode in ('practice', 'interview')),
  duration_minutes integer not null default 45
    check (duration_minutes in (35, 45, 50)),
  phase_index integer not null default 0
    check (phase_index >= 0 and phase_index <= 8),
  elapsed_seconds integer not null default 0
    check (elapsed_seconds >= 0),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.interview_sessions enable row level security;

create index if not exists interview_sessions_user_idx
  on public.interview_sessions (user_id);

drop policy if exists "interview_sessions_select_own" on public.interview_sessions;
drop policy if exists "interview_sessions_insert_own" on public.interview_sessions;
drop policy if exists "interview_sessions_update_own" on public.interview_sessions;
drop policy if exists "interview_sessions_delete_own" on public.interview_sessions;

create policy "interview_sessions_select_own"
on public.interview_sessions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "interview_sessions_insert_own"
on public.interview_sessions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "interview_sessions_update_own"
on public.interview_sessions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "interview_sessions_delete_own"
on public.interview_sessions
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Explicit base grants for fresh databases (see 20260614330000).
grant select, insert, update, delete on public.interview_sessions to authenticated;
