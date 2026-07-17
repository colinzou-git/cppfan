-- #610 Durable per-milestone progress for user-created labs.
--
-- LabWorkspace kept milestone passes only in React state, so every checkmark
-- disappeared on reload and the app could not say when/against which version a
-- milestone was completed. This stores one row per milestone pass, keyed by the
-- stable milestone id and the immutable content version (#612), so progress
-- survives reload and never reinterprets an old-version pass as current.
--
-- Additive and RLS-owned: /lab still renders signed-out and pre-migration (the
-- writer/reader degrade to in-session-only). A learner can never read or write
-- another learner's milestone progress.

create table if not exists public.user_lab_milestone_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_item_id text not null,
  content_version_id uuid,
  milestone_id text not null,
  milestone_index integer,
  status text not null default 'passed' check (status in ('passed')),
  evaluation_method text,
  code_snapshot_hash text,
  passed_at timestamptz not null default now()
);

-- One row per (learner, item, version, milestone). NULLS NOT DISTINCT so a
-- native/legacy null version still has a single row per milestone.
create unique index if not exists user_lab_milestone_progress_key
  on public.user_lab_milestone_progress (user_id, learning_item_id, content_version_id, milestone_id)
  nulls not distinct;

create index if not exists user_lab_milestone_progress_item_version_idx
  on public.user_lab_milestone_progress (user_id, learning_item_id, content_version_id);

alter table public.user_lab_milestone_progress enable row level security;

drop policy if exists "user_lab_milestone_progress_select_own" on public.user_lab_milestone_progress;
drop policy if exists "user_lab_milestone_progress_insert_own" on public.user_lab_milestone_progress;
drop policy if exists "user_lab_milestone_progress_update_own" on public.user_lab_milestone_progress;
create policy "user_lab_milestone_progress_select_own" on public.user_lab_milestone_progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "user_lab_milestone_progress_insert_own" on public.user_lab_milestone_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "user_lab_milestone_progress_update_own" on public.user_lab_milestone_progress
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.user_lab_milestone_progress to authenticated;

comment on table public.user_lab_milestone_progress is
  'Per-learner durable pass of a user-lab milestone (#610), keyed by stable milestone id + immutable content version (#612); RLS restricts rows to the owning learner.';
