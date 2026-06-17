-- Per-learner baseline diagnostic scores (#175 / #182). Stores the latest
-- self-assessed score (0..1) per diagnostic section so the baseline heat map can be
-- shown and later compared against current interview performance (the
-- diagnostic-baseline-vs-current readiness element). Self-reported evidence under
-- RLS, separate from FSRS. Idempotent.

create table if not exists public.diagnostic_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section_id text not null,
  score double precision not null
    check (score >= 0 and score <= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, section_id)
);

alter table public.diagnostic_scores enable row level security;

create index if not exists diagnostic_scores_user_idx
  on public.diagnostic_scores (user_id, section_id);

drop policy if exists "diagnostic_scores_select_own" on public.diagnostic_scores;
drop policy if exists "diagnostic_scores_insert_own" on public.diagnostic_scores;
drop policy if exists "diagnostic_scores_update_own" on public.diagnostic_scores;
drop policy if exists "diagnostic_scores_delete_own" on public.diagnostic_scores;

create policy "diagnostic_scores_select_own"
on public.diagnostic_scores
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "diagnostic_scores_insert_own"
on public.diagnostic_scores
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "diagnostic_scores_update_own"
on public.diagnostic_scores
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "diagnostic_scores_delete_own"
on public.diagnostic_scores
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Explicit base grants for fresh databases (see 20260614330000).
grant select, insert, update, delete on public.diagnostic_scores to authenticated;
