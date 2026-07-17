-- #613/#612 Key interview prior-exposure evidence by the immutable content version.
--
-- interview_evidence carried problem_version (the payload schema version, which
-- stays 1 across every publication), so a republished user problem looked "seen"
-- at its new version and transfer selection could not treat it as fresh. Add
-- content_version_id (the user_content_versions.id the session was bound to; NULL
-- for native problems) so prior-exposure is keyed by (problem, content version).
--
-- Backward compatible: nullable column; the reader/writer default it to NULL, so
-- existing evidence keeps working (treated as version-agnostic).

alter table public.interview_evidence
  add column if not exists content_version_id uuid;

comment on column public.interview_evidence.content_version_id is
  'Immutable published content version this evidence was recorded against (#613); NULL = native problem.';
