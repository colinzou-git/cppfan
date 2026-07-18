-- #608: dynamic judge definitions for user-authored interview problems.
--
-- Two concerns, one atomic enqueue:
--   1. The learner-readable submissions row gains version identity
--      (content_version_id) and the definition source (native vs user), so a run
--      is bound to the immutable published version the learner saw — not the
--      payload schemaVersion, which stays 1 across republications.
--   2. The raw executable payload (learner source text + worker tests + fixture
--      stdin/expected output) is stored in a SEPARATE private table that no
--      learner may read or write. Only the service-role worker (which bypasses
--      RLS) may read it to compile and run the submission. This keeps hidden
--      fixtures and source out of every learner-facing boundary.

alter table public.interview_judge_submissions
  add column if not exists definition_source text not null default 'native'
    check (definition_source in ('native', 'user')),
  add column if not exists content_version_id uuid;

-- Worker-only execution payload. Deliberately NOT in the queue/submissions row:
-- source text and fixture I/O must never be learner-readable.
create table if not exists public.interview_judge_execution_payloads (
  submission_id uuid primary key
    references public.interview_judge_submissions(submission_id) on delete cascade,
  source_text text not null check (char_length(source_text) between 1 and 65536),
  worker_tests jsonb not null,
  fixtures jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.interview_judge_execution_payloads enable row level security;

-- No SELECT/INSERT/UPDATE/DELETE policies are defined for anon/authenticated, so
-- with RLS enabled they can do nothing. Also revoke table privileges outright so
-- the intent is explicit and defense-in-depth.
revoke all on public.interview_judge_execution_payloads from anon, authenticated;

-- Only the isolated worker (service role, which bypasses RLS) may read/manage the
-- raw payload. The enqueue path writes via the security-definer RPC below; this
-- grant is what lets the worker read the source + fixtures to compile and run.
grant select, insert, update, delete on public.interview_judge_execution_payloads to service_role;

-- Replace the enqueue RPC with a version-aware, payload-carrying variant. Both
-- inserts happen inside this single function invocation, so a submission row and
-- its private execution payload are committed together or not at all.
drop function if exists public.enqueue_interview_judge_submission(jsonb);

create or replace function public.enqueue_interview_judge_submission(
  p_submission jsonb,
  p_execution jsonb default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_submission_id uuid;
  v_session_id uuid;
  v_existing_user uuid;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  v_submission_id := (p_submission->>'submission_id')::uuid;
  v_session_id := nullif(p_submission->>'interview_session_id', '')::uuid;

  -- Serialize admission checks so concurrent submissions cannot overrun the
  -- documented global/user limits or race an idempotent replay.
  perform pg_advisory_xact_lock(hashtextextended('interview_judge_enqueue_global', 0));
  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));

  select user_id into v_existing_user
  from public.interview_judge_submissions
  where submission_id = v_submission_id;
  if found then
    if v_existing_user = v_user then return 'duplicate'; end if;
    raise exception 'idempotency conflict' using errcode = '23505';
  end if;

  if v_session_id is not null and not exists (
    select 1 from public.interview_sessions where id = v_session_id and user_id = v_user
  ) then
    raise exception 'invalid interview session' using errcode = '23503';
  end if;

  if char_length(coalesce(p_submission->>'problem_id', '')) not between 1 and 200
     or (p_submission->>'visible_total')::integer < 0
     or (p_submission->>'hidden_total')::integer < 0
     or (p_submission->>'visible_total')::integer + (p_submission->>'hidden_total')::integer > 200 then
    raise exception 'submission limits exceeded' using errcode = '22023';
  end if;

  if coalesce(p_submission->>'definition_source', 'native') not in ('native', 'user') then
    raise exception 'invalid definition source' using errcode = '22023';
  end if;

  if (select count(*) from public.interview_judge_submissions
      where user_id = v_user and status in ('queued', 'running')) >= 5 then
    raise exception 'per-user queue limit reached' using errcode = 'P0001';
  end if;
  if (select count(*) from public.interview_judge_submissions
      where user_id = v_user and created_at > now() - interval '1 minute') >= 20 then
    raise exception 'per-user rate limit reached' using errcode = 'P0001';
  end if;
  if (select count(*) from public.interview_judge_submissions
      where created_at > now() - interval '1 minute') >= 240 then
    raise exception 'global rate limit reached' using errcode = 'P0001';
  end if;

  insert into public.interview_judge_submissions (
    user_id, submission_id, interview_session_id, problem_id, problem_version,
    content_version_id, definition_source, mode, task_kind, compiler, standard,
    source_hash, source_bytes, source_version, assistance_used,
    prior_solution_exposed, status, compiled, visible_passed, visible_total,
    hidden_passed, hidden_total
  ) values (
    v_user, v_submission_id, v_session_id, p_submission->>'problem_id',
    (p_submission->>'problem_version')::integer,
    nullif(p_submission->>'content_version_id', '')::uuid,
    p_submission->>'definition_source', p_submission->>'mode',
    p_submission->>'task_kind', p_submission->>'compiler', p_submission->>'standard',
    p_submission->>'source_hash', (p_submission->>'source_bytes')::integer,
    (p_submission->>'source_version')::integer,
    coalesce((p_submission->>'assistance_used')::boolean, false),
    coalesce((p_submission->>'prior_solution_exposed')::boolean, false),
    'queued', false, 0, (p_submission->>'visible_total')::integer,
    0, (p_submission->>'hidden_total')::integer
  );

  -- Private worker payload (raw source + fixtures). Never learner-readable.
  if p_execution is not null then
    if char_length(coalesce(p_execution->>'source_text', '')) not between 1 and 65536 then
      raise exception 'invalid execution source' using errcode = '22023';
    end if;
    if jsonb_typeof(p_execution->'worker_tests') <> 'array'
       or jsonb_typeof(p_execution->'fixtures') <> 'array' then
      raise exception 'invalid execution payload' using errcode = '22023';
    end if;
    insert into public.interview_judge_execution_payloads (
      submission_id, source_text, worker_tests, fixtures
    ) values (
      v_submission_id, p_execution->>'source_text',
      p_execution->'worker_tests', p_execution->'fixtures'
    );
  end if;

  return 'queued';
end;
$$;

revoke all on function public.enqueue_interview_judge_submission(jsonb, jsonb) from public;
grant execute on function public.enqueue_interview_judge_submission(jsonb, jsonb) to authenticated;
