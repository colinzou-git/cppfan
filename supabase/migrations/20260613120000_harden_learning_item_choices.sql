-- Harden the learning-item answer key (follow-up to the quiz attempt feature).
--
-- learning_item_choices.is_correct is the answer key. Previously the read-only
-- policy let any client read it via the anon key. This migration:
--   1. Removes column-level read access to is_correct for anon/authenticated
--      while keeping the display columns readable.
--   2. Adds a SECURITY DEFINER grading function so grading stays server-side and
--      DB-authoritative without exposing the column.
--
-- The app degrades safely: every read path falls back to the bundled seed on
-- error, so applying this migration cannot break grading or display.

-- 1. Column-level lockdown. Revoke blanket select, then grant only the
--    non-answer columns. RLS still governs which rows are visible.
revoke select on public.learning_item_choices from anon, authenticated;

grant select (id, learning_item_id, content, order_index, created_at)
  on public.learning_item_choices to anon, authenticated;

-- 2. Server-side grading. Runs as the function owner (bypasses the column
--    lockdown) and returns only whether the submitted choice is correct plus
--    the correct choice id — never the full answer key.
create or replace function public.grade_learning_item_choice(p_item_id text, p_choice_id text)
returns table (is_correct boolean, correct_choice_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correct_id text;
  v_selected_exists boolean;
begin
  select id
    into v_correct_id
    from public.learning_item_choices
    where learning_item_id = p_item_id and is_correct
    order by order_index
    limit 1;

  select exists (
    select 1
      from public.learning_item_choices
      where learning_item_id = p_item_id and id = p_choice_id
  ) into v_selected_exists;

  -- No correct answer configured or the choice does not belong to the item:
  -- return no rows so the caller treats it as ungradeable and falls back.
  if v_correct_id is null or not v_selected_exists then
    return;
  end if;

  return query select (p_choice_id = v_correct_id), v_correct_id;
end;
$$;

revoke all on function public.grade_learning_item_choice(text, text) from public;
grant execute on function public.grade_learning_item_choice(text, text) to anon, authenticated;
