-- Per-learner interview practice evidence (#180). Append-only log of self-reported
-- session outcomes per problem: pattern, problem, first-seen/unseen status,
-- practice vs interview mode, correctness, hints used, and context (diagnostic,
-- guided, independent, or mock). This evidence is tracked SEPARATELY from FSRS and
-- feeds the dimension-level readiness report (recovery + transfer to unseen
-- problems), never problems-completed counts. Reads are bounded by an index on
-- (user_id, completed_at) so queries stay cheap as history grows. Idempotent.

create table if not exists public.interview_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pattern text not null,
  problem_id text not null,
  unseen boolean not null default false,
  mode text not null default 'practice'
    check (mode in ('practice', 'interview')),
  correct boolean not null default false,
  hints_used integer not null default 0
    check (hints_used >= 0),
  context text not null default 'independent'
    check (context in ('diagnostic', 'guided', 'independent', 'mock')),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.interview_evidence enable row level security;

create index if not exists interview_evidence_user_time_idx
  on public.interview_evidence (user_id, completed_at desc);

drop policy if exists "interview_evidence_select_own" on public.interview_evidence;
drop policy if exists "interview_evidence_insert_own" on public.interview_evidence;
drop policy if exists "interview_evidence_delete_own" on public.interview_evidence;

create policy "interview_evidence_select_own"
on public.interview_evidence
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "interview_evidence_insert_own"
on public.interview_evidence
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "interview_evidence_delete_own"
on public.interview_evidence
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Append-only log: no UPDATE policy. Explicit base grants for fresh databases
-- (see 20260614330000).
grant select, insert, delete on public.interview_evidence to authenticated;
