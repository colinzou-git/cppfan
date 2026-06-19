-- Durable, per-learner C++ judge submission records for #178. This table stores
-- metadata and structured results only: no source text and no hidden fixtures.
-- Learner-owned rows are protected by RLS; worker/service-role processing can
-- be added later without changing the learner privacy boundary.

create table if not exists public.interview_judge_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_id uuid not null unique,
  interview_session_id uuid references public.interview_sessions(id) on delete set null,
  problem_id text not null,
  problem_version integer not null check (problem_version > 0),
  mode text not null check (mode in ('practice', 'interview')),
  task_kind text not null check (task_kind in ('compile_only', 'compile_and_run')),
  compiler text not null check (compiler in ('gcc', 'clang')),
  standard text not null check (standard in ('c++17', 'c++20')),
  source_hash text not null check (char_length(source_hash) between 32 and 128),
  source_bytes integer not null check (source_bytes > 0 and source_bytes <= 65536),
  source_version integer not null default 1 check (source_version > 0),
  assistance_used boolean not null default false,
  prior_solution_exposed boolean not null default false,
  status text not null default 'queued' check (
    status in (
      'queued',
      'running',
      'canceled',
      'accepted',
      'wrong_answer',
      'compile_error',
      'runtime_error',
      'timeout',
      'memory_limit',
      'infrastructure_error'
    )
  ),
  compiled boolean not null default false,
  visible_passed integer not null default 0 check (visible_passed >= 0),
  visible_total integer not null default 0 check (visible_total >= 0),
  hidden_passed integer not null default 0 check (hidden_passed >= 0),
  hidden_total integer not null default 0 check (hidden_total >= 0),
  runtime_ms integer check (runtime_ms is null or runtime_ms >= 0),
  memory_mb integer check (memory_mb is null or memory_mb >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (visible_passed <= visible_total),
  check (hidden_passed <= hidden_total)
);

alter table public.interview_judge_submissions enable row level security;

create index if not exists interview_judge_submissions_user_status_idx
  on public.interview_judge_submissions (user_id, status, updated_at desc);

create index if not exists interview_judge_submissions_user_problem_idx
  on public.interview_judge_submissions (user_id, problem_id, updated_at desc);

drop policy if exists "interview_judge_submissions_select_own" on public.interview_judge_submissions;
drop policy if exists "interview_judge_submissions_insert_own" on public.interview_judge_submissions;
drop policy if exists "interview_judge_submissions_update_own" on public.interview_judge_submissions;
drop policy if exists "interview_judge_submissions_delete_own" on public.interview_judge_submissions;

create policy "interview_judge_submissions_select_own"
on public.interview_judge_submissions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "interview_judge_submissions_insert_own"
on public.interview_judge_submissions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "interview_judge_submissions_update_own"
on public.interview_judge_submissions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "interview_judge_submissions_delete_own"
on public.interview_judge_submissions
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.interview_judge_submissions to authenticated;
