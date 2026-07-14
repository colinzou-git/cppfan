-- #487 Phase 1: ownership/source columns on the native projection tables.
--
-- Published user content will materialize as owner-scoped rows in the existing
-- public.skills and public.learning_items tables so the whole learning loop
-- (mastery, events, review, goals, recommendations) can reuse the current text
-- foreign keys instead of learning arbitrary JSON. This slice only adds the
-- nullable ownership/source columns and tightens the read policies so a user row
-- is visible only to its owner; the trusted publish RPC that writes these rows
-- lands in the next slice.
--
-- Native rows keep owner_user_id NULL and source_kind 'native', so anon and
-- authenticated readers see them exactly as before. While no user rows exist,
-- the new read predicate is equivalent to the old `is_active = true`.

alter table public.skills
  add column if not exists owner_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists content_item_id uuid references public.user_content_items(id) on delete cascade,
  add column if not exists content_version_id uuid references public.user_content_versions(id) on delete restrict,
  add column if not exists source_kind text not null default 'native'
    check (source_kind in ('native', 'user'));

alter table public.learning_items
  add column if not exists owner_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists content_item_id uuid references public.user_content_items(id) on delete cascade,
  add column if not exists content_version_id uuid references public.user_content_versions(id) on delete restrict,
  add column if not exists source_kind text not null default 'native'
    check (source_kind in ('native', 'user'));

create index if not exists skills_owner_idx
  on public.skills (owner_user_id) where owner_user_id is not null;
create index if not exists learning_items_owner_idx
  on public.learning_items (owner_user_id) where owner_user_id is not null;
create index if not exists skills_content_item_idx
  on public.skills (content_item_id) where content_item_id is not null;
create index if not exists learning_items_content_item_idx
  on public.learning_items (content_item_id) where content_item_id is not null;

-- Tighten read policies: native rows stay public; a user row is readable only by
-- its owner. anon has auth.uid() = NULL, so it only ever sees owner-null rows.
drop policy if exists "skills_read_all" on public.skills;
create policy "skills_read_all"
  on public.skills
  for select
  to anon, authenticated
  using (is_active = true and (owner_user_id is null or owner_user_id = auth.uid()));

drop policy if exists "learning_items_read_all" on public.learning_items;
create policy "learning_items_read_all"
  on public.learning_items
  for select
  to anon, authenticated
  using (is_active = true and (owner_user_id is null or owner_user_id = auth.uid()));

comment on column public.skills.owner_user_id is
  'NULL for native seed skills; set to the owning user for a projected user-created skill (#487).';
comment on column public.learning_items.owner_user_id is
  'NULL for native seed items; set to the owning user for a projected user-created item (#487).';
