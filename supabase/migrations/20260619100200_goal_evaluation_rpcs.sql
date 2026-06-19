create or replace function public.start_goal_evaluation(
  p_submission_id uuid,
  p_initial_item_id text,
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
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if p_submission_id is null then raise exception 'submission_id_required'; end if;

  select s.* into v_session
  from public.goal_evaluation_sessions s
  where s.user_id = v_user_id and s.status = 'active'
  order by s.updated_at desc
  limit 1
  for update;

  if found then
    return query select v_session.id, v_session.current_item_id, v_session.question_index, v_session.answer_count, true;
    return;
  end if;

  select s.* into v_session
  from public.goal_evaluation_sessions s
  where s.user_id = v_user_id and s.submission_id = p_submission_id;

  if found then
    return query select v_session.id, v_session.current_item_id, v_session.question_index, v_session.answer_count, true;
    return;
  end if;

  if not exists (
    select 1 from public.goal_evaluation_items item
    where item.learning_item_id = p_initial_item_id
      and item.goal_evaluation_eligible = true
      and item.retired_at is null
      and item.pool_version = p_item_pool_version
  ) then
    raise exception 'evaluation_item_unavailable';
  end if;

  insert into public.goal_evaluation_sessions (
    user_id, submission_id, status, current_item_id, question_index, answer_count,
    algorithm_version, item_pool_version
  ) values (
    v_user_id, p_submission_id, 'active', p_initial_item_id, 1, 0,
    p_algorithm_version, p_item_pool_version
  ) returning * into v_session;

  return query select v_session.id, v_session.current_item_id, v_session.question_index, v_session.answer_count, false;
end;
$$;

create or replace function public.submit_goal_evaluation_answer(
  p_session_id uuid,
  p_expected_question_index integer,
  p_choice_id text,
  p_next_item_id text,
  p_model_state jsonb,
  p_findings jsonb
)
returns table(
  result_session_id uuid,
  result_item_id text,
  result_is_correct boolean,
  result_status text,
  result_current_item_id text,
  result_question_index integer,
  result_answer_count integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_session public.goal_evaluation_sessions%rowtype;
  v_item public.goal_evaluation_items%rowtype;
  v_is_correct boolean;
  v_new_count integer;
  v_status text;
  v_next_item text;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;

  select s.* into v_session
  from public.goal_evaluation_sessions s
  where s.id = p_session_id and s.user_id = v_user_id
  for update;

  if not found then raise exception 'evaluation_session_not_found'; end if;
  if v_session.status <> 'active' then raise exception 'evaluation_session_not_active'; end if;
  if v_session.question_index <> p_expected_question_index then raise exception 'stale_evaluation_question'; end if;
  if v_session.current_item_id is null then raise exception 'evaluation_question_missing'; end if;

  select choice.is_correct into v_is_correct
  from public.learning_item_choices choice
  where choice.id = p_choice_id
    and choice.learning_item_id = v_session.current_item_id;

  if not found then raise exception 'invalid_evaluation_choice'; end if;

  select item.* into v_item
  from public.goal_evaluation_items item
  where item.learning_item_id = v_session.current_item_id
    and item.goal_evaluation_eligible = true
    and item.retired_at is null;

  if not found then raise exception 'evaluation_item_unavailable'; end if;

  v_new_count := v_session.answer_count + 1;

  insert into public.goal_evaluation_responses (
    session_id, user_id, sequence_no, learning_item_id, choice_id, is_correct,
    module_id, primary_skill_id, difficulty_band, diagnostic_weight, item_type
  ) values (
    v_session.id, v_user_id, v_session.question_index, v_session.current_item_id,
    p_choice_id, v_is_correct, v_item.module_id, v_item.primary_skill_id,
    v_item.difficulty_band, v_item.diagnostic_weight, v_item.item_type
  );

  if v_new_count >= 30 then
    update public.goal_evaluation_sessions
    set status = 'completed', current_item_id = null, answer_count = v_new_count,
        model_state = coalesce(p_model_state, '{}'::jsonb),
        findings = coalesce(p_findings, '[]'::jsonb), completed_at = now(), updated_at = now()
    where id = v_session.id;
    v_status := 'completed';
    v_next_item := null;
  else
    if p_next_item_id is null or p_next_item_id = '' then raise exception 'next_evaluation_item_required'; end if;
    if p_next_item_id = v_session.current_item_id then raise exception 'duplicate_evaluation_item'; end if;
    if exists (
      select 1 from public.goal_evaluation_responses response
      where response.session_id = v_session.id and response.learning_item_id = p_next_item_id
    ) then raise exception 'duplicate_evaluation_item'; end if;
    if not exists (
      select 1 from public.goal_evaluation_items item
      where item.learning_item_id = p_next_item_id
        and item.goal_evaluation_eligible = true
        and item.retired_at is null
        and item.pool_version = v_session.item_pool_version
    ) then raise exception 'next_evaluation_item_unavailable'; end if;

    update public.goal_evaluation_sessions
    set current_item_id = p_next_item_id, question_index = v_session.question_index + 1,
        answer_count = v_new_count, model_state = coalesce(p_model_state, '{}'::jsonb), updated_at = now()
    where id = v_session.id;
    v_status := 'active';
    v_next_item := p_next_item_id;
  end if;

  return query select v_session.id, v_session.current_item_id, v_is_correct, v_status,
    v_next_item, case when v_status = 'completed' then 30 else v_session.question_index + 1 end, v_new_count;
end;
$$;

create or replace function public.abandon_goal_evaluation(p_session_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  update public.goal_evaluation_sessions
  set status = 'abandoned', current_item_id = null, abandoned_at = now(), updated_at = now()
  where id = p_session_id and user_id = v_user_id and status = 'active';
  return found;
end;
$$;

revoke all on function public.start_goal_evaluation(uuid, text, text, integer) from public;
grant execute on function public.start_goal_evaluation(uuid, text, text, integer) to authenticated;
revoke all on function public.submit_goal_evaluation_answer(uuid, integer, text, text, jsonb, jsonb) from public;
grant execute on function public.submit_goal_evaluation_answer(uuid, integer, text, text, jsonb, jsonb) to authenticated;
revoke all on function public.abandon_goal_evaluation(uuid) from public;
grant execute on function public.abandon_goal_evaluation(uuid) to authenticated;
