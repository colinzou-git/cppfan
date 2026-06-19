create or replace function public.complete_study_goal(
  p_goal_id uuid,
  p_expected_revision integer,
  p_submission_id uuid,
  p_reason text
)
returns table(result_goal_id uuid, result_revision_number integer, replayed boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_revision integer;
  v_status text;
  v_fingerprint text;
  v_receipt public.study_goal_mutation_receipts%rowtype;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if p_submission_id is null then raise exception 'submission_id_required'; end if;

  v_fingerprint := md5(concat_ws(':', 'complete', p_goal_id::text, p_expected_revision::text, coalesce(p_reason, '')));

  select r.* into v_receipt
  from public.study_goal_mutation_receipts r
  where r.user_id = v_user_id and r.submission_id = p_submission_id;

  if found then
    if v_receipt.mutation_kind <> 'complete' or v_receipt.request_fingerprint <> v_fingerprint then
      raise exception 'idempotency_conflict';
    end if;
    return query select v_receipt.goal_id, v_receipt.revision_number, true;
    return;
  end if;

  select g.current_revision, g.status into v_revision, v_status
  from public.study_goals g
  where g.id = p_goal_id and g.user_id = v_user_id
  for update;

  if not found then raise exception 'goal_not_found'; end if;
  if v_status <> 'active' then raise exception 'goal_not_active'; end if;
  if v_revision <> p_expected_revision then raise exception 'stale_goal_revision'; end if;

  update public.study_goals
  set status = 'completed', completed_at = now(), cancelled_at = null, updated_at = now()
  where id = p_goal_id and user_id = v_user_id;

  insert into public.study_goal_events (user_id, goal_id, revision_id, event_type, reason, metadata)
  select v_user_id, p_goal_id, r.id, 'completed', nullif(btrim(p_reason), ''),
         jsonb_build_object('revision_number', v_revision)
  from public.study_goal_revisions r
  where r.goal_id = p_goal_id and r.revision_number = v_revision;

  insert into public.study_goal_mutation_receipts (
    user_id, submission_id, mutation_kind, request_fingerprint, goal_id, revision_number
  ) values (
    v_user_id, p_submission_id, 'complete', v_fingerprint, p_goal_id, v_revision
  );

  return query select p_goal_id, v_revision, false;
end;
$$;

create or replace function public.reopen_study_goal(
  p_goal_id uuid,
  p_expected_revision integer,
  p_submission_id uuid,
  p_reason text
)
returns table(result_goal_id uuid, result_revision_number integer, replayed boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_revision integer;
  v_status text;
  v_fingerprint text;
  v_receipt public.study_goal_mutation_receipts%rowtype;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if p_submission_id is null then raise exception 'submission_id_required'; end if;

  v_fingerprint := md5(concat_ws(':', 'reopen', p_goal_id::text, p_expected_revision::text, coalesce(p_reason, '')));

  select r.* into v_receipt
  from public.study_goal_mutation_receipts r
  where r.user_id = v_user_id and r.submission_id = p_submission_id;

  if found then
    if v_receipt.mutation_kind <> 'reopen' or v_receipt.request_fingerprint <> v_fingerprint then
      raise exception 'idempotency_conflict';
    end if;
    return query select v_receipt.goal_id, v_receipt.revision_number, true;
    return;
  end if;

  select g.current_revision, g.status into v_revision, v_status
  from public.study_goals g
  where g.id = p_goal_id and g.user_id = v_user_id
  for update;

  if not found then raise exception 'goal_not_found'; end if;
  if v_status = 'active' then raise exception 'goal_already_active'; end if;
  if v_revision <> p_expected_revision then raise exception 'stale_goal_revision'; end if;

  update public.study_goals
  set status = 'active', completed_at = null, cancelled_at = null, updated_at = now()
  where id = p_goal_id and user_id = v_user_id;

  insert into public.study_goal_events (user_id, goal_id, revision_id, event_type, reason, metadata)
  select v_user_id, p_goal_id, r.id, 'reopened', nullif(btrim(p_reason), ''),
         jsonb_build_object('revision_number', v_revision, 'prior_status', v_status)
  from public.study_goal_revisions r
  where r.goal_id = p_goal_id and r.revision_number = v_revision;

  insert into public.study_goal_mutation_receipts (
    user_id, submission_id, mutation_kind, request_fingerprint, goal_id, revision_number
  ) values (
    v_user_id, p_submission_id, 'reopen', v_fingerprint, p_goal_id, v_revision
  );

  return query select p_goal_id, v_revision, false;
end;
$$;

revoke all on function public.complete_study_goal(uuid, integer, uuid, text) from public;
grant execute on function public.complete_study_goal(uuid, integer, uuid, text) to authenticated;
revoke all on function public.reopen_study_goal(uuid, integer, uuid, text) from public;
grant execute on function public.reopen_study_goal(uuid, integer, uuid, text) to authenticated;
