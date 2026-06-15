-- Per-learner interview rubric self-scores (#179). Stores the latest learner
-- self-assessment (0-4) per rubric criterion so a post-session review/heat map can
-- be shown and fed to readiness reporting. Self-reported evidence under RLS,
-- separate from FSRS. Peer/automated sources are reserved by the source column.
-- Idempotent.

create table if not exists public.rubric_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  criterion text not null,
  source text not null default 'self'
    check (source in ('self', 'peer', 'automated')),
  score integer not null
    check (score >= 0 and score <= 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, criterion, source)
);

alter table public.rubric_scores enable row level security;

create index if not exists rubric_scores_user_idx
  on public.rubric_scores (user_id, criterion);

drop policy if exists "rubric_scores_select_own" on public.rubric_scores;
drop policy if exists "rubric_scores_insert_own" on public.rubric_scores;
drop policy if exists "rubric_scores_update_own" on public.rubric_scores;
drop policy if exists "rubric_scores_delete_own" on public.rubric_scores;

create policy "rubric_scores_select_own"
on public.rubric_scores
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "rubric_scores_insert_own"
on public.rubric_scores
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "rubric_scores_update_own"
on public.rubric_scores
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "rubric_scores_delete_own"
on public.rubric_scores
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Explicit base grants for fresh databases (see 20260614330000).
grant select, insert, update, delete on public.rubric_scores to authenticated;
