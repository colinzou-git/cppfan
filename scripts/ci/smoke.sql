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

-- 4) #141: attempts are server-authoritative. Direct client INSERT is revoked so
-- a browser cannot forge is_correct; only the trusted function may record.
do $$
begin
  if exists (
    select 1
      from information_schema.role_table_grants
      where grantee in ('anon', 'authenticated')
        and table_schema = 'public'
        and table_name = 'learning_item_attempts'
        and privilege_type = 'INSERT'
  ) then
    raise exception 'anon/authenticated must not have direct INSERT on learning_item_attempts (#141)';
  end if;

  raise notice 'attempts lockdown smoke OK (no direct client INSERT)';
end $$;

-- 5) #141: the server-authoritative record function exists with the expected
-- signature so the app can route attempts through it.
do $$
begin
  if not exists (
    select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname = 'record_learning_item_attempt'
  ) then
    raise exception 'record_learning_item_attempt function is missing (#141)';
  end if;

  raise notice 'attempts record-function smoke OK';
end $$;

-- 6) #141: skill events are server-authoritative. Direct client INSERT is revoked
-- so a browser cannot forge mastery-bearing events; only the trusted function may
-- append.
do $$
begin
  if exists (
    select 1
      from information_schema.role_table_grants
      where grantee in ('anon', 'authenticated')
        and table_schema = 'public'
        and table_name = 'skill_events'
        and privilege_type = 'INSERT'
  ) then
    raise exception 'anon/authenticated must not have direct INSERT on skill_events (#141)';
  end if;

  if not exists (
    select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname = 'record_skill_events'
  ) then
    raise exception 'record_skill_events function is missing (#141)';
  end if;

  raise notice 'skill-events lockdown smoke OK (no direct client INSERT)';
end $$;

-- 7) #123: Parsons grading runs server-side and the answer key is hidden.
do $$
declare
  r record;
begin
  -- Correct order grades true.
  select * into r from public.grade_parsons_attempt(
    'cpp.control_flow.loops.parsons_sum',
    array[
      'cpp.control_flow.loops.parsons_sum.b1',
      'cpp.control_flow.loops.parsons_sum.b2',
      'cpp.control_flow.loops.parsons_sum.b3',
      'cpp.control_flow.loops.parsons_sum.b4',
      'cpp.control_flow.loops.parsons_sum.b5'
    ]
  );
  if r.is_correct is distinct from true or r.total is distinct from 5 or r.correct_count is distinct from 5 then
    raise exception 'parsons grade smoke failed (correct order): %', r;
  end if;

  -- A wrong order grades false.
  select * into r from public.grade_parsons_attempt(
    'cpp.control_flow.loops.parsons_sum',
    array[
      'cpp.control_flow.loops.parsons_sum.b2',
      'cpp.control_flow.loops.parsons_sum.b1',
      'cpp.control_flow.loops.parsons_sum.b3',
      'cpp.control_flow.loops.parsons_sum.b4',
      'cpp.control_flow.loops.parsons_sum.b5'
    ]
  );
  if r.is_correct is distinct from false then
    raise exception 'parsons grade smoke failed (wrong order graded correct): %', r;
  end if;

  raise notice 'parsons grading smoke OK';
end $$;

do $$
begin
  -- The answer key columns must not be readable by anon/authenticated.
  if exists (
    select 1
      from information_schema.column_privileges
      where grantee in ('anon', 'authenticated')
        and table_schema = 'public'
        and table_name = 'learning_item_parsons_blocks'
        and column_name in ('correct_order', 'is_distractor')
  ) then
    raise exception 'anon/authenticated must not read parsons answer-key columns (#123)';
  end if;

  raise notice 'parsons answer-key lockdown smoke OK';
end $$;
