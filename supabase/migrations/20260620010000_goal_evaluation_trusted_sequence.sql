-- Make Goal Evaluation answers idempotent and keep adaptive sequence/model
-- decisions inside the trusted database boundary (#267).

alter table public.goal_evaluation_responses
  add column if not exists submission_id uuid;

create unique index if not exists goal_evaluation_response_submission_idx
  on public.goal_evaluation_responses (user_id, submission_id)
  where submission_id is not null;

alter table public.goal_evaluation_sessions
  add column if not exists expires_at timestamptz not null default (now() + interval '7 days'),
  add column if not exists timezone text not null default 'UTC',
  add column if not exists requested_goal_duration integer not null default 7
    check (requested_goal_duration between 1 and 30),
  add column if not exists prior_sources jsonb not null default '{}'::jsonb;

revoke all on public.goal_evaluation_sessions from anon, authenticated;
revoke all on public.goal_evaluation_responses from anon, authenticated;
revoke all on public.goal_evaluation_items from anon, authenticated;
grant select on public.goal_evaluation_sessions to authenticated;
grant select (
  id, session_id, user_id, submission_id, sequence_no, learning_item_id,
  module_id, primary_skill_id, difficulty_band, diagnostic_weight, item_type,
  responded_at
) on public.goal_evaluation_responses to authenticated;
grant select on public.goal_evaluation_items to anon, authenticated;

revoke execute on function public.submit_goal_evaluation_answer(uuid, integer, text, text, jsonb, jsonb)
  from authenticated;

create or replace function public.submit_goal_evaluation_answer(
  p_session_id uuid,
  p_expected_question_index integer,
  p_submission_id uuid,
  p_choice_id text
)
returns table(
  result_session_id uuid,
  result_item_id text,
  result_is_correct boolean,
  result_status text,
  result_current_item_id text,
  result_question_index integer,
  result_answer_count integer,
  replayed boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_session public.goal_evaluation_sessions%rowtype;
  v_existing public.goal_evaluation_responses%rowtype;
  v_item public.goal_evaluation_items%rowtype;
  v_is_correct boolean;
  v_new_count integer;
  v_status text;
  v_next_item text;
  v_findings jsonb := '[]'::jsonb;
  v_model_state jsonb := '{}'::jsonb;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if p_submission_id is null then raise exception 'submission_id_required'; end if;

  select response.* into v_existing
  from public.goal_evaluation_responses response
  where response.user_id = v_user_id and response.submission_id = p_submission_id;

  if found then
    if v_existing.session_id <> p_session_id
      or v_existing.sequence_no <> p_expected_question_index
      or v_existing.choice_id <> p_choice_id then
      raise exception 'idempotency_conflict';
    end if;
    select session.* into v_session
    from public.goal_evaluation_sessions session
    where session.id = p_session_id and session.user_id = v_user_id;
    return query select v_session.id, v_existing.learning_item_id,
      case when v_session.status = 'completed' then v_existing.is_correct else null end,
      v_session.status, v_session.current_item_id, v_session.question_index,
      v_session.answer_count, true;
    return;
  end if;

  select session.* into v_session
  from public.goal_evaluation_sessions session
  where session.id = p_session_id and session.user_id = v_user_id
  for update;

  if not found then raise exception 'evaluation_session_not_found'; end if;
  if v_session.status <> 'active' then raise exception 'evaluation_session_not_active'; end if;
  if v_session.expires_at <= now() then raise exception 'evaluation_session_expired'; end if;
  if v_session.question_index <> p_expected_question_index then raise exception 'stale_evaluation_question'; end if;
  if v_session.current_item_id is null then raise exception 'evaluation_question_missing'; end if;

  select choice.is_correct into v_is_correct
  from public.learning_item_choices choice
  where choice.id = p_choice_id and choice.learning_item_id = v_session.current_item_id;
  if not found then raise exception 'invalid_evaluation_choice'; end if;

  select item.* into v_item
  from public.goal_evaluation_items item
  where item.learning_item_id = v_session.current_item_id
    and item.goal_evaluation_eligible = true
    and item.retired_at is null
    and item.pool_version = v_session.item_pool_version;
  if not found then raise exception 'evaluation_item_unavailable'; end if;

  insert into public.goal_evaluation_responses (
    session_id, user_id, submission_id, sequence_no, learning_item_id, choice_id,
    is_correct, module_id, primary_skill_id, difficulty_band,
    diagnostic_weight, item_type
  ) values (
    v_session.id, v_user_id, p_submission_id, v_session.question_index,
    v_session.current_item_id, p_choice_id, v_is_correct, v_item.module_id,
    v_item.primary_skill_id, v_item.difficulty_band, v_item.diagnostic_weight,
    v_item.item_type
  );

  v_new_count := v_session.answer_count + 1;

  with module_stats as (
    select response.module_id,
      count(*)::integer as evidence_count,
      sum(case when response.is_correct then response.diagnostic_weight else 0 end)::numeric as correct_weight,
      sum(response.diagnostic_weight)::numeric as total_weight
    from public.goal_evaluation_responses response
    where response.session_id = v_session.id
    group by response.module_id
  )
  select jsonb_build_object(
    'algorithmVersion', v_session.algorithm_version,
    'responseCount', v_new_count,
    'modules', coalesce(jsonb_object_agg(stats.module_id, jsonb_build_object(
      'evidenceCount', stats.evidence_count,
      'estimateBand', greatest(1, least(5, round(1 + 4 * ((2 + stats.correct_weight) /
        greatest(4, 4 + stats.total_weight)))))::integer,
      'uncertainty', greatest(0.1, round((2.0 / sqrt(4 + stats.total_weight))::numeric, 3))
    )), '{}'::jsonb)
  ) into v_model_state
  from module_stats stats;

  if v_new_count >= 30 then
    with modules as (
      select distinct item.module_id
      from public.goal_evaluation_items item
      where item.pool_version = v_session.item_pool_version
    ), stats as (
      select response.module_id,
        count(*)::integer as evidence_count,
        count(distinct response.item_type)::integer as item_type_count,
        sum(case when response.is_correct then response.diagnostic_weight else 0 end)::numeric as correct_weight,
        sum(response.diagnostic_weight)::numeric as total_weight
      from public.goal_evaluation_responses response
      where response.session_id = v_session.id
      group by response.module_id
    ), findings as (
      select module.module_id,
        coalesce(stats.evidence_count, 0) as evidence_count,
        coalesce(stats.item_type_count, 0) as item_type_count,
        case when coalesce(stats.evidence_count, 0) >= 5 then 'high'
          when coalesce(stats.evidence_count, 0) >= 3 then 'medium' else 'low' end as confidence,
        greatest(1, least(5, round(1 + 4 * ((2 + coalesce(stats.correct_weight, 0)) /
          greatest(4, 4 + coalesce(stats.total_weight, 0))))))::integer as estimate_band,
        case
          when coalesce(stats.evidence_count, 0) < 2 then 'evidence_uncertain'
          when coalesce(stats.correct_weight, 0) / greatest(1, coalesce(stats.total_weight, 0)) >= 0.8
            then case when round(1 + 4 * ((2 + stats.correct_weight) / (4 + stats.total_weight))) >= 4
              then 'ready_to_advance' else 'probably_familiar' end
          when coalesce(stats.correct_weight, 0) / greatest(1, coalesce(stats.total_weight, 0)) >= 0.45
            then 'developing'
          else 'needs_prerequisite_support'
        end as finding_status,
        case when coalesce(stats.evidence_count, 0) < 3
          then 'LIMITED_EVIDENCE' else 'MULTIPLE_OBSERVATIONS' end as evidence_reason,
        case when coalesce(stats.correct_weight, 0) / greatest(1, coalesce(stats.total_weight, 0)) >= 0.8
          then 'CONSISTENT_SUCCESS'
          when coalesce(stats.correct_weight, 0) / greatest(1, coalesce(stats.total_weight, 0)) < 0.45
            then 'PREREQUISITE_GAPS' else 'MIXED_EVIDENCE' end as outcome_reason
      from modules module left join stats on stats.module_id = module.module_id
    )
    select coalesce(jsonb_agg(jsonb_build_object(
      'moduleId', finding.module_id,
      'status', finding.finding_status,
      'estimateBand', finding.estimate_band,
      'confidence', finding.confidence,
      'evidenceCount', finding.evidence_count,
      'itemTypeCount', finding.item_type_count,
      'reasonCodes', jsonb_build_array(finding.evidence_reason, finding.outcome_reason)
    ) order by finding.module_id), '[]'::jsonb)
    into v_findings from findings finding;

    update public.goal_evaluation_sessions
    set status = 'completed', current_item_id = null, answer_count = v_new_count,
      model_state = v_model_state,
      findings = v_findings, completed_at = now(), updated_at = now()
    where id = v_session.id;
    v_status := 'completed';
    v_next_item := null;
  else
    with response_stats as (
      select response.module_id,
        count(*)::integer as response_count,
        sum(case when response.is_correct then response.diagnostic_weight else 0 end)::numeric as correct_weight,
        sum(response.diagnostic_weight)::numeric as total_weight
      from public.goal_evaluation_responses response
      where response.session_id = v_session.id
      group by response.module_id
    ), last_response as (
      select response.* from public.goal_evaluation_responses response
      where response.session_id = v_session.id
      order by response.sequence_no desc limit 1
    ), candidates as (
      select candidate.*,
        coalesce(stats.response_count, 0) as module_count,
        1 + 4 * ((2 + coalesce(stats.correct_weight, 0)) /
          greatest(4, 4 + coalesce(stats.total_weight, 0))) as target_band,
        exists (select 1 from last_response last where last.module_id = candidate.module_id) as repeats_module,
        exists (select 1 from last_response last where last.item_type <> candidate.item_type) as adds_type,
        exists (select 1 from last_response last where last.is_correct
          and last.module_id = candidate.module_id and candidate.difficulty_band > last.difficulty_band) as probes_harder,
        exists (select 1 from last_response last where not last.is_correct
          and last.module_id = candidate.module_id and candidate.difficulty_band < last.difficulty_band) as probes_easier,
        exists (select 1 from public.goal_evaluation_responses prior
          where prior.session_id = v_session.id and prior.module_id = candidate.module_id) as module_covered
      from public.goal_evaluation_items candidate
      left join response_stats stats on stats.module_id = candidate.module_id
      where candidate.goal_evaluation_eligible = true
        and candidate.retired_at is null
        and candidate.pool_version = v_session.item_pool_version
        and not exists (select 1 from public.goal_evaluation_responses used
          where used.session_id = v_session.id and used.learning_item_id = candidate.learning_item_id)
        and (select count(*) from (
          select recent.primary_skill_id from public.goal_evaluation_responses recent
          where recent.session_id = v_session.id
          order by recent.sequence_no desc limit 2
        ) last_two where last_two.primary_skill_id = candidate.primary_skill_id) < 2
    )
    select candidate.learning_item_id into v_next_item
    from candidates candidate
    order by
      case when v_new_count < 7 and not candidate.module_covered then 0 else 1 end,
      case when v_new_count < 7 then abs(candidate.difficulty_band - 3) else 0 end,
      case when v_new_count >= 7 then
        24.0 / (candidate.module_count + 1)
        + greatest(0, 20 - abs(candidate.difficulty_band - candidate.target_band) * 6)
        + candidate.diagnostic_weight * 4
        + greatest(0, 12 - candidate.module_count * 3)
        + case when candidate.adds_type then 5 else 0 end
        - case when candidate.repeats_module then 7 else 0 end
        + case when candidate.probes_harder or candidate.probes_easier then 7 else 0 end
      else 0 end desc,
      candidate.module_id,
      candidate.learning_item_id
    limit 1;

    if v_next_item is null then raise exception 'evaluation_pool_exhausted'; end if;
    update public.goal_evaluation_sessions
    set current_item_id = v_next_item, question_index = v_session.question_index + 1,
      answer_count = v_new_count,
      model_state = v_model_state, updated_at = now()
    where id = v_session.id;
    v_status := 'active';
  end if;

  return query select v_session.id, v_session.current_item_id,
    case when v_status = 'completed' then v_is_correct else null end,
    v_status, v_next_item,
    case when v_status = 'completed' then 30 else v_session.question_index + 1 end,
    v_new_count, false;
end;
$$;

revoke all on function public.submit_goal_evaluation_answer(uuid, integer, uuid, text) from public;
grant execute on function public.submit_goal_evaluation_answer(uuid, integer, uuid, text) to authenticated;

revoke execute on function public.start_goal_evaluation(uuid, text, text, integer) from authenticated;

create or replace function public.start_goal_evaluation(
  p_submission_id uuid,
  p_algorithm_version text,
  p_item_pool_version integer
)
returns table(
  result_session_id uuid,
  result_current_item_id text,
  result_question_index integer,
  result_answer_count integer,
  replayed boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_session public.goal_evaluation_sessions%rowtype;
  v_initial_item_id text;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if p_submission_id is null then raise exception 'submission_id_required'; end if;

  select session.* into v_session
  from public.goal_evaluation_sessions session
  where session.user_id = v_user_id and session.status = 'active'
  order by session.updated_at desc limit 1 for update;

  if found and v_session.expires_at <= now() then
    update public.goal_evaluation_sessions
    set status = 'abandoned', current_item_id = null, abandoned_at = now(), updated_at = now()
    where id = v_session.id;
  elsif found then
    if not exists (
      select 1 from public.goal_evaluation_items item
      where item.learning_item_id = v_session.current_item_id
        and item.goal_evaluation_eligible = true and item.retired_at is null
        and item.pool_version = v_session.item_pool_version
    ) then
      select item.learning_item_id into v_initial_item_id
      from public.goal_evaluation_items item
      where item.goal_evaluation_eligible = true and item.retired_at is null
        and item.pool_version = v_session.item_pool_version
        and not exists (select 1 from public.goal_evaluation_responses response
          where response.session_id = v_session.id and response.learning_item_id = item.learning_item_id)
      order by abs(item.difficulty_band - 3), item.module_id, item.learning_item_id
      limit 1;
      if v_initial_item_id is null then raise exception 'evaluation_pool_exhausted'; end if;
      update public.goal_evaluation_sessions
      set current_item_id = v_initial_item_id,
        model_state = model_state || jsonb_build_object('replacementReason', 'retired_current_item'),
        updated_at = now()
      where id = v_session.id returning * into v_session;
    end if;
    return query select v_session.id, v_session.current_item_id,
      v_session.question_index, v_session.answer_count, true;
    return;
  end if;

  select session.* into v_session
  from public.goal_evaluation_sessions session
  where session.user_id = v_user_id and session.submission_id = p_submission_id;
  if found then
    return query select v_session.id, v_session.current_item_id,
      v_session.question_index, v_session.answer_count, true;
    return;
  end if;

  if (select count(*) from public.goal_evaluation_items item
      where item.goal_evaluation_eligible = true and item.retired_at is null
        and item.pool_version = p_item_pool_version) < 30 then
    raise exception 'evaluation_pool_insufficient';
  end if;

  select item.learning_item_id into v_initial_item_id
  from public.goal_evaluation_items item
  where item.goal_evaluation_eligible = true and item.retired_at is null
    and item.pool_version = p_item_pool_version
  order by abs(item.difficulty_band - 3), item.module_id, item.learning_item_id
  limit 1;
  if v_initial_item_id is null then raise exception 'evaluation_pool_insufficient'; end if;

  insert into public.goal_evaluation_sessions (
    user_id, submission_id, status, current_item_id, question_index, answer_count,
    algorithm_version, item_pool_version, expires_at, prior_sources, model_state
  ) values (
    v_user_id, p_submission_id, 'active', v_initial_item_id, 1, 0,
    p_algorithm_version, p_item_pool_version, now() + interval '7 days',
    jsonb_build_object('kind', 'neutral', 'boundedWeight', 0, 'capturedAt', now()),
    jsonb_build_object('algorithmVersion', p_algorithm_version, 'responseCount', 0, 'modules', '{}'::jsonb)
  ) returning * into v_session;

  return query select v_session.id, v_session.current_item_id,
    v_session.question_index, v_session.answer_count, false;
end;
$$;

revoke all on function public.start_goal_evaluation(uuid, text, integer) from public;
grant execute on function public.start_goal_evaluation(uuid, text, integer) to authenticated;
