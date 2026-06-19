-- Append-only interview evidence records. Execution verification remains explicit;
-- these tables do not fabricate judge results or FSRS/mastery evidence.

create table if not exists public.interview_problem_exposures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  problem_version integer not null check (problem_version > 0),
  exposure_kind text not null check (
    exposure_kind in ('diagnostic', 'guided', 'practice', 'mock', 'solution_revealed')
  ),
  source_ref text not null,
  occurred_at timestamptz not null default now(),
  unique (user_id, source_ref, problem_id, problem_version, exposure_kind)
);

create index if not exists interview_problem_exposures_lookup_idx
  on public.interview_problem_exposures (user_id, problem_id, problem_version, occurred_at desc);

create table if not exists public.interview_follow_up_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  follow_up_id text not null,
  follow_up_version integer not null check (follow_up_version > 0),
  parent_problem_id text not null,
  parent_problem_version integer not null check (parent_problem_version > 0),
  reasoning_correct boolean not null,
  implementation_status text not null check (
    implementation_status in ('not_started', 'in_progress', 'completed', 'time_expired')
  ),
  explained_before_edit boolean not null,
  credit text not null check (credit in ('none', 'partial', 'full')),
  verification_class text not null default 'learner_attested' check (
    verification_class in ('learner_attested', 'trusted_server_reconciled')
  ),
  created_at timestamptz not null default now(),
  unique (user_id, session_id, follow_up_id, follow_up_version)
);

create index if not exists interview_follow_up_results_session_idx
  on public.interview_follow_up_results (user_id, session_id, created_at);

create table if not exists public.interview_mock_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_id uuid not null,
  pack_id text not null,
  pack_version integer not null check (pack_version > 0),
  started_at timestamptz not null,
  completed_at timestamptz,
  run_status text not null check (run_status in ('started', 'completed', 'abandoned')),
  unseen_at_start boolean not null,
  verification_class text not null default 'learner_attested' check (
    verification_class in ('learner_attested', 'trusted_server_reconciled')
  ),
  result_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, submission_id)
);

create index if not exists interview_mock_runs_recent_idx
  on public.interview_mock_runs (user_id, completed_at desc nulls last, started_at desc);

alter table public.interview_problem_exposures enable row level security;
alter table public.interview_follow_up_results enable row level security;
alter table public.interview_mock_runs enable row level security;

drop policy if exists "interview_problem_exposures_select_own" on public.interview_problem_exposures;
drop policy if exists "interview_problem_exposures_insert_own" on public.interview_problem_exposures;
create policy "interview_problem_exposures_select_own"
on public.interview_problem_exposures for select to authenticated
using ((select auth.uid()) = user_id);
create policy "interview_problem_exposures_insert_own"
on public.interview_problem_exposures for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "interview_follow_up_results_select_own" on public.interview_follow_up_results;
drop policy if exists "interview_follow_up_results_insert_own" on public.interview_follow_up_results;
create policy "interview_follow_up_results_select_own"
on public.interview_follow_up_results for select to authenticated
using ((select auth.uid()) = user_id);
create policy "interview_follow_up_results_insert_own"
on public.interview_follow_up_results for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "interview_mock_runs_select_own" on public.interview_mock_runs;
drop policy if exists "interview_mock_runs_insert_own" on public.interview_mock_runs;
create policy "interview_mock_runs_select_own"
on public.interview_mock_runs for select to authenticated
using ((select auth.uid()) = user_id);
create policy "interview_mock_runs_insert_own"
on public.interview_mock_runs for insert to authenticated
with check ((select auth.uid()) = user_id);

revoke all on public.interview_problem_exposures from anon;
revoke all on public.interview_follow_up_results from anon;
revoke all on public.interview_mock_runs from anon;
grant select, insert on public.interview_problem_exposures to authenticated;
grant select, insert on public.interview_follow_up_results to authenticated;
grant select, insert on public.interview_mock_runs to authenticated;
