-- Harden #178 judge persistence after the foundation table migration.
-- Learners may read their own rows and enqueue bounded immutable metadata, but
-- only the isolated worker's service role may update authoritative results.

drop policy if exists "interview_judge_submissions_insert_own" on public.interview_judge_submissions;
drop policy if exists "interview_judge_submissions_update_own" on public.interview_judge_submissions;
drop policy if exists "interview_judge_submissions_delete_own" on public.interview_judge_submissions;

grant select on public.interview_judge_submissions to authenticated;
revoke insert, update, delete on public.interview_judge_submissions from anon, authenticated;

create or replace function public.enqueue_interview_judge_submission(p_submission jsonb)
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
    mode, task_kind, compiler, standard, source_hash, source_bytes,
    source_version, assistance_used, prior_solution_exposed, status, compiled,
    visible_passed, visible_total, hidden_passed, hidden_total
  ) values (
    v_user, v_submission_id, v_session_id, p_submission->>'problem_id',
    (p_submission->>'problem_version')::integer, p_submission->>'mode',
    p_submission->>'task_kind', p_submission->>'compiler', p_submission->>'standard',
    p_submission->>'source_hash', (p_submission->>'source_bytes')::integer,
    (p_submission->>'source_version')::integer,
    coalesce((p_submission->>'assistance_used')::boolean, false),
    coalesce((p_submission->>'prior_solution_exposed')::boolean, false),
    'queued', false, 0, (p_submission->>'visible_total')::integer,
    0, (p_submission->>'hidden_total')::integer
  );
  return 'queued';
end;
$$;

revoke all on function public.enqueue_interview_judge_submission(jsonb) from public;
grant execute on function public.enqueue_interview_judge_submission(jsonb) to authenticated;
