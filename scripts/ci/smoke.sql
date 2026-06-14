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

-- 8) #125: placement definitions are seeded and reference real learning items.
do $$
declare
  v_modules integer;
  v_items integer;
begin
  select count(*) into v_modules from public.placement_modules;
  select count(*) into v_items from public.placement_module_items;

  if v_modules < 5 or v_items < 5 then
    raise exception 'placement definitions not seeded (#125): modules=% items=%', v_modules, v_items;
  end if;

  -- Every placement item must resolve to an existing learning item (FK already
  -- enforces this, but assert the join is non-lossy as a guard).
  if exists (
    select 1
      from public.placement_module_items pmi
      left join public.learning_items li on li.id = pmi.learning_item_id
      where li.id is null
  ) then
    raise exception 'placement references a missing learning item (#125)';
  end if;

  raise notice 'placement definitions smoke OK (% modules, % items)', v_modules, v_items;
end $$;

-- 9) #126: wrong-answer tags are server-only and returned via the function only.
do $$
begin
  if public.get_choice_error_tag('cpp.references.references.mc_init.b')
       is distinct from 'cpp.references.copy_vs_alias' then
    raise exception 'error-tag RPC smoke failed: distractor tag not returned (#126)';
  end if;

  -- The correct choice is unmapped: no tag.
  if public.get_choice_error_tag('cpp.references.references.mc_init.a') is not null then
    raise exception 'error-tag RPC smoke failed: correct choice should have no tag (#126)';
  end if;

  raise notice 'error-tag RPC smoke OK';
end $$;

do $$
begin
  -- The mapping table must not be directly readable by clients.
  if exists (
    select 1
      from information_schema.role_table_grants
      where grantee in ('anon', 'authenticated')
        and table_schema = 'public'
        and table_name = 'choice_error_tags'
        and privilege_type = 'SELECT'
  ) then
    raise exception 'anon/authenticated must not read choice_error_tags directly (#126)';
  end if;

  raise notice 'error-tag lockdown smoke OK';
end $$;

-- 10) #130: per-learner capstone milestone progress table exists with per-user
-- isolation enabled.
do $$
begin
  if not exists (
    select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'capstone_milestone_progress'
  ) then
    raise exception 'capstone_milestone_progress table is missing (#130)';
  end if;

  if not exists (
    select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'capstone_milestone_progress'
        and policyname = 'capstone_progress_select_own'
  ) then
    raise exception 'capstone_milestone_progress is missing its per-user RLS policy (#130)';
  end if;

  raise notice 'capstone progress smoke OK';
end $$;

-- 11) #143: review ratings are atomic + server-authoritative. Direct UPDATE on
-- review_cards and INSERT on review_logs are revoked; the function is the only
-- write path.
do $$
begin
  if exists (
    select 1 from information_schema.role_table_grants
      where grantee in ('anon', 'authenticated') and table_schema = 'public'
        and table_name = 'review_cards' and privilege_type = 'UPDATE'
  ) then
    raise exception 'anon/authenticated must not directly UPDATE review_cards (#143)';
  end if;

  if exists (
    select 1 from information_schema.role_table_grants
      where grantee in ('anon', 'authenticated') and table_schema = 'public'
        and table_name = 'review_logs' and privilege_type = 'INSERT'
  ) then
    raise exception 'anon/authenticated must not directly INSERT review_logs (#143)';
  end if;

  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'apply_review_rating'
  ) then
    raise exception 'apply_review_rating function is missing (#143)';
  end if;

  raise notice 'atomic review-rating lockdown smoke OK';
end $$;

-- 12) #96 (RLS isolation, DB layer): a learner reads only their OWN per-user
-- rows. Impersonate a user via the app.test_uid GUC (auth.uid() reads it in CI)
-- and assert the select-own policy filters to that user. Self-validating: if the
-- impersonation/RLS plumbing were broken, the count would be 0 or 2, not 1, and
-- this fails. All wrapped in a rolled-back transaction so nothing persists.
begin;
grant select on public.learning_item_attempts to authenticated;
do $$
declare
  v_a uuid := gen_random_uuid();
  v_b uuid := gen_random_uuid();
  v_seen integer;
begin
  insert into auth.users (id) values (v_a), (v_b);
  insert into public.learning_item_attempts (user_id, learning_item_id, selected_choice_id, is_correct)
  values
    (v_a, 'cpp.structs_classes.syntax.mc_default_access', 'cpp.structs_classes.syntax.mc_default_access.a', true),
    (v_b, 'cpp.structs_classes.syntax.mc_default_access', 'cpp.structs_classes.syntax.mc_default_access.b', false);

  perform set_config('app.test_uid', v_a::text, true);
  set local role authenticated;
  select count(*) into v_seen from public.learning_item_attempts;
  reset role;

  if v_seen <> 1 then
    raise exception 'RLS isolation smoke failed (#96): impersonated user saw % attempt rows, expected exactly its own 1', v_seen;
  end if;

  raise notice 'RLS isolation smoke OK (user reads only its own attempts)';
end $$;
rollback;
