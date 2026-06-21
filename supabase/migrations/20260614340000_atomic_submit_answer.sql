-- Atomic, idempotent answer-submission boundary (#218; related #141/#142/#143/#146).
--
-- Recording a graded answer previously touched three tables through separate
-- client calls (attempt, review-card enrollment, skill events), so a partial
-- failure could leave inconsistent evidence and the client could report success
-- after a partial write. Consolidate into ONE SECURITY DEFINER function that, in
-- a single transaction, grades against the protected answer key, appends the
-- immutable attempt, enrolls the initial review card for an eligible item using
-- the database-owned primary skill, and appends the quiz skill events — or does
-- none of it. A submission id makes retries and double taps idempotent.

-- Idempotency key on the immutable attempt (nullable: legacy/RPC writes without
-- a submission id are unaffected; the new path always supplies one).
alter table public.learning_item_attempts add column if not exists submission_id uuid;

create unique index if not exists learning_item_attempts_user_submission_idx
  on public.learning_item_attempts (user_id, submission_id)
  where submission_id is not null;

-- Replaying the full migration folder against production can encounter a newer
-- version of this RPC from a later migration. PostgreSQL cannot CREATE OR
-- REPLACE a function when OUT parameters / return row type change, so drop the
-- same signature first and let later migrations recreate their newer shape.
drop function if exists public.submit_learning_item_answer(text, text, uuid);

create function public.submit_learning_item_answer(
  p_item_id text,
  p_choice_id text,
  p_submission_id uuid
)
returns table (status text, is_correct boolean, correct_choice_id text, enrolled boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_correct_id text;
  v_selected_exists boolean;
  v_is_correct boolean;
  v_item_active boolean;
  v_item_type text;
  v_skill_id text;
  v_eligible boolean;
  v_prior boolean;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if p_submission_id is null then
    raise exception 'submission_id required' using errcode = '22004';
  end if;

  -- The correct choice and a validity check come from the protected answer key.
  select c.id into v_correct_id
    from public.learning_item_choices c
    where c.learning_item_id = p_item_id and c.is_correct
    order by c.order_index
    limit 1;

  select exists (
    select 1 from public.learning_item_choices c
    where c.learning_item_id = p_item_id and c.id = p_choice_id
  ) into v_selected_exists;

  -- Idempotent replay: this submission was already processed.
  select a.is_correct into v_prior
    from public.learning_item_attempts a
    where a.user_id = v_user and a.submission_id = p_submission_id;
  if found then
    return query select 'already_processed'::text, v_prior, v_correct_id, false;
    return;
  end if;

  -- Ungradeable or mismatched submission: record nothing.
  if v_correct_id is null or not v_selected_exists then
    return query select 'invalid'::text, null::boolean, null::text, false;
    return;
  end if;

  v_is_correct := (p_choice_id = v_correct_id);

  -- Append the immutable attempt. A concurrent duplicate (same submission id)
  -- loses the unique race and is treated as an idempotent replay.
  begin
    insert into public.learning_item_attempts (user_id, learning_item_id, selected_choice_id, is_correct, submission_id)
    values (v_user, p_item_id, p_choice_id, v_is_correct, p_submission_id);
  exception when unique_violation then
    return query select 'already_processed'::text, v_is_correct, v_correct_id, false;
    return;
  end;

  -- Review eligibility + primary skill come from database-owned curriculum, not
  -- the client. Lessons (and other non-retrieval types) never enroll.
  select li.is_active, li.type into v_item_active, v_item_type
    from public.learning_items li
    where li.id = p_item_id;

  select lis.skill_id into v_skill_id
    from public.learning_item_skills lis
    where lis.learning_item_id = p_item_id and lis.is_primary
    limit 1;

  v_eligible := coalesce(v_item_active, false)
    and v_item_type in ('multiple_choice', 'concept_check', 'code_reading', 'bug_spotting')
    and v_skill_id is not null;

  -- Enroll a fresh (new, due-now) review card if eligible. Idempotent per item.
  if v_eligible then
    insert into public.review_cards (user_id, learning_item_id, skill_id)
    values (v_user, p_item_id, v_skill_id)
    on conflict (user_id, learning_item_id) do nothing;
  end if;

  -- Append mastery evidence for the primary skill.
  if v_skill_id is not null then
    insert into public.skill_events (user_id, skill_id, learning_item_id, event_type)
    values
      (v_user, v_skill_id, p_item_id, 'quiz_attempted'),
      (v_user, v_skill_id, p_item_id, case when v_is_correct then 'quiz_correct' else 'quiz_wrong' end);
  end if;

  return query select 'ok'::text, v_is_correct, v_correct_id, coalesce(v_eligible, false);
end;
$$;

revoke all on function public.submit_learning_item_answer(text, text, uuid) from public;
grant execute on function public.submit_learning_item_answer(text, text, uuid) to authenticated;

-- Trusted enrollment for the deliberate "add to review" action, so direct client
-- INSERT on review_cards can be revoked. Enrolls only an eligible item, deriving
-- the primary skill server-side. Returns whether a card now exists for the item.
create or replace function public.enroll_review_card(p_item_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_item_active boolean;
  v_item_type text;
  v_skill_id text;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select li.is_active, li.type into v_item_active, v_item_type
    from public.learning_items li
    where li.id = p_item_id;

  select lis.skill_id into v_skill_id
    from public.learning_item_skills lis
    where lis.learning_item_id = p_item_id and lis.is_primary
    limit 1;

  if not (coalesce(v_item_active, false)
    and v_item_type in ('multiple_choice', 'concept_check', 'code_reading', 'bug_spotting')
    and v_skill_id is not null) then
    return false;
  end if;

  insert into public.review_cards (user_id, learning_item_id, skill_id)
  values (v_user, p_item_id, v_skill_id)
  on conflict (user_id, learning_item_id) do nothing;

  return true;
end;
$$;

revoke all on function public.enroll_review_card(text) from public;
grant execute on function public.enroll_review_card(text) to authenticated;

-- Now that both trusted paths enroll cards, remove the direct client INSERT path
-- (completes the deferred #141 review-card write lockdown). Reads + the existing
-- UPDATE/DELETE lockdown (#143) are unchanged; SECURITY DEFINER functions above
-- run as the owner and are unaffected.
drop policy if exists "review_cards_insert_own" on public.review_cards;
revoke insert on public.review_cards from anon, authenticated;
