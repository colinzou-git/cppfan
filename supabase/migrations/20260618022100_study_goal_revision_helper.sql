-- Internal helper used only by trusted goal mutation functions.

create or replace function public.study_goal_insert_revision(
  p_user_id uuid,
  p_goal_id uuid,
  p_revision_number integer,
  p_start_local_date date,
  p_end_local_date date,
  p_timezone text,
  p_algorithm_version text,
  p_recommendation_source text,
  p_recommendation_reason text,
  p_learner_note text,
  p_targets jsonb
)
returns uuid
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_revision_id uuid;
  v_target jsonb;
  v_target_kind text;
  v_reference_id text;
  v_skill_id text;
  v_skill_title text;
  v_order_index integer;
  v_contract_id text;
  v_contract_version integer;
  v_source text;
  v_weight double precision;
  v_title_snapshot text;
begin
  if p_end_local_date < p_start_local_date
     or (p_end_local_date - p_start_local_date) not between 0 and 29 then
    raise exception 'invalid_goal_date_range';
  end if;

  if not exists (select 1 from pg_timezone_names where name = p_timezone) then
    raise exception 'invalid_goal_timezone';
  end if;

  if p_algorithm_version is null or char_length(btrim(p_algorithm_version)) < 1 then
    raise exception 'algorithm_version_required';
  end if;

  if p_recommendation_source not in ('manual', 'history_recommendation', 'placement', 'evaluation') then
    raise exception 'invalid_recommendation_source';
  end if;

  if jsonb_typeof(p_targets) <> 'array'
     or jsonb_array_length(p_targets) < 1
     or jsonb_array_length(p_targets) > 100 then
    raise exception 'invalid_goal_targets';
  end if;

  insert into public.study_goal_revisions (
    goal_id,
    user_id,
    revision_number,
    start_local_date,
    end_local_date,
    timezone,
    algorithm_version,
    recommendation_source,
    recommendation_reason,
    learner_note
  ) values (
    p_goal_id,
    p_user_id,
    p_revision_number,
    p_start_local_date,
    p_end_local_date,
    p_timezone,
    btrim(p_algorithm_version),
    p_recommendation_source,
    nullif(btrim(p_recommendation_reason), ''),
    nullif(btrim(p_learner_note), '')
  )
  returning id into v_revision_id;

  for v_target in select value from jsonb_array_elements(p_targets)
  loop
    if jsonb_typeof(v_target) <> 'object' then
      raise exception 'invalid_goal_target';
    end if;

    v_target_kind := v_target->>'targetKind';
    v_reference_id := btrim(coalesce(v_target->>'referenceId', ''));
    v_order_index := (v_target->>'orderIndex')::integer;
    v_contract_id := btrim(coalesce(v_target->>'acquisitionContractId', ''));
    v_contract_version := (v_target->>'acquisitionContractVersion')::integer;
    v_source := v_target->>'source';
    v_weight := coalesce((v_target->>'weight')::double precision, 1);

    if v_target_kind <> 'acquire_skill' then
      raise exception 'catalog_target_validation_required';
    end if;
    if v_reference_id = '' or v_order_index < 0 or v_contract_id = '' or v_contract_version < 1 or v_weight <= 0 then
      raise exception 'invalid_goal_target';
    end if;
    if v_source not in ('manual', 'history_recommendation', 'placement', 'evaluation') then
      raise exception 'invalid_goal_target_source';
    end if;

    select id, title into v_skill_id, v_skill_title
    from public.skills
    where id = v_reference_id and is_active = true;
    if v_skill_id is null then
      raise exception 'unknown_or_inactive_goal_skill';
    end if;

    v_title_snapshot := coalesce(nullif(btrim(v_target->>'titleSnapshot'), ''), v_skill_title);

    insert into public.study_goal_targets (
      goal_id,
      revision_id,
      user_id,
      target_kind,
      target_reference_id,
      skill_id,
      catalog_target_id,
      order_index,
      weight,
      acquisition_contract_id,
      acquisition_contract_version,
      source,
      baseline_acquisition_state,
      baseline_evidence_at,
      title_snapshot,
      catalog_version
    ) values (
      p_goal_id,
      v_revision_id,
      p_user_id,
      'acquire_skill',
      v_reference_id,
      v_skill_id,
      null,
      v_order_index,
      v_weight,
      v_contract_id,
      v_contract_version,
      v_source,
      coalesce(v_target->>'baselineAcquisitionState', 'not_started'),
      nullif(v_target->>'baselineEvidenceAt', '')::timestamptz,
      v_title_snapshot,
      nullif(v_target->>'catalogVersion', '')
    );
  end loop;

  return v_revision_id;
end;
$$;

revoke all on function public.study_goal_insert_revision(
  uuid, uuid, integer, date, date, text, text, text, text, text, jsonb
) from public, anon, authenticated;
