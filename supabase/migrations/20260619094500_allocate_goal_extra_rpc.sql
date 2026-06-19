alter table public.study_goal_daily_allocations
  add column if not exists submission_id uuid,
  add column if not exists request_fingerprint text;

create unique index if not exists study_goal_daily_allocations_submission_idx
  on public.study_goal_daily_allocations (user_id, submission_id)
  where submission_id is not null;

create or replace function public.allocate_goal_extra(
  p_submission_id uuid,
  p_expected_daily_plan_version integer,
  p_local_plan_date date,
  p_timezone text,
  p_goal_id uuid,
  p_revision_id uuid,
  p_target_id uuid,
  p_action_id text,
  p_acquisition_step_id text,
  p_destination_kind text,
  p_destination_id text,
  p_algorithm_version text,
  p_acquisition_contract_version integer
)
returns table(result_allocation_id uuid, result_daily_plan_version integer, replayed boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_fingerprint text;
  v_existing public.study_goal_daily_allocations%rowtype;
  v_current_version integer;
  v_goal_status text;
  v_goal_revision integer;
  v_target_revision integer;
  v_target_contract integer;
  v_allocation_id uuid;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if p_submission_id is null then raise exception 'submission_id_required'; end if;
  if p_expected_daily_plan_version < 0 then raise exception 'invalid_daily_plan_version'; end if;
  if p_destination_kind <> 'learning_item' then raise exception 'invalid_extra_destination'; end if;

  v_fingerprint := md5(jsonb_build_object(
    'date', p_local_plan_date, 'timezone', p_timezone,
    'goal', p_goal_id, 'revision', p_revision_id, 'target', p_target_id,
    'action', p_action_id, 'step', p_acquisition_step_id,
    'destination_kind', p_destination_kind, 'destination_id', p_destination_id,
    'algorithm', p_algorithm_version, 'contract', p_acquisition_contract_version,
    'expected_version', p_expected_daily_plan_version
  )::text);

  select a.* into v_existing
  from public.study_goal_daily_allocations a
  where a.user_id = v_user_id and a.submission_id = p_submission_id;

  if found then
    if v_existing.request_fingerprint <> v_fingerprint then raise exception 'idempotency_conflict'; end if;
    return query select v_existing.id, v_existing.daily_plan_version, true;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    v_user_id::text || ':' || p_local_plan_date::text || ':' || p_timezone,
    0
  ));

  select coalesce(max(a.daily_plan_version), 0) into v_current_version
  from public.study_goal_daily_allocations a
  where a.user_id = v_user_id
    and a.local_plan_date = p_local_plan_date
    and a.timezone = p_timezone;

  if v_current_version <> p_expected_daily_plan_version then
    raise exception 'stale_daily_allocation_version';
  end if;

  select g.status, g.current_revision, r.revision_number, t.acquisition_contract_version
  into v_goal_status, v_goal_revision, v_target_revision, v_target_contract
  from public.study_goals g
  join public.study_goal_revisions r
    on r.id = p_revision_id and r.goal_id = g.id and r.user_id = v_user_id
  join public.study_goal_targets t
    on t.id = p_target_id and t.revision_id = r.id and t.goal_id = g.id and t.user_id = v_user_id
  where g.id = p_goal_id and g.user_id = v_user_id
  for update of g;

  if not found then raise exception 'goal_allocation_scope_invalid'; end if;
  if v_goal_status <> 'active' then raise exception 'goal_not_active'; end if;
  if v_goal_revision <> v_target_revision then raise exception 'stale_goal_revision'; end if;
  if v_target_contract <> p_acquisition_contract_version then raise exception 'stale_acquisition_contract'; end if;

  insert into public.study_goal_daily_allocations (
    user_id, local_plan_date, timezone, daily_plan_version,
    goal_id, revision_id, target_id, action_id, acquisition_step_id,
    source, destination_kind, destination_id, algorithm_version,
    acquisition_contract_version, submission_id, request_fingerprint
  ) values (
    v_user_id, p_local_plan_date, p_timezone, v_current_version + 1,
    p_goal_id, p_revision_id, p_target_id, p_action_id, p_acquisition_step_id,
    'learn_extra', p_destination_kind, p_destination_id, p_algorithm_version,
    p_acquisition_contract_version, p_submission_id, v_fingerprint
  ) returning id into v_allocation_id;

  return query select v_allocation_id, v_current_version + 1, false;
end;
$$;

revoke all on function public.allocate_goal_extra(uuid, integer, date, text, uuid, uuid, uuid, text, text, text, text, text, integer) from public;
grant execute on function public.allocate_goal_extra(uuid, integer, date, text, uuid, uuid, uuid, text, text, text, text, text, integer) to authenticated;
