-- #613 Owner-personal interview mock packs.
--
-- A learner can assemble their own mock from native + user-created problems. Each
-- selection stores the stable problem id, its source, and (for a custom item) the
-- immutable content version it was added at (#612), so a later republish / removal
-- is reconciled explicitly rather than silently substituting a different problem.
--
-- Additive and RLS-owned: /interview/mocks still renders the built-in packs
-- signed-out and pre-migration; this table only stores a learner's own packs.

create table if not exists public.personal_mock_packs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  -- [{ problemId, source: 'native'|'user', contentVersionId }]
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.personal_mock_packs enable row level security;

create index if not exists personal_mock_packs_user_updated_idx
  on public.personal_mock_packs (user_id, updated_at desc);

drop policy if exists "personal_mock_packs_select_own" on public.personal_mock_packs;
drop policy if exists "personal_mock_packs_insert_own" on public.personal_mock_packs;
drop policy if exists "personal_mock_packs_update_own" on public.personal_mock_packs;
drop policy if exists "personal_mock_packs_delete_own" on public.personal_mock_packs;
create policy "personal_mock_packs_select_own" on public.personal_mock_packs
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "personal_mock_packs_insert_own" on public.personal_mock_packs
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "personal_mock_packs_update_own" on public.personal_mock_packs
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "personal_mock_packs_delete_own" on public.personal_mock_packs
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.personal_mock_packs to authenticated;

comment on table public.personal_mock_packs is
  'Owner-personal interview mock packs (#613); items store problem id + source + immutable content version; RLS restricts rows to the owning learner.';
