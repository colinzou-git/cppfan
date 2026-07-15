-- #487 Phase 1: reset the owner's FSRS review cards for one user lesson. Used by
-- the substantial-edit publish choice "reset affected cards" — after a big edit
-- the author may want learners (here, the owner in this private release) to
-- re-learn the material from scratch rather than keep the existing schedule.
--
-- Owner-scoped and content-scoped: only the owner's cards for the whole-lesson
-- item (user.item.<id>) and its review-card items (user.item.<id>.review.<uuid>)
-- are reset to a fresh "new" FSRS state. Returns the number of cards reset.

create or replace function public.reset_review_cards_for_content(p_content_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_owner uuid;
  v_prefix text;
  v_count integer;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select user_id into v_owner from public.user_content_items where id = p_content_id;
  if v_owner is null or v_owner <> v_user then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  v_prefix := 'user.item.' || p_content_id::text;

  update public.review_cards
    set state = 'new',
        due_at = now(),
        stability = 0,
        difficulty = 0,
        elapsed_days = 0,
        scheduled_days = 0,
        learning_steps = 0,
        reps = 0,
        lapses = 0,
        last_reviewed_at = null,
        updated_at = now()
    where user_id = v_user
      and (learning_item_id = v_prefix or learning_item_id like v_prefix || '.review.%');

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.reset_review_cards_for_content(uuid) from public;
grant execute on function public.reset_review_cards_for_content(uuid) to authenticated;
