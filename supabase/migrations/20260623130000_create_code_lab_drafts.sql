-- #431 Code Lab in-progress drafts.
--
-- Stores the single latest in-progress source per learner per code-capable item
-- so a learner can leave a Code Lab and resume the same code on any device.
-- Unlike code_lab_attempts (append-only run history), this is a mutable, one-row
-- per (user, item) draft that the editor upserts as the learner types. Drafts
-- only persist when Supabase is configured and the learner is authenticated;
-- signed-out / offline editing falls back to browser localStorage in the client.
-- user_id is stamped from the session and enforced by RLS so a learner can never
-- read or write another learner's drafts.

create table if not exists public.code_lab_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_item_id text not null,
  source_code text not null,
  language text not null default 'cpp',
  updated_at timestamptz not null default now(),
  unique (user_id, learning_item_id)
);

create index if not exists code_lab_drafts_user_item_idx
  on public.code_lab_drafts(user_id, learning_item_id);

alter table public.code_lab_drafts enable row level security;

-- Drafts are mutable, so unlike attempts the learner needs the full CRUD set —
-- always scoped to their own rows.
drop policy if exists "learners read own code lab drafts" on public.code_lab_drafts;
create policy "learners read own code lab drafts"
  on public.code_lab_drafts for select
  using (auth.uid() = user_id);

drop policy if exists "learners insert own code lab drafts" on public.code_lab_drafts;
create policy "learners insert own code lab drafts"
  on public.code_lab_drafts for insert
  with check (auth.uid() = user_id);

drop policy if exists "learners update own code lab drafts" on public.code_lab_drafts;
create policy "learners update own code lab drafts"
  on public.code_lab_drafts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "learners delete own code lab drafts" on public.code_lab_drafts;
create policy "learners delete own code lab drafts"
  on public.code_lab_drafts for delete
  using (auth.uid() = user_id);

comment on table public.code_lab_drafts is
  'Per-learner in-progress Code Lab (#431) source drafts, one row per (user, item); RLS restricts rows to the owning learner.';
