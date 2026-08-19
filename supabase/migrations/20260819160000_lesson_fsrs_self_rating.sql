-- #687: explicit lesson completion with one atomic FSRS transition.
--
-- A successful Hard/Good/Mastered choice creates and rates the exact lesson's
-- review card, appends its immutable review log, records exact-item acquisition
-- evidence, and satisfies matching persisted Daily New allocations together.
-- Mastered is presentation copy only and reaches this boundary as FSRS `easy`.

alter table public.skill_events drop constraint if exists skill_events_event_type_check;
alter table public.skill_events add constraint skill_events_event_type_check
  check (event_type in (
    'lesson_started',
    'lesson_self_assessed',
    'concept_seen',
    'quiz_attempted',
    'quiz_correct',
    'quiz_wrong',
    'hint_used',
    'review_completed',
    'code_attempted',
    'code_passed',
    'skill_mastered',
    'skill_regressed',
    'error_pattern_observed',
    'error_pattern_cleared',
    'worked_example_viewed',
    'completion_submitted',
    'parsons_submitted',
    'parsons_hint_used',
    'parsons_checked',
    'capstone_milestone_started',
    'capstone_milestone_completed',
    'capstone_reflection_submitted',
    'placement_started',
    'placement_completed',
    'placement_reset'
  ));

create table if not exists public.lesson_rating_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_id uuid not null,
  request_fingerprint text not null,
  learning_item_id text not null references public.learning_items(id) on delete cascade,
  displayed_choice text not null check (displayed_choice in ('hard', 'good', 'mastered')),
  fsrs_rating text not null check (fsrs_rating in ('hard', 'good', 'easy')),
  review_card_id uuid not null references public.review_cards(id) on delete cascade,
  state text not null check (state in ('new', 'learning', 'review', 'relearning')),
  due_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (user_id, submission_id)
);

alter table public.lesson_rating_receipts enable row level security;
revoke all on public.lesson_rating_receipts from anon, authenticated;

create index if not exists lesson_rating_receipts_item_idx
  on public.lesson_rating_receipts (user_id, learning_item_id, created_at desc);

create or replace function public.apply_initial_lesson_rating(
  p_item_id text,
  p_submission_id uuid,
  p_displayed_choice text,
  p_rating text,
  p_schedule jsonb,
  p_log jsonb
)
returns table (status text, card_id uuid, state text, due_at timestamptz, fsrs_rating text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_fingerprint text;
  v_receipt public.lesson_rating_receipts%rowtype;
  v_card public.review_cards%rowtype;
  v_item_active boolean;
  v_item_type text;
  v_item_owner uuid;
  v_skill_id text;
  v_event_id uuid;
  v_event_time timestamptz;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if p_item_id is null or btrim(p_item_id) = '' or p_submission_id is null
    or p_displayed_choice not in ('hard', 'good', 'mastered')
    or p_rating not in ('hard', 'good', 'easy')
    or (p_displayed_choice = 'mastered' and p_rating <> 'easy')
    or (p_displayed_choice <> 'mastered' and p_displayed_choice <> p_rating)
    or jsonb_typeof(p_schedule) <> 'object'
    or jsonb_typeof(p_log) <> 'object'
    or p_log->>'rating' is distinct from p_rating then
    return query select 'invalid'::text, null::uuid, null::text, null::timestamptz, null::text;
    return;
  end if;

  v_fingerprint := md5(jsonb_build_object(
    'item_id', p_item_id,
    'displayed_choice', p_displayed_choice,
    'fsrs_rating', p_rating
  )::text);

  -- Serialize all initial-rating attempts for this learner+lesson. This also
  -- makes two tabs with different submission ids resolve to one winning first
  -- transition and one already_scheduled response.
  perform pg_advisory_xact_lock(hashtextextended(v_user::text || ':' || p_item_id, 0));

  select r.* into v_receipt
  from public.lesson_rating_receipts r
  where r.user_id = v_user and r.submission_id = p_submission_id;

  if found then
    if v_receipt.request_fingerprint <> v_fingerprint then
      return query select 'invalid'::text, null::uuid, null::text, null::timestamptz, null::text;
      return;
    end if;
    return query select
      'already_processed'::text,
      v_receipt.review_card_id,
      v_receipt.state,
      v_receipt.due_at,
      v_receipt.fsrs_rating;
    return;
  end if;

  select li.is_active, li.type, li.owner_user_id
    into v_item_active, v_item_type, v_item_owner
  from public.learning_items li
  where li.id = p_item_id;

  select lis.skill_id into v_skill_id
  from public.learning_item_skills lis
  where lis.learning_item_id = p_item_id and lis.is_primary
  order by lis.created_at, lis.skill_id
  limit 1;

  if not coalesce(v_item_active, false)
    or v_item_type <> 'lesson'
    or (v_item_owner is not null and v_item_owner <> v_user)
    or v_skill_id is null then
    return query select 'invalid'::text, null::uuid, null::text, null::timestamptz, null::text;
    return;
  end if;

  begin
    if p_schedule->>'state' not in ('learning', 'review', 'relearning')
      or (p_schedule->>'reps')::integer <> 1
      or (p_schedule->>'due_at')::timestamptz is null
      or (p_log->>'reviewed_at')::timestamptz is null then
      return query select 'invalid'::text, null::uuid, null::text, null::timestamptz, null::text;
      return;
    end if;
  exception when invalid_text_representation or datetime_field_overflow or null_value_not_allowed then
    return query select 'invalid'::text, null::uuid, null::text, null::timestamptz, null::text;
    return;
  end;

  insert into public.review_cards (user_id, learning_item_id, skill_id)
  values (v_user, p_item_id, v_skill_id)
  on conflict (user_id, learning_item_id) do nothing
  returning * into v_card;

  if not found then
    select c.* into v_card
    from public.review_cards c
    where c.user_id = v_user and c.learning_item_id = p_item_id
    for update;

    return query select
      'already_scheduled'::text,
      v_card.id,
      v_card.state,
      v_card.due_at,
      null::text;
    return;
  end if;

  update public.review_cards set
    state = p_schedule->>'state',
    due_at = (p_schedule->>'due_at')::timestamptz,
    stability = (p_schedule->>'stability')::double precision,
    difficulty = (p_schedule->>'difficulty')::double precision,
    elapsed_days = (p_schedule->>'elapsed_days')::integer,
    scheduled_days = (p_schedule->>'scheduled_days')::integer,
    learning_steps = (p_schedule->>'learning_steps')::integer,
    reps = (p_schedule->>'reps')::integer,
    lapses = (p_schedule->>'lapses')::integer,
    last_reviewed_at = nullif(p_schedule->>'last_reviewed_at', '')::timestamptz
  where id = v_card.id
  returning * into v_card;

  insert into public.review_logs (
    user_id, review_card_id, rating, state, due_at, stability, difficulty,
    elapsed_days, last_elapsed_days, scheduled_days, reviewed_at, submission_id
  ) values (
    v_user, v_card.id, p_rating, p_log->>'state', (p_log->>'due_at')::timestamptz,
    (p_log->>'stability')::double precision, (p_log->>'difficulty')::double precision,
    (p_log->>'elapsed_days')::integer, (p_log->>'last_elapsed_days')::integer,
    (p_log->>'scheduled_days')::integer, (p_log->>'reviewed_at')::timestamptz,
    p_submission_id
  );

  insert into public.skill_events (
    user_id, skill_id, learning_item_id, review_card_id, event_type, event_time, metadata
  ) values (
    v_user,
    v_skill_id,
    p_item_id,
    v_card.id,
    'lesson_self_assessed',
    (p_log->>'reviewed_at')::timestamptz,
    jsonb_build_object(
      'source', 'learner_attested',
      'confidence', 'learner_attested',
      'displayed_choice', p_displayed_choice,
      'fsrs_rating', p_rating,
      'submission_id', p_submission_id
    )
  ) returning id, event_time into v_event_id, v_event_time;

  update public.study_goal_daily_allocations a set
    status = 'satisfied',
    satisfied_evidence_key = 'skill_event:' || v_event_id::text,
    satisfied_at = v_event_time,
    disposition_reason = 'lesson_self_assessed'
  where a.user_id = v_user
    and a.status = 'allocated'
    and a.destination_kind = 'learning_item'
    and a.destination_id = p_item_id;

  insert into public.lesson_rating_receipts (
    user_id, submission_id, request_fingerprint, learning_item_id,
    displayed_choice, fsrs_rating, review_card_id, state, due_at
  ) values (
    v_user, p_submission_id, v_fingerprint, p_item_id,
    p_displayed_choice, p_rating, v_card.id, v_card.state, v_card.due_at
  );

  return query select 'ok'::text, v_card.id, v_card.state, v_card.due_at, p_rating;
end;
$$;

revoke all on function public.apply_initial_lesson_rating(text, uuid, text, text, jsonb, jsonb) from public;
grant execute on function public.apply_initial_lesson_rating(text, uuid, text, text, jsonb, jsonb) to authenticated;

-- Fresh local stacks do not inherit hosted Supabase's ambient service-role
-- table grants. Keep operator/test verification explicit and narrowly scoped:
-- read immutable evidence and advance a card's due time, while learner writes
-- continue to use the trusted RPCs above.
grant select, update on table public.review_cards to service_role;
grant select on table public.review_logs to service_role;
grant select on table public.skill_events to service_role;
grant select, insert on table public.study_goals to service_role;
grant select, insert on table public.study_goal_revisions to service_role;
grant select, insert on table public.study_goal_targets to service_role;
grant select, insert on table public.study_goal_daily_allocations to service_role;

comment on table public.lesson_rating_receipts is
  'Trusted idempotency receipts for exact-item initial lesson FSRS ratings (#687).';
comment on function public.apply_initial_lesson_rating(text, uuid, text, text, jsonb, jsonb) is
  'Atomically completes and FSRS-rates one active lesson; Mastered is passed as easy (#687).';
