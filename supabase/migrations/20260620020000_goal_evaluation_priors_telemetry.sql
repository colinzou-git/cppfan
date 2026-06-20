-- Complete #267's bounded learner prior, requested-goal context, and separate
-- Evaluation lifecycle telemetry without adding mastery-bearing skill events.

create table if not exists public.goal_evaluation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.goal_evaluation_sessions(id) on delete cascade,
  response_id uuid references public.goal_evaluation_responses(id) on delete cascade,
  event_name text not null check (event_name in (
    'goal_evaluation_started', 'goal_evaluation_answered',
    'goal_evaluation_resumed', 'goal_evaluation_abandoned',
    'goal_evaluation_completed', 'goal_evaluation_recommendations_viewed'
  )),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists goal_evaluation_events_user_created_idx
  on public.goal_evaluation_events (user_id, created_at desc);
create unique index if not exists goal_evaluation_event_response_idx
  on public.goal_evaluation_events (response_id, event_name) where response_id is not null;
create unique index if not exists goal_evaluation_recommendations_viewed_idx
  on public.goal_evaluation_events (session_id, event_name)
  where event_name = 'goal_evaluation_recommendations_viewed';

alter table public.goal_evaluation_events enable row level security;
drop policy if exists "goal_evaluation_events_read_own" on public.goal_evaluation_events;
create policy "goal_evaluation_events_read_own" on public.goal_evaluation_events
for select to authenticated using (user_id = auth.uid());
revoke all on public.goal_evaluation_events from anon, authenticated;
grant select on public.goal_evaluation_events to authenticated;

create or replace function public.build_goal_evaluation_prior_sources(
  p_user_id uuid,
  p_item_pool_version integer
)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with evidence as (
    select item.module_id,
      case when attempt.is_correct then
        item.diagnostic_weight * case when attempt.created_at >= now() - interval '90 days' then 0.5 else 0.15 end
        else 0 end::numeric as correct_weight,
      case when not attempt.is_correct then
        item.diagnostic_weight * case when attempt.created_at >= now() - interval '90 days' then 0.5 else 0.15 end
        else 0 end::numeric as incorrect_weight,
      attempt.created_at as evidence_at,
      case when attempt.created_at >= now() - interval '90 days' then 'recent_learning' else 'older_learning' end as source
    from public.learning_item_attempts attempt
    join public.goal_evaluation_items item on item.learning_item_id = attempt.learning_item_id
    where attempt.user_id = p_user_id and item.pool_version = p_item_pool_version
      and attempt.created_at >= now() - interval '365 days'
    union all
    select placement.module_id,
      (placement.correct::numeric / greatest(1, placement.total)) * 1.0,
      ((placement.total - placement.correct)::numeric / greatest(1, placement.total)) * 1.0,
      placement.updated_at,
      'placement'
    from public.placement_results placement
    where placement.user_id = p_user_id
    union all
    select item.module_id,
      case when log.rating in ('good', 'easy') then 0.35 when log.rating = 'hard' then 0.15 else 0 end,
      case when log.rating = 'again' then 0.35 when log.rating = 'hard' then 0.15 else 0 end,
      log.reviewed_at,
      'recent_review'
    from public.review_logs log
    join public.review_cards card on card.id = log.review_card_id and card.user_id = p_user_id
    join public.goal_evaluation_items item on item.learning_item_id = card.learning_item_id
    where log.user_id = p_user_id and log.reviewed_at >= now() - interval '90 days'
      and item.pool_version = p_item_pool_version
  ), totals as (
    select module_id, sum(correct_weight)::numeric as correct_weight,
      sum(incorrect_weight)::numeric as incorrect_weight,
      max(evidence_at) as latest_at,
      array_agg(distinct source order by source) as sources
    from evidence group by module_id
  ), bounded as (
    select module_id,
      round(correct_weight * least(1, 2 / greatest(0.001, correct_weight + incorrect_weight)), 3) as correct_weight,
      round(incorrect_weight * least(1, 2 / greatest(0.001, correct_weight + incorrect_weight)), 3) as incorrect_weight,
      latest_at, sources
    from totals
  ), exposed as (
    select coalesce(jsonb_agg(distinct attempt.learning_item_id), '[]'::jsonb) as item_ids
    from public.learning_item_attempts attempt
    where attempt.user_id = p_user_id and attempt.created_at >= now() - interval '180 days'
  )
  select jsonb_build_object(
    'capturedAt', now(),
    'policy', 'bounded-prior-v1',
    'maxWeightPerModule', 2,
    'modules', coalesce((select jsonb_object_agg(module_id, jsonb_build_object(
      'correctWeight', correct_weight,
      'incorrectWeight', incorrect_weight,
      'latestAt', latest_at,
      'sources', to_jsonb(sources)
    )) from bounded), '{}'::jsonb),
    'recentExposureItemIds', (select item_ids from exposed),
    'fallback', case when exists (select 1 from bounded) then 'evidence' else 'neutral' end
  );
$$;

revoke all on function public.build_goal_evaluation_prior_sources(uuid, integer) from public;

create or replace function public.goal_evaluation_response_event()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.goal_evaluation_events (user_id, session_id, response_id, event_name, metadata)
  values (new.user_id, new.session_id, new.id, 'goal_evaluation_answered',
    jsonb_build_object('sequenceNo', new.sequence_no, 'itemType', new.item_type));
  return new;
end;
$$;

drop trigger if exists record_goal_evaluation_answered on public.goal_evaluation_responses;
create trigger record_goal_evaluation_answered after insert on public.goal_evaluation_responses
for each row execute function public.goal_evaluation_response_event();

create or replace function public.goal_evaluation_session_event()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if old.status = 'active' and new.status = 'completed' then
    insert into public.goal_evaluation_events (user_id, session_id, event_name, metadata)
    values (new.user_id, new.id, 'goal_evaluation_completed', jsonb_build_object('answerCount', new.answer_count));
  elsif old.status = 'active' and new.status = 'abandoned' then
    insert into public.goal_evaluation_events (user_id, session_id, event_name, metadata)
    values (new.user_id, new.id, 'goal_evaluation_abandoned', jsonb_build_object('answerCount', new.answer_count));
  end if;
  return new;
end;
$$;

drop trigger if exists record_goal_evaluation_session_transition on public.goal_evaluation_sessions;
create trigger record_goal_evaluation_session_transition after update on public.goal_evaluation_sessions
for each row execute function public.goal_evaluation_session_event();

create or replace function public.preserve_goal_evaluation_prior_snapshot()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if new.answer_count > old.answer_count then
    new.model_state = coalesce(new.model_state, '{}'::jsonb) || jsonb_build_object(
      'prior', old.prior_sources -> 'modules',
      'priorPolicy', old.prior_sources ->> 'policy'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists preserve_goal_evaluation_prior on public.goal_evaluation_sessions;
create trigger preserve_goal_evaluation_prior before update on public.goal_evaluation_sessions
for each row execute function public.preserve_goal_evaluation_prior_snapshot();

create or replace function public.start_goal_evaluation(
  p_submission_id uuid,
  p_algorithm_version text,
  p_item_pool_version integer,
  p_timezone text,
  p_requested_goal_duration integer
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
  v_result record;
  v_prior jsonb;
  v_context_band integer;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if p_timezone is null or length(p_timezone) not between 1 and 100 then raise exception 'invalid_timezone'; end if;
  if p_requested_goal_duration not between 1 and 30 then raise exception 'invalid_goal_duration'; end if;

  select * into v_result from public.start_goal_evaluation(
    p_submission_id, p_algorithm_version, p_item_pool_version
  );

  if not v_result.replayed then
    v_prior := public.build_goal_evaluation_prior_sources(v_user_id, p_item_pool_version);
    v_context_band := case when p_requested_goal_duration <= 7 then 2
      when p_requested_goal_duration <= 14 then 3 else 4 end;
    update public.goal_evaluation_sessions session
    set timezone = p_timezone,
      requested_goal_duration = p_requested_goal_duration,
      prior_sources = v_prior,
      model_state = jsonb_build_object(
        'algorithmVersion', p_algorithm_version,
        'responseCount', 0,
        'prior', v_prior -> 'modules',
        'priorPolicy', v_prior ->> 'policy'
      ),
      current_item_id = coalesce((
        select item.learning_item_id
        from public.goal_evaluation_items item
        where item.goal_evaluation_eligible and item.retired_at is null
          and item.pool_version = p_item_pool_version
        order by
          abs(item.difficulty_band - coalesce(round(1 + 4 * (
            (2 + coalesce((v_prior -> 'modules' -> item.module_id ->> 'correctWeight')::numeric, 0)) /
            (4 + coalesce((v_prior -> 'modules' -> item.module_id ->> 'correctWeight')::numeric, 0)
              + coalesce((v_prior -> 'modules' -> item.module_id ->> 'incorrectWeight')::numeric, 0))
          ))::integer, 3)),
          abs(item.prerequisite_level - v_context_band),
          case when (v_prior -> 'recentExposureItemIds') ? item.learning_item_id then 1 else 0 end,
          item.module_id, item.learning_item_id
        limit 1
      ), session.current_item_id),
      updated_at = now()
    where session.id = v_result.result_session_id;

    insert into public.goal_evaluation_events (user_id, session_id, event_name, metadata)
    values (v_user_id, v_result.result_session_id, 'goal_evaluation_started',
      jsonb_build_object('algorithmVersion', p_algorithm_version, 'itemPoolVersion', p_item_pool_version,
        'timezone', p_timezone, 'requestedGoalDuration', p_requested_goal_duration));
  else
    insert into public.goal_evaluation_events (user_id, session_id, event_name, metadata)
    values (v_user_id, v_result.result_session_id, 'goal_evaluation_resumed',
      jsonb_build_object('questionIndex', v_result.result_question_index));
  end if;

  return query select session.id, session.current_item_id, session.question_index,
    session.answer_count, v_result.replayed
  from public.goal_evaluation_sessions session where session.id = v_result.result_session_id;
end;
$$;

revoke all on function public.start_goal_evaluation(uuid, text, integer, text, integer) from public;
grant execute on function public.start_goal_evaluation(uuid, text, integer, text, integer) to authenticated;
revoke execute on function public.start_goal_evaluation(uuid, text, integer) from authenticated;

create or replace function public.record_goal_evaluation_recommendations_viewed(p_session_id uuid)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if not exists (select 1 from public.goal_evaluation_sessions session
    where session.id = p_session_id and session.user_id = v_user_id and session.status = 'completed') then
    raise exception 'completed_evaluation_not_found';
  end if;
  insert into public.goal_evaluation_events (user_id, session_id, event_name)
  values (v_user_id, p_session_id, 'goal_evaluation_recommendations_viewed')
  on conflict (session_id, event_name) where event_name = 'goal_evaluation_recommendations_viewed'
  do nothing;
  return true;
end;
$$;

revoke all on function public.record_goal_evaluation_recommendations_viewed(uuid) from public;
grant execute on function public.record_goal_evaluation_recommendations_viewed(uuid) to authenticated;
