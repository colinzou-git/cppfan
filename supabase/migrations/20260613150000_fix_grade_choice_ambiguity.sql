-- Fix a column-ambiguity bug in grade_learning_item_choice (from #15).
--
-- The function RETURNS TABLE (is_correct boolean, ...), and the body referenced
-- the unqualified column `is_correct`, which PL/pgSQL could not disambiguate
-- from the output column — failing at call time with SQLSTATE 42702
-- ("column reference is_correct is ambiguous"). Caught by live verification
-- (#21) because CI does not run migrations.
--
-- Fix: qualify every table column with an alias so it cannot collide with the
-- RETURNS TABLE output columns. Behavior is unchanged.

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

  if v_correct_id is null or not v_selected_exists then
    return;
  end if;

  return query select (p_choice_id = v_correct_id), v_correct_id;
end;
$$;

revoke all on function public.grade_learning_item_choice(text, text) from public;
grant execute on function public.grade_learning_item_choice(text, text) to anon, authenticated;
