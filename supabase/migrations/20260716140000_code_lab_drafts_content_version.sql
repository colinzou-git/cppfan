-- #612 Bind Code Lab drafts to the immutable published content version.
--
-- User-created learning-item IDs are stable across published versions, so a
-- draft keyed only by (user, item) silently restores code written for an OLD
-- definition when the author republishes. Add content_version_id and key drafts
-- by (user, item, content_version_id) so each published version has its own
-- draft. Existing rows keep content_version_id = NULL: they are native/legacy
-- unversioned drafts, still recoverable and offered only as an explicit
-- "copy from previous version", never silently attached to a new version.
--
-- Backward compatible: the column is nullable and the code path degrades to
-- localStorage when it is absent, so publishing/editing works before this runs.

alter table public.code_lab_drafts
  add column if not exists content_version_id uuid;

-- Replace the (user_id, learning_item_id) uniqueness with a version-aware one.
-- NULLS NOT DISTINCT keeps at most one native/legacy (NULL-version) draft per
-- (user, item), matching the previous one-row-per-(user,item) behavior.
alter table public.code_lab_drafts
  drop constraint if exists code_lab_drafts_user_id_learning_item_id_key;

drop index if exists code_lab_drafts_user_item_idx;

create unique index if not exists code_lab_drafts_user_item_version_key
  on public.code_lab_drafts (user_id, learning_item_id, content_version_id) nulls not distinct;

-- Support the "latest draft for this item across versions" lookup.
create index if not exists code_lab_drafts_user_item_updated_idx
  on public.code_lab_drafts (user_id, learning_item_id, updated_at desc);

comment on column public.code_lab_drafts.content_version_id is
  'Immutable published content version this draft belongs to (#612); NULL = native/legacy unversioned draft.';
