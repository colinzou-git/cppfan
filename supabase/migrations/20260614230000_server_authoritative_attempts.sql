-- Roadmap #141 (server-authoritative attempts): close the forge vector where an
-- authenticated client could insert a learning_item_attempts row with an
-- arbitrary is_correct (or for an unrelated choice) via a direct REST write,
-- because RLS only checked auth.uid() = user_id.
--
-- Fix: grade AND persist attempts through one SECURITY DEFINER function that
-- derives is_correct from the protected answer key, validates that the selected
-- choice belongs to the submitted item, and stamps user_id from auth.uid().
-- Direct client INSERT on the table is revoked, so correctness can only be
-- created by trusted server code.
--
-- NOTE: cross-user runtime isolation (a signed-in user A cannot create rows for
-- user B) is enforced by auth.uid() here but is only fully verifiable with an
-- authenticated Supabase session (#96); CI proves the privilege lockdown only.

-- One trusted entry point: grades against the answer key and records the attempt.
-- Returns the same shape as grade_learning_item_choice so callers can show the
-- graded result. Returns no row for an ungradeable submission (no correct choice
-- or a choice that does not belong to the item), which the caller treats as
-- not-recorded.
create or replace function public.record_learning_item_attempt(p_item_id text, p_choice_id text)
returns table (is_correct boolean, correct_choice_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_correct_id text;
  v_selected_exists boolean;
  v_is_correct boolean;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select c.id
    into v_correct_id
    from public.learning_item_choices c
    where c.learning_item_id = p_item_id and c.is_correct
    order by c.order_index
    limit 1;

  select exists (
    select 1
      from public.learning_item_choices c
      where c.learning_item_id = p_item_id and c.id = p_choice_id
  ) into v_selected_exists;

  -- Ungradeable or mismatched submission: do not record, return nothing.
  if v_correct_id is null or not v_selected_exists then
    return;
  end if;

  v_is_correct := (p_choice_id = v_correct_id);

  insert into public.learning_item_attempts (user_id, learning_item_id, selected_choice_id, is_correct)
  values (v_user, p_item_id, p_choice_id, v_is_correct);

  return query select v_is_correct, v_correct_id;
end;
$$;

revoke all on function public.record_learning_item_attempt(text, text) from public;
grant execute on function public.record_learning_item_attempt(text, text) to authenticated;

-- Remove the client INSERT path: attempts may now be created only by the trusted
-- function above (which runs as the table owner and bypasses RLS). Reads remain
-- per-user via attempts_select_own.
drop policy if exists "attempts_insert_own" on public.learning_item_attempts;
revoke insert on public.learning_item_attempts from anon, authenticated;
