-- Per-learner placement results (#125, ADR 0005). Stores the optional placement
-- assessment outcome per module so suggestions persist across sessions. This is
-- suggestion-only: it never locks content or writes durable mastery (mastery lives
-- in skill_events). Same per-user isolation pattern as attempts/reviews (RLS).
-- Idempotent.

create table if not exists public.placement_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  level text not null check (level in ('start_here', 'review_soon', 'probably_familiar')),
  correct integer not null,
  total integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, module_id)
);

alter table public.placement_results enable row level security;

create index if not exists placement_results_user_idx
  on public.placement_results (user_id, module_id);

-- Per-user isolation: a learner sees and manages only their own placement rows.
drop policy if exists "placement_results_select_own" on public.placement_results;
drop policy if exists "placement_results_insert_own" on public.placement_results;
drop policy if exists "placement_results_update_own" on public.placement_results;
drop policy if exists "placement_results_delete_own" on public.placement_results;

create policy "placement_results_select_own"
on public.placement_results
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "placement_results_insert_own"
on public.placement_results
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "placement_results_update_own"
on public.placement_results
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "placement_results_delete_own"
on public.placement_results
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Explicit base grants for fresh databases (see 20260614330000): placement
-- results are client-managed per-user rows under RLS (suggestions, not mastery),
-- so the learner may upsert and reset their own.
grant select, insert, update, delete on public.placement_results to authenticated;
