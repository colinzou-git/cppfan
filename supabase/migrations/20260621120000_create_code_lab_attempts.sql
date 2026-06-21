-- #407 Code Lab attempt history.
--
-- Stores a best-effort, append-only summary of each in-app C++ run/test/review
-- a signed-in learner makes. Run/Test still work signed-out and pre-migration;
-- this table only captures attempts when Supabase is configured and the learner
-- is authenticated. user_id is stamped from the session and enforced by RLS so
-- a learner can never read or write another learner's attempts.

create table if not exists public.code_lab_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_item_id text not null,
  source_code text not null,
  language text not null default 'cpp',
  run_status text not null,
  compile_output text,
  stdout text,
  stderr text,
  tests_passed integer,
  tests_total integer,
  ai_review_requested boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists code_lab_attempts_user_created_idx
  on public.code_lab_attempts(user_id, created_at desc);

create index if not exists code_lab_attempts_item_idx
  on public.code_lab_attempts(learning_item_id, created_at desc);

alter table public.code_lab_attempts enable row level security;

-- MVP needs only select/insert of one's own attempts; no update/delete path.
drop policy if exists "learners read own code lab attempts" on public.code_lab_attempts;
create policy "learners read own code lab attempts"
  on public.code_lab_attempts for select
  using (auth.uid() = user_id);

drop policy if exists "learners write own code lab attempts" on public.code_lab_attempts;
create policy "learners write own code lab attempts"
  on public.code_lab_attempts for insert
  with check (auth.uid() = user_id);

comment on table public.code_lab_attempts is
  'Append-only per-learner Code Lab (#407) run/test/review attempt summaries; RLS restricts rows to the owning learner.';
