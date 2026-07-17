-- #612 Bind timed interview sessions to the immutable published content version.
--
-- SessionState stored only problemId, so a resumed session (or its judge
-- submission / prior-exposure evidence) could not tell which published version of
-- a user-created problem it used — the schema version stays 1 across every
-- publication. Add content_version_id (the user_content_versions.id the learner's
-- session was bound to; NULL for a native problem).
--
-- Backward compatible: the column is nullable and both the row writer and reader
-- default it to NULL, so a session started before this migration simply has no
-- version until the page re-derives one from the current publication.

alter table public.interview_sessions
  add column if not exists content_version_id uuid;

comment on column public.interview_sessions.content_version_id is
  'Immutable published content version this timed session is bound to (#612); NULL = native problem.';
