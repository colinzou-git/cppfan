-- Roadmap #143 (atomic review ratings; also #141 review-card/log lockdown).
-- rateReview() previously did three independent writes (card update, log insert,
-- skill event) so a partial write could report success, and two concurrent taps
-- could read the same card, compute competing schedules, and overwrite each
-- other with duplicate logs.
--
-- Fix: one SECURITY DEFINER function applies the rating atomically with
-- ownership + optimistic-concurrency (expected reps) + idempotency (submission
-- id) checks, doing the card update, the review-log append, and the
-- review_completed evidence in a single transaction. FSRS math stays in TS
-- (ts-fsrs); the computed schedule/log are passed in. Direct client UPDATE on
-- review_cards and INSERT on review_logs are revoked so this is the only write
-- path. Reads and enrollment INSERT (ON CONFLICT DO NOTHING) are unaffected.
--
-- NOTE: cross-user isolation is enforced by auth.uid() but is fully verifiable
-- only with an authenticated session (#96); CI proves the privilege lockdown.

-- Idempotency key for review logs so a retry/double-tap cannot rate twice.
alter table public.review_logs add column if not exists submission_id uuid;

create unique index if not exists review_logs_card_submission_uidx
  on public.review_logs (review_card_id, submission_id)
  where submission_id is not null;

create or replace function public.apply_review_rating(
  p_card_id uuid,
  p_rating text,
  p_expected_reps integer,
  p_submission_id uuid,
  p_schedule jsonb,
  p_log jsonb
)
returns table (status text, state text, due_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_card public.review_cards%rowtype;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select * into v_card
    from public.review_cards c
    where c.id = p_card_id and c.user_id = v_user
    for update;

  if not found then
    return query select 'unauthorized'::text, null::text, null::timestamptz;
    return;
  end if;

  -- Idempotency: this exact submission already recorded -> report success without
  -- applying again.
  if p_submission_id is not null and exists (
    select 1 from public.review_logs l
      where l.review_card_id = p_card_id and l.submission_id = p_submission_id
  ) then
    return query select 'already_processed'::text, v_card.state, v_card.due_at;
    return;
  end if;

  -- Optimistic concurrency: the card moved on since the caller read it.
  if v_card.reps is distinct from p_expected_reps then
    return query select 'stale'::text, v_card.state, v_card.due_at;
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
  where id = p_card_id and user_id = v_user;

  insert into public.review_logs (
    user_id, review_card_id, rating, state, due_at, stability, difficulty,
    elapsed_days, last_elapsed_days, scheduled_days, reviewed_at, submission_id
  ) values (
    v_user, p_card_id, p_log->>'rating', p_log->>'state', (p_log->>'due_at')::timestamptz,
    (p_log->>'stability')::double precision, (p_log->>'difficulty')::double precision,
    (p_log->>'elapsed_days')::integer, (p_log->>'last_elapsed_days')::integer,
    (p_log->>'scheduled_days')::integer, (p_log->>'reviewed_at')::timestamptz, p_submission_id
  );

  -- Required mastery evidence in the same transaction (no silent loss).
  insert into public.skill_events (user_id, skill_id, learning_item_id, review_card_id, event_type, metadata)
  values (v_user, v_card.skill_id, v_card.learning_item_id, p_card_id, 'review_completed', '{}'::jsonb);

  return query select 'ok'::text, (p_schedule->>'state'), (p_schedule->>'due_at')::timestamptz;
end;
$$;

revoke all on function public.apply_review_rating(uuid, text, integer, uuid, jsonb, jsonb) from public;
grant execute on function public.apply_review_rating(uuid, text, integer, uuid, jsonb, jsonb) to authenticated;

-- Lock down direct rating writes: only the function above may update cards or
-- append logs. Enrollment (INSERT ... ON CONFLICT DO NOTHING) needs only INSERT,
-- which is left intact; reads stay per-user.
drop policy if exists "review_cards_update_own" on public.review_cards;
revoke update on public.review_cards from anon, authenticated;

drop policy if exists "review_logs_insert_own" on public.review_logs;
revoke insert on public.review_logs from anon, authenticated;
