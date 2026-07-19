-- Follow-up to #612: terminal interview history must retain the immutable
-- published definition used by the session. NULL means native or legacy
-- unversioned history; never backfill legacy user rows to the current version.

alter table public.interview_session_attempts
  add column if not exists content_version_id uuid;

alter table public.interview_session_code_revisions
  add column if not exists content_version_id uuid;

create index if not exists interview_session_attempts_user_problem_version_idx
  on public.interview_session_attempts(
    user_id,
    problem_id,
    content_version_id,
    completed_at desc
  );

create index if not exists interview_session_revisions_user_session_version_idx
  on public.interview_session_code_revisions(
    user_id,
    session_id,
    content_version_id,
    created_at desc
  );

comment on column public.interview_session_attempts.content_version_id is
  'Immutable user_content_versions.id used by this terminal session; NULL for native or legacy history.';

comment on column public.interview_session_code_revisions.content_version_id is
  'Immutable user_content_versions.id used when this revision was saved; NULL for native or legacy history.';
