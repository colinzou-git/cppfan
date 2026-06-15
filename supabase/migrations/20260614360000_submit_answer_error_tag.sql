-- Return the matched instructional error tag from the atomic submit boundary so
-- the learner gets immediate, named remediation after a wrong answer (#126).
--
-- The protected choice->tag mapping (choice_error_tags) stays unreadable by
-- clients; this SECURITY DEFINER function reads it as the owner and returns the
-- tag ONLY for the submitted choice when the answer is wrong — never before
-- submission, never for the correct choice. Extends submit_learning_item_answer
-- (#218) with an error_tag output; behavior is otherwise unchanged. The return
-- type changes, so the function is dropped and recreated.

drop function if exists public.submit_learning_item_answer(text, text, uuid);

create function public.submit_learning_item_answer(
  p_item_id text,
  p_choice_id text,
  p_submission_id uuid
)
returns table (status text, is_correct boolean, correct_choice_id text, enrolled boolean, error_tag text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_correct_id text;
  v_selected_exists boolean;
  v_is_correct boolean;
  v_error_tag text;
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

  select c.id into v_correct_id
    from public.learning_item_choices c
    where c.learning_item_id = p_item_id and c.is_correct
    order by c.order_index
    limit 1;

  select exists (
    select 1 from public.learning_item_choices c
    where c.learning_item_id = p_item_id and c.id = p_choice_id
  ) into v_selected_exists;

  -- Remediation tag for the submitted choice, only when it is a valid wrong choice.
  if v_correct_id is not null and v_selected_exists and p_choice_id <> v_correct_id then
    select t.instructional_tag into v_error_tag
      from public.choice_error_tags t
      where t.choice_id = p_choice_id;
  end if;

  -- Idempotent replay.
  select a.is_correct into v_prior
    from public.learning_item_attempts a
    where a.user_id = v_user and a.submission_id = p_submission_id;
  if found then
    return query select 'already_processed'::text, v_prior, v_correct_id, false, v_error_tag;
    return;
  end if;

  if v_correct_id is null or not v_selected_exists then
    return query select 'invalid'::text, null::boolean, null::text, false, null::text;
    return;
  end if;

  v_is_correct := (p_choice_id = v_correct_id);

  begin
    insert into public.learning_item_attempts (user_id, learning_item_id, selected_choice_id, is_correct, submission_id)
    values (v_user, p_item_id, p_choice_id, v_is_correct, p_submission_id);
  exception when unique_violation then
    return query select 'already_processed'::text, v_is_correct, v_correct_id, false, v_error_tag;
    return;
  end;

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

  if v_eligible then
    insert into public.review_cards (user_id, learning_item_id, skill_id)
    values (v_user, p_item_id, v_skill_id)
    on conflict (user_id, learning_item_id) do nothing;
  end if;

  if v_skill_id is not null then
    insert into public.skill_events (user_id, skill_id, learning_item_id, event_type)
    values
      (v_user, v_skill_id, p_item_id, 'quiz_attempted'),
      (v_user, v_skill_id, p_item_id, case when v_is_correct then 'quiz_correct' else 'quiz_wrong' end);
  end if;

  return query select 'ok'::text, v_is_correct, v_correct_id, coalesce(v_eligible, false), v_error_tag;
end;
$$;

revoke all on function public.submit_learning_item_answer(text, text, uuid) from public;
grant execute on function public.submit_learning_item_answer(text, text, uuid) to authenticated;
