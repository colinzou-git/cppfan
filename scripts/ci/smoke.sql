-- Post-migration smoke checks. Runs after all migrations are applied in CI.
-- These would have failed on the grade_learning_item_choice column-ambiguity
-- bug that previously slipped to production.

-- 1) The SECURITY DEFINER grading function executes and grades correctly.
do $$
declare
  r record;
begin
  select *
    into r
    from public.grade_learning_item_choice(
      'cpp.structs_classes.syntax.mc_default_access',
      'cpp.structs_classes.syntax.mc_default_access.a'
    );

  if r.is_correct is distinct from true
     or r.correct_choice_id is distinct from 'cpp.structs_classes.syntax.mc_default_access.a' then
    raise exception 'grade RPC smoke failed: %', r;
  end if;

  raise notice 'grade RPC smoke OK (correct choice graded true)';
end $$;

-- 2) A wrong choice grades false (not just "always true").
do $$
declare
  r record;
begin
  select *
    into r
    from public.grade_learning_item_choice(
      'cpp.structs_classes.syntax.mc_default_access',
      'cpp.structs_classes.syntax.mc_default_access.b'
    );

  if r.is_correct is distinct from false then
    raise exception 'grade RPC smoke failed: wrong choice not graded false: %', r;
  end if;

  raise notice 'grade RPC smoke OK (wrong choice graded false)';
end $$;

-- 3) The answer key is locked down: anon has no privilege on is_correct.
do $$
begin
  if exists (
    select 1
      from information_schema.column_privileges
      where grantee = 'anon'
        and table_schema = 'public'
        and table_name = 'learning_item_choices'
        and column_name = 'is_correct'
  ) then
    raise exception 'anon must not have any privilege on learning_item_choices.is_correct';
  end if;

  raise notice 'answer-key lockdown smoke OK (anon cannot see is_correct)';
end $$;
