-- #612 Bind Code Lab attempts to the immutable published content version and the
-- active lab milestone.
--
-- code_lab_attempts recorded the item and test summary but not which immutable
-- definition the attempt was made against, so history mixed attempts from
-- incompatible published versions and a version-aware pass query was impossible.
-- Add content_version_id (the user_content_versions.id the browser loaded and the
-- server validated; NULL for native items) and milestone_index (the active lab
-- checkpoint; NULL for non-lab attempts).
--
-- Backward compatible: both columns are nullable and the writer degrades
-- gracefully when they are absent, so Run/Test keep working pre-migration.

alter table public.code_lab_attempts
  add column if not exists content_version_id uuid;

alter table public.code_lab_attempts
  add column if not exists milestone_index integer;

-- Support version-aware "has the learner passed the CURRENT version?" queries.
create index if not exists code_lab_attempts_item_version_idx
  on public.code_lab_attempts (learning_item_id, content_version_id, created_at desc);

comment on column public.code_lab_attempts.content_version_id is
  'Immutable published content version this attempt ran against (#612); NULL = native item.';
comment on column public.code_lab_attempts.milestone_index is
  'Active lab milestone index for the attempt (#612); NULL = not a milestone lab attempt.';
