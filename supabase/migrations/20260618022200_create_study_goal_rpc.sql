create or replace function public.create_study_goal(
  p_submission_id uuid,
  p_title text,
  p_start_local_date date,
  p_end_local_date date,
  p_timezone text,
  p_algorithm_version text,
  p_recommendation_source text,
  p_recommendation_reason text,
  p_learner_note text,
  p_targets jsonb
)
returns table(result_goal_id uuid, result_revision_number integer, replayed boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_goal_id uuid;
  v_revision_id uuid;
  v_fingerprint text;
  v_receipt public.study_goal_mutation_receipts%rowtype;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if p_submission_id is null then raise exception 'submission_id_required'; end if;
  if char_length(btrim(coalesce(p_title, ''))) not between 2 and 120 then
    raise exception 'invalid_goal_title';
  end if;

  v_fingerprint := md5(jsonb_build_object(
    'mutation', 'create', 'title', btrim(p_title),
    'start', p_start_local_date, 'end', p_end_local_date,
    'timezone', p_timezone, 'algorithm', p_algorithm_version,
    'source', p_recommendation_source, 'reason', p_recommendation_reason,
    'note', p_learner_note, 'targets', p_targets
  )::text);

  select r.* into v_receipt
  from public.study_goal_mutation_receipts r
  where r.user_id = v_user_id and r.submission_id = p_submission_id;

  if found then
    if v_receipt.mutation_kind <> 'create' or v_receipt.request_fingerprint <> v_fingerprint then
      raise exception 'idempotency_conflict';
    end if;
    return query select v_receipt.goal_id, v_receipt.revision_number, true;
    return;
  end if;

  insert into public.study_goals (user_id, title, status, current_revision)
  values (v_user_id, btrim(p_title), 'active', 1)
  returning id into v_goal_id;

  v_revision_id := public.study_goal_insert_revision(
    v_user_id, v_goal_id, 1,
    p_start_local_date, p_end_local_date, p_timezone,
    p_algorithm_version, p_recommendation_source,
    p_recommendation_reason, p_learner_note, p_targets
  );

  insert into public.study_goal_events (
    user_id, goal_id, revision_id, event_type, reason, metadata
  ) values (
    v_user_id, v_goal_id, v_revision_id, 'created',
    nullif(btrim(p_recommendation_reason), ''),
    jsonb_build_object('revision_number', 1, 'algorithm_version', p_algorithm_version)
  );

  insert into public.study_goal_mutation_receipts (
    user_id, submission_id, mutation_kind, request_fingerprint, goal_id, revision_number
  ) values (
    v_user_id, p_submission_id, 'create', v_fingerprint, v_goal_id, 1
  );

  return query select v_goal_id, 1, false;
exception
  when unique_violation then
    select r.* into v_receipt
    from public.study_goal_mutation_receipts r
    where r.user_id = v_user_id and r.submission_id = p_submission_id;
    if found and v_receipt.mutation_kind = 'create' and v_receipt.request_fingerprint = v_fingerprint then
      return query select v_receipt.goal_id, v_receipt.revision_number, true;
      return;
    end if;
    raise;
end;
$$;

revoke all on function public.create_study_goal(uuid, text, date, date, text, text, text, text, text, jsonb) from public;
grant execute on function public.create_study_goal(uuid, text, date, date, text, text, text, text, text, jsonb) to authenticated;
