-- Roadmap #141 (server-authoritative skill events): close the forge vector where
-- an authenticated client could directly INSERT a skill_events row with any
-- event_type — including the mastery-bearing skill_mastered / quiz_correct /
-- code_passed / review_completed — because RLS only checked auth.uid() = user_id.
-- Mastery scoring trusts these events, so a direct REST write could forge mastery.
--
-- All current event types are system/derived telemetry (there are no genuinely
-- user-authored note/reflection types yet), so the fix locks the whole table to
-- trusted-only writes: append events only through one SECURITY DEFINER function
-- that stamps user_id from auth.uid() and validates any referenced review card.
--
-- NOTE: cross-user runtime isolation is enforced by auth.uid() here but is fully
-- verifiable only with an authenticated Supabase session (#96); CI proves the
-- privilege lockdown.

create or replace function public.record_skill_events(p_events jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_count integer;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if p_events is null or jsonb_typeof(p_events) <> 'array' then
    return 0;
  end if;

  -- A referenced review card must belong to the caller (the FK only checks
  -- existence, not ownership).
  if exists (
    select 1
      from jsonb_array_elements(p_events) e
      where nullif(e->>'review_card_id', '') is not null
        and not exists (
          select 1
            from public.review_cards rc
            where rc.id = (e->>'review_card_id')::uuid
              and rc.user_id = v_user
        )
  ) then
    raise exception 'review_card_id does not belong to the caller' using errcode = '42501';
  end if;

  -- event_type validity and foreign keys are enforced by the table constraints;
  -- an invalid row fails the whole call.
  insert into public.skill_events (user_id, skill_id, learning_item_id, review_card_id, event_type, metadata)
  select
    v_user,
    nullif(e->>'skill_id', ''),
    nullif(e->>'learning_item_id', ''),
    nullif(e->>'review_card_id', '')::uuid,
    e->>'event_type',
    coalesce(e->'metadata', '{}'::jsonb)
  from jsonb_array_elements(p_events) e;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.record_skill_events(jsonb) from public;
grant execute on function public.record_skill_events(jsonb) to authenticated;

-- Remove the client INSERT path: skill events may now be created only by the
-- trusted function above. Reads remain per-user via skill_events_select_own.
drop policy if exists "skill_events_insert_own" on public.skill_events;
revoke insert on public.skill_events from anon, authenticated;
