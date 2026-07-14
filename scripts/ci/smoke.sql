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

-- 13) #218 (atomic submission boundary): the trusted functions exist, the attempt
-- table carries the submission_id idempotency key, and direct client INSERT on
-- review_cards is revoked (cards are created only by the SECURITY DEFINER paths).
do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'submit_learning_item_answer'
  ) then
    raise exception 'submit_learning_item_answer function is missing (#218)';
  end if;

  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'enroll_review_card'
  ) then
    raise exception 'enroll_review_card function is missing (#218)';
  end if;

  if not exists (
    select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'learning_item_attempts'
        and column_name = 'submission_id'
  ) then
    raise exception 'learning_item_attempts.submission_id is missing (#218)';
  end if;

  if has_table_privilege('authenticated', 'public.review_cards', 'INSERT') then
    raise exception 'authenticated must not directly INSERT review_cards (#218)';
  end if;

  if not has_table_privilege('authenticated', 'public.review_cards', 'SELECT') then
    raise exception 'authenticated should still SELECT its own review_cards (#218)';
  end if;

  raise notice 'atomic submission-boundary smoke OK';
end $$;

-- 14) #125 (placement results): the per-learner table exists with RLS enabled and
-- the authenticated base grants, so persisted placement suggestions are isolated.
do $$
begin
  if not exists (
    select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'placement_results'
  ) then
    raise exception 'placement_results table is missing (#125)';
  end if;

  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'placement_results' and c.relrowsecurity
  ) then
    raise exception 'placement_results must have row level security enabled (#125)';
  end if;

  if not has_table_privilege('authenticated', 'public.placement_results', 'SELECT') then
    raise exception 'authenticated should SELECT its own placement_results (#125)';
  end if;

  raise notice 'placement results smoke OK';
end $$;

-- 15) #128 (write-code exercise progress): per-learner table with RLS + base grant.
do $$
begin
  if not exists (
    select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'exercise_progress'
  ) then
    raise exception 'exercise_progress table is missing (#128)';
  end if;

  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'exercise_progress' and c.relrowsecurity
  ) then
    raise exception 'exercise_progress must have row level security enabled (#128)';
  end if;

  if not has_table_privilege('authenticated', 'public.exercise_progress', 'SELECT') then
    raise exception 'authenticated should SELECT its own exercise_progress (#128)';
  end if;

  raise notice 'exercise progress smoke OK';
end $$;

-- 16) #123 (completion item type): the grading function exists, the answer column
-- is locked, and grading returns structural feedback.
do $$
declare
  v_ok boolean;
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'grade_completion_attempt'
  ) then
    raise exception 'grade_completion_attempt function is missing (#123)';
  end if;

  -- The answer column must not be client-readable.
  if has_column_privilege('authenticated', 'public.learning_item_completion_blanks', 'answer', 'SELECT') then
    raise exception 'authenticated must not read completion_blanks.answer (#123)';
  end if;
  if not has_column_privilege('authenticated', 'public.learning_item_completion_blanks', 'position', 'SELECT') then
    raise exception 'authenticated should read completion_blanks.position (#123)';
  end if;

  -- Correct answers grade as correct; a wrong one does not.
  select is_correct into v_ok
    from public.grade_completion_attempt('cpp.control_flow.loops.completion_sum', array['0', '+=', 'sum']);
  if v_ok is distinct from true then
    raise exception 'grade_completion_attempt should accept the correct answers (#123)';
  end if;

  select is_correct into v_ok
    from public.grade_completion_attempt('cpp.control_flow.loops.completion_sum', array['1', '-=', 'i']);
  if v_ok is distinct from false then
    raise exception 'grade_completion_attempt should reject wrong answers (#123)';
  end if;

  raise notice 'completion grading smoke OK';
end $$;

-- 17) #177 (interview sessions): per-learner table with RLS + base grant.
do $$
begin
  if not exists (
    select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'interview_sessions'
  ) then
    raise exception 'interview_sessions table is missing (#177)';
  end if;

  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'interview_sessions' and c.relrowsecurity
  ) then
    raise exception 'interview_sessions must have row level security enabled (#177)';
  end if;

  if not has_table_privilege('authenticated', 'public.interview_sessions', 'SELECT') then
    raise exception 'authenticated should SELECT its own interview_sessions (#177)';
  end if;

  raise notice 'interview sessions smoke OK';
end $$;

-- 18) #126 / #123 (event evidence): the skill_events type CHECK accepts the
-- stable error-pattern and adaptive-practice event names.
do $$
declare
  v_def text;
begin
  select pg_get_constraintdef(c.oid) into v_def
    from pg_constraint c
    where c.conname = 'skill_events_event_type_check';
  if v_def is null then
    raise exception 'skill_events_event_type_check constraint is missing (#126)';
  end if;
  if position('error_pattern_observed' in v_def) = 0 or position('error_pattern_cleared' in v_def) = 0 then
    raise exception 'skill_events must allow error_pattern_observed/cleared (#126)';
  end if;
  if position('worked_example_viewed' in v_def) = 0
    or position('completion_submitted' in v_def) = 0
    or position('parsons_submitted' in v_def) = 0
    or position('parsons_hint_used' in v_def) = 0
    or position('parsons_checked' in v_def) = 0 then
    raise exception 'skill_events must allow adaptive practice events (#123)';
  end if;
  if position('capstone_milestone_started' in v_def) = 0
    or position('capstone_milestone_completed' in v_def) = 0
    or position('capstone_reflection_submitted' in v_def) = 0 then
    raise exception 'skill_events must allow capstone events (#130)';
  end if;
  if position('placement_started' in v_def) = 0
    or position('placement_completed' in v_def) = 0
    or position('placement_reset' in v_def) = 0 then
    raise exception 'skill_events must allow placement events (#125)';
  end if;
  raise notice 'event names smoke OK';
end $$;

-- 19) #179 (interview rubric self-review): per-learner table with RLS + base grant.
do $$
begin
  if not exists (
    select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'rubric_scores'
  ) then
    raise exception 'rubric_scores table is missing (#179)';
  end if;

  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'rubric_scores' and c.relrowsecurity
  ) then
    raise exception 'rubric_scores must have row level security enabled (#179)';
  end if;

  if not has_table_privilege('authenticated', 'public.rubric_scores', 'SELECT') then
    raise exception 'authenticated should SELECT its own rubric_scores (#179)';
  end if;

  raise notice 'rubric self-review smoke OK';
end $$;

-- 20) #180 (interview evidence): per-learner append-only log with RLS, a bounded
-- (user_id, completed_at) index, and base grants. No UPDATE (append-only).
do $$
begin
  if not exists (
    select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'interview_evidence'
  ) then
    raise exception 'interview_evidence table is missing (#180)';
  end if;

  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'interview_evidence' and c.relrowsecurity
  ) then
    raise exception 'interview_evidence must have row level security enabled (#180)';
  end if;

  if not exists (
    select 1 from pg_indexes
      where schemaname = 'public' and tablename = 'interview_evidence'
        and indexname = 'interview_evidence_user_time_idx'
  ) then
    raise exception 'interview_evidence needs the bounded (user_id, completed_at) index (#180)';
  end if;

  if not has_table_privilege('authenticated', 'public.interview_evidence', 'SELECT') then
    raise exception 'authenticated should SELECT its own interview_evidence (#180)';
  end if;
  if has_table_privilege('authenticated', 'public.interview_evidence', 'UPDATE') then
    raise exception 'interview_evidence must be append-only (no UPDATE) (#180)';
  end if;

  -- Evidence-model detail columns (#180).
  if not exists (
    select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'interview_evidence'
        and column_name in ('time_to_approach_seconds', 'time_to_implementation_seconds', 'follow_up_result', 'problem_version')
      group by table_name having count(*) = 4
  ) then
    raise exception 'interview_evidence is missing the evidence-model detail columns (#180)';
  end if;

  raise notice 'interview evidence smoke OK';
end $$;

-- 21) #175/#182 (diagnostic scores): per-learner table with RLS + base grant.
do $$
begin
  if not exists (
    select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'diagnostic_scores'
  ) then
    raise exception 'diagnostic_scores table is missing (#175/#182)';
  end if;

  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'diagnostic_scores' and c.relrowsecurity
  ) then
    raise exception 'diagnostic_scores must have row level security enabled (#175/#182)';
  end if;

  if not has_table_privilege('authenticated', 'public.diagnostic_scores', 'SELECT') then
    raise exception 'authenticated should SELECT its own diagnostic_scores (#175/#182)';
  end if;

  raise notice 'diagnostic scores smoke OK';
end $$;

-- 22) #441: skill_events.event_type integrity. After all migrations, no row may
-- carry an event_type outside the stable allowlist, and the constraint that
-- enforces it must exist. A fresh CI database has no skill_events rows, so the
-- row check is trivially satisfied; the value is guarding against any migration
-- that seeds or backfills a bad value, and proving the constraint is present.
do $$
declare
  v_bad bigint;
begin
  select count(*) into v_bad
    from public.skill_events
    where event_type not in (
      'lesson_started','concept_seen','quiz_attempted','quiz_correct','quiz_wrong',
      'hint_used','review_completed','code_attempted','code_passed','skill_mastered',
      'skill_regressed','error_pattern_observed','error_pattern_cleared',
      'worked_example_viewed','completion_submitted','parsons_submitted',
      'parsons_hint_used','parsons_checked','capstone_milestone_started',
      'capstone_milestone_completed','capstone_reflection_submitted',
      'placement_started','placement_completed','placement_reset'
    );
  if v_bad <> 0 then
    raise exception '#441: % skill_events row(s) have an event_type outside the stable allowlist', v_bad;
  end if;

  if not exists (
    select 1 from pg_constraint
      where conrelid = 'public.skill_events'::regclass
        and conname = 'skill_events_event_type_check'
  ) then
    raise exception '#441: skill_events_event_type_check constraint is missing';
  end if;

  raise notice 'skill_events event_type integrity smoke OK';
end $$;

-- 23) #487: private user-created content tables exist, have RLS enabled, and
-- grant the owning authenticated role full CRUD. Rows are owner-scoped by the
-- policies created in the migration; two-user isolation is exercised by the
-- authenticated integration tests once the lifecycle RPCs land.
do $$
declare
  t text;
  tables text[] := array[
    'user_content_items', 'user_content_versions', 'user_content_attachments'
  ];
  priv text;
begin
  foreach t in array tables loop
    if not exists (
      select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = t
    ) then
      raise exception '#487: table public.% is missing', t;
    end if;
    if not exists (
      select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = t and c.relrowsecurity
    ) then
      raise exception '#487: table public.% must have row level security enabled', t;
    end if;
    foreach priv in array array['SELECT', 'INSERT', 'UPDATE', 'DELETE'] loop
      if not has_table_privilege('authenticated', format('public.%I', t), priv) then
        raise exception '#487: authenticated should have % on public.%', priv, t;
      end if;
    end loop;
  end loop;

  if not exists (
    select 1 from pg_constraint where conname = 'user_content_items_current_published_version_fk'
  ) then
    raise exception '#487: user_content_items current-version FK is missing';
  end if;

  raise notice 'user content tables smoke OK';
end $$;

-- 24) #487: user-content lifecycle RPCs. Impersonate a user via the app.test_uid
-- GUC (the same mechanism the RLS-isolation smoke uses) and drive a real
-- save -> update -> archive -> restore -> delete round-trip, asserting the
-- optimistic-concurrency revision increments and the lifecycle transitions.
do $$
declare
  v_uid uuid := '00000000-0000-0000-0000-0000000000ab';
  v_content uuid;
  v_rev bigint;
  v_draft uuid;
  v_status text;
  v_versions integer;
begin
  insert into auth.users (id, email) values (v_uid, 'uc-smoke@example.test')
    on conflict (id) do nothing;
  perform set_config('app.test_uid', v_uid::text, false);

  -- create
  select content_id, revision into v_content, v_rev
    from public.save_user_content_draft(null, 'lesson', 'Smoke Lesson', null, true, 1,
      '{"itemType":"lesson","title":"Smoke Lesson","content":"c","explanation":"e"}'::jsonb, null);
  if v_content is null or v_rev <> 1 then
    raise exception '#487: save_user_content_draft create should return revision 1';
  end if;
  if not exists (select 1 from public.user_content_items where id = v_content and user_id = v_uid and draft_revision = 1) then
    raise exception '#487: created content item row missing or wrong revision';
  end if;

  -- update (optimistic concurrency: expected revision 1 -> new revision 2, same version updated in place)
  select revision, draft_version_id into v_rev, v_draft
    from public.save_user_content_draft(v_content, 'lesson', 'Smoke Lesson v2', null, true, 1,
      '{"itemType":"lesson","title":"Smoke Lesson v2","content":"c2","explanation":"e2"}'::jsonb, 1);
  if v_rev <> 2 then
    raise exception '#487: save update should bump revision to 2, got %', v_rev;
  end if;
  select count(*) into v_versions from public.user_content_versions where content_item_id = v_content;
  if v_versions <> 1 then
    raise exception '#487: draft update should reuse the single draft version, found % versions', v_versions;
  end if;

  -- stale revision should be rejected
  begin
    perform public.save_user_content_draft(v_content, 'lesson', 'stale', null, true, 1,
      '{"itemType":"lesson","title":"stale","content":"c","explanation":"e"}'::jsonb, 1);
    raise exception '#487: stale revision save should have been rejected';
  exception when others then
    if sqlstate <> '40001' then raise; end if;
  end;

  -- archive / restore
  select lifecycle_status into v_status from public.archive_user_content(v_content);
  if v_status <> 'archived' then raise exception '#487: archive should set archived'; end if;
  select lifecycle_status into v_status from public.restore_user_content(v_content);
  if v_status <> 'draft' then raise exception '#487: restore (no published version) should return to draft'; end if;

  -- delete_all removes the item
  perform public.delete_user_content(v_content, 'delete_all');
  if exists (select 1 from public.user_content_items where id = v_content) then
    raise exception '#487: delete_all should remove the content item';
  end if;

  -- cleanup impersonation + test user
  perform set_config('app.test_uid', '', false);
  delete from auth.users where id = v_uid;

  raise notice 'user content lifecycle RPC smoke OK';
end $$;

-- 25) #487: owner-scoped read on the projection tables. Insert two user-owned
-- skills (owner A and owner B), impersonate A, and confirm A sees only its own
-- user skill while native (owner-null) skills remain visible. Wrapped in a
-- rolled-back transaction so nothing persists (seed parity is unaffected).
begin;
do $$
declare
  v_a uuid := gen_random_uuid();
  v_b uuid := gen_random_uuid();
  v_seen_user integer;
  v_seen_native integer;
begin
  insert into auth.users (id) values (v_a), (v_b);
  insert into public.skills (id, domain, module_id, title, description, learner_goal, order_index, owner_user_id, source_kind)
  values
    ('user.skill.smoke-a', 'cpp', 'cpp.user_content', 'Smoke A', 'd', 'g', 1, v_a, 'user'),
    ('user.skill.smoke-b', 'cpp', 'cpp.user_content', 'Smoke B', 'd', 'g', 1, v_b, 'user');

  perform set_config('app.test_uid', v_a::text, true);
  set local role authenticated;
  select count(*) into v_seen_user from public.skills where source_kind = 'user';
  select count(*) into v_seen_native from public.skills where owner_user_id is null;
  reset role;

  if v_seen_user <> 1 then
    raise exception '#487: owner should see exactly its own user skill, saw %', v_seen_user;
  end if;
  if v_seen_native < 1 then
    raise exception '#487: native (owner-null) skills must remain visible to a user, saw %', v_seen_native;
  end if;

  -- both projection tables carry the ownership/source columns
  if not exists (
    select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'learning_items' and column_name = 'owner_user_id'
  ) then
    raise exception '#487: learning_items.owner_user_id column is missing';
  end if;

  raise notice 'user content projection RLS smoke OK';
end $$;
rollback;

-- 26) #487: publish + projection. Save a lesson draft, publish it, and assert
-- the owner-scoped skill/learning-item projection + primary mapping + version
-- freeze; then archive (projection deactivated), restore (reactivated), and
-- delete_all (must not hit the content_version_id RESTRICT FK and must remove
-- the projected rows). Cleans itself up so seed parity is unaffected.
do $$
declare
  v_uid uuid := '00000000-0000-0000-0000-0000000000ac';
  v_content uuid;
  v_skill text;
  v_item text;
  v_status text;
begin
  insert into auth.users (id, email) values (v_uid, 'uc-pub@example.test') on conflict (id) do nothing;
  perform set_config('app.test_uid', v_uid::text, false);

  select content_id into v_content from public.save_user_content_draft(null, 'lesson', 'Pub Lesson', null, true, 1,
    '{"itemType":"lesson","title":"Pub Lesson","content":"body","explanation":"expl"}'::jsonb, null);

  select out_skill_id, out_learning_item_id into v_skill, v_item
    from public.publish_user_content(v_content, null);

  if v_skill <> 'user.skill.' || v_content::text then
    raise exception '#487: publish returned wrong skill id %', v_skill;
  end if;
  if not exists (select 1 from public.skills where id = v_skill and owner_user_id = v_uid and source_kind = 'user' and is_active) then
    raise exception '#487: publish should project an active owner-scoped skill';
  end if;
  if not exists (select 1 from public.learning_items where id = v_item and owner_user_id = v_uid and source_kind = 'user' and type = 'lesson') then
    raise exception '#487: publish should project an owner-scoped learning item';
  end if;
  if not exists (select 1 from public.learning_item_skills where learning_item_id = v_item and skill_id = v_skill and is_primary) then
    raise exception '#487: publish should map the item to its skill as primary';
  end if;
  if not exists (select 1 from public.user_content_items where id = v_content and lifecycle_status = 'published' and current_published_version_id is not null and current_draft_version_id is null) then
    raise exception '#487: publish should mark the item published and clear the draft pointer';
  end if;
  if not exists (select 1 from public.user_content_versions where content_item_id = v_content and version_state = 'published') then
    raise exception '#487: publish should freeze a published version';
  end if;

  perform public.archive_user_content(v_content);
  if exists (select 1 from public.skills where content_item_id = v_content and is_active) then
    raise exception '#487: archive should deactivate the projected skill';
  end if;

  select lifecycle_status into v_status from public.restore_user_content(v_content);
  if v_status <> 'published' or not exists (select 1 from public.skills where content_item_id = v_content and is_active) then
    raise exception '#487: restore should reactivate the published projection';
  end if;

  perform public.delete_user_content(v_content, 'delete_all');
  if exists (select 1 from public.skills where content_item_id = v_content)
     or exists (select 1 from public.learning_items where content_item_id = v_content)
     or exists (select 1 from public.user_content_items where id = v_content) then
    raise exception '#487: delete_all should remove the item and its projected rows';
  end if;

  perform set_config('app.test_uid', '', false);
  delete from auth.users where id = v_uid;
  raise notice 'user content publish/projection smoke OK';
end $$;

-- 27) #487: multiple-choice publish projects gradeable choices (answer key
-- server-side), and re-publishing as a plain lesson clears them. Self-cleaning.
do $$
declare
  v_uid uuid := '00000000-0000-0000-0000-0000000000ad';
  v_content uuid;
  v_item text;
  v_choices integer;
  v_correct integer;
begin
  insert into auth.users (id, email) values (v_uid, 'uc-mc@example.test') on conflict (id) do nothing;
  perform set_config('app.test_uid', v_uid::text, false);

  select content_id into v_content from public.save_user_content_draft(null, 'lesson', 'MC', null, true, 1,
    '{"itemType":"multiple_choice","title":"MC","content":"pick","explanation":"e","choices":[{"text":"A","isCorrect":true},{"text":"B","isCorrect":false},{"text":"C","isCorrect":false}]}'::jsonb, null);
  select out_learning_item_id into v_item from public.publish_user_content(v_content, null);

  select count(*) into v_choices from public.learning_item_choices where learning_item_id = v_item;
  if v_choices <> 3 then
    raise exception '#487: MC publish should project 3 choices, got %', v_choices;
  end if;
  select count(*) into v_correct from public.learning_item_choices where learning_item_id = v_item and is_correct;
  if v_correct <> 1 then
    raise exception '#487: MC publish should mark exactly one correct, got %', v_correct;
  end if;
  if not exists (select 1 from public.learning_items where id = v_item and type = 'multiple_choice') then
    raise exception '#487: MC publish should project a multiple_choice item';
  end if;

  -- Re-publish as a plain lesson -> projected choices must be cleared.
  perform public.save_user_content_draft(v_content, 'lesson', 'Plain', null, true, 1,
    '{"itemType":"lesson","title":"Plain","content":"c","explanation":"e"}'::jsonb, null);
  perform public.publish_user_content(v_content, null);
  select count(*) into v_choices from public.learning_item_choices where learning_item_id = v_item;
  if v_choices <> 0 then
    raise exception '#487: republishing as a lesson should clear projected choices, got %', v_choices;
  end if;

  perform public.delete_user_content(v_content, 'delete_all');
  perform set_config('app.test_uid', '', false);
  delete from auth.users where id = v_uid;
  raise notice 'user content choices projection smoke OK';
end $$;

-- 28) #487: parsons/completion publish projects gradeable blocks/blanks
-- (answer key server-side). Self-cleaning.
do $$
declare
  v_uid uuid := '00000000-0000-0000-0000-0000000000ae';
  v_content uuid;
  v_item text;
  v_blocks integer;
  v_blanks integer;
begin
  insert into auth.users (id, email) values (v_uid, 'uc-pc@example.test') on conflict (id) do nothing;
  perform set_config('app.test_uid', v_uid::text, false);

  select content_id into v_content from public.save_user_content_draft(null, 'lesson', 'P', null, true, 1,
    '{"itemType":"parsons","title":"P","content":"order","explanation":"e","parsonsBlocks":[{"text":"a","correctOrder":0,"isDistractor":false},{"text":"b","correctOrder":1,"isDistractor":false},{"text":"x","correctOrder":0,"isDistractor":true}]}'::jsonb, null);
  select out_learning_item_id into v_item from public.publish_user_content(v_content, null);
  select count(*) into v_blocks from public.learning_item_parsons_blocks where learning_item_id = v_item;
  if v_blocks <> 3 then
    raise exception '#487: parsons publish should project 3 blocks, got %', v_blocks;
  end if;
  if not exists (select 1 from public.learning_item_parsons_blocks where learning_item_id = v_item and is_distractor) then
    raise exception '#487: parsons projection should keep the distractor flag';
  end if;
  perform public.delete_user_content(v_content, 'delete_all');

  select content_id into v_content from public.save_user_content_draft(null, 'lesson', 'C', null, true, 1,
    '{"itemType":"completion","title":"C","content":"fill __","explanation":"e","completionBlanks":[{"position":0,"answer":"int"},{"position":1,"answer":"main"}]}'::jsonb, null);
  select out_learning_item_id into v_item from public.publish_user_content(v_content, null);
  select count(*) into v_blanks from public.learning_item_completion_blanks where learning_item_id = v_item;
  if v_blanks <> 2 then
    raise exception '#487: completion publish should project 2 blanks, got %', v_blanks;
  end if;
  if not exists (select 1 from public.learning_item_completion_blanks where learning_item_id = v_item and answer = 'main') then
    raise exception '#487: completion projection should keep the answer';
  end if;
  perform public.delete_user_content(v_content, 'delete_all');

  perform set_config('app.test_uid', '', false);
  delete from auth.users where id = v_uid;
  raise notice 'user content parsons/completion projection smoke OK';
end $$;

-- 29) #487: external attachment RPCs. Add a URL attachment, reject an http url
-- and an id-less lesson ref, flip visibility, and delete. Self-cleaning.
do $$
declare
  v_uid uuid := '00000000-0000-0000-0000-0000000000af';
  v_content uuid;
  v_att uuid;
  v_vis text;
begin
  insert into auth.users (id, email) values (v_uid, 'uc-att@example.test') on conflict (id) do nothing;
  perform set_config('app.test_uid', v_uid::text, false);

  select content_id into v_content from public.save_user_content_draft(null, 'lesson', 'Att', null, true, 1,
    '{"itemType":"lesson","title":"Att","content":"c","explanation":"e"}'::jsonb, null);

  v_att := public.add_external_attachment(v_content, 'url', 'learner_resource', 'https://example.com/x', null, 'ref');
  if not exists (
    select 1 from public.user_content_attachments
      where id = v_att and user_id = v_uid and attachment_kind = 'url'
        and visibility = 'learner_resource' and external_url = 'https://example.com/x'
  ) then
    raise exception '#487: external URL attachment not stored as expected';
  end if;

  begin
    perform public.add_external_attachment(v_content, 'url', 'author_source', 'http://insecure', null, null);
    raise exception '#487: http url should be rejected';
  exception when others then
    if sqlstate <> '22023' then raise; end if;
  end;

  begin
    perform public.add_external_attachment(v_content, 'lesson_ref', 'author_source', null, null, null);
    raise exception '#487: lesson_ref without an id should be rejected';
  exception when others then
    if sqlstate <> '22023' then raise; end if;
  end;

  perform public.set_attachment_visibility(v_att, 'author_source');
  select visibility into v_vis from public.user_content_attachments where id = v_att;
  if v_vis <> 'author_source' then
    raise exception '#487: set_attachment_visibility failed';
  end if;

  perform public.delete_attachment(v_att);
  if exists (select 1 from public.user_content_attachments where id = v_att) then
    raise exception '#487: delete_attachment failed';
  end if;

  perform public.delete_user_content(v_content, 'delete_all');
  perform set_config('app.test_uid', '', false);
  delete from auth.users where id = v_uid;
  raise notice 'user content external attachments smoke OK';
end $$;

-- 30) #487: Storage bucket + owner-scoped RLS on storage.objects. The private
-- bucket exists; foldername() extracts the owner segment; an authenticated user
-- can insert/read only objects under their own uid path, not another user's.
do $$
declare
  v_a uuid := '00000000-0000-0000-0000-0000000000b0';
  v_b uuid := '00000000-0000-0000-0000-0000000000b1';
  v_seen integer;
  v_public boolean;
begin
  select public into v_public from storage.buckets where id = 'user-content-attachments';
  if v_public is distinct from false then
    raise exception '#487: user-content-attachments bucket must exist and be private';
  end if;

  if (storage.foldername(v_a::text || '/c1/att1/file.png')) <> array[v_a::text, 'c1', 'att1'] then
    raise exception '#487: storage.foldername did not return the owner-namespaced segments';
  end if;

  insert into auth.users (id) values (v_a), (v_b) on conflict (id) do nothing;

  perform set_config('app.test_uid', v_a::text, true);
  set local role authenticated;

  -- Owner-namespaced insert is allowed.
  insert into storage.objects (bucket_id, name, owner)
  values ('user-content-attachments', v_a::text || '/c1/att1/ok.png', v_a);

  -- Writing under another user's namespace is blocked by RLS.
  begin
    insert into storage.objects (bucket_id, name, owner)
    values ('user-content-attachments', v_b::text || '/c1/att1/nope.png', v_a);
    raise exception '#487: RLS should block writing under another user path';
  exception when insufficient_privilege then
    null; -- expected
  end;

  -- The owner reads only their own object.
  select count(*) into v_seen from storage.objects
    where bucket_id = 'user-content-attachments';
  if v_seen <> 1 then
    raise exception '#487: owner saw % storage objects, expected exactly its own 1', v_seen;
  end if;

  reset role;
  perform set_config('app.test_uid', '', true);

  delete from storage.objects where owner = v_a;
  delete from auth.users where id in (v_a, v_b);
  raise notice 'user content storage bucket + RLS smoke OK';
end $$;

-- 31) #487: add_file_attachment records an uploaded-file metadata row for the
-- owner, validates the storage path lives under <uid>/<contentId>/, and rejects
-- foreign paths, bad kinds, and out-of-range sizes. Self-cleaning.
do $$
declare
  v_uid uuid := '00000000-0000-0000-0000-0000000000b2';
  v_other uuid := '00000000-0000-0000-0000-0000000000b3';
  v_content uuid;
  v_att uuid;
  v_kind text;
  v_path text;
begin
  insert into auth.users (id, email) values (v_uid, 'uc-file@example.test') on conflict (id) do nothing;
  perform set_config('app.test_uid', v_uid::text, false);

  select content_id into v_content from public.save_user_content_draft(null, 'lesson', 'Files', null, true, 1,
    '{"itemType":"lesson","title":"Files","content":"c","explanation":"e"}'::jsonb, null);

  v_path := v_uid::text || '/' || v_content::text || '/att1/diagram.png';
  v_att := public.add_file_attachment(v_content, 'image', 'learner_resource', v_path, 'diagram.png', 'image/png', 1234);
  select attachment_kind, storage_path into v_kind, v_path
    from public.user_content_attachments where id = v_att and user_id = v_uid;
  if v_kind <> 'image' then
    raise exception '#487: file attachment not stored as expected';
  end if;

  -- Path under another user's namespace is rejected.
  begin
    perform public.add_file_attachment(v_content, 'pdf', 'author_source',
      v_other::text || '/' || v_content::text || '/att2/x.pdf', 'x.pdf', 'application/pdf', 10);
    raise exception '#487: foreign storage path should be rejected';
  exception when others then
    if sqlstate <> '22023' then raise; end if;
  end;

  -- Non-file kind is rejected by this RPC.
  begin
    perform public.add_file_attachment(v_content, 'url', 'author_source',
      v_uid::text || '/' || v_content::text || '/att3/f', 'f', 'text/plain', 10);
    raise exception '#487: non-file kind should be rejected';
  exception when others then
    if sqlstate <> '22023' then raise; end if;
  end;

  -- Oversized upload is rejected.
  begin
    perform public.add_file_attachment(v_content, 'file', 'author_source',
      v_uid::text || '/' || v_content::text || '/att4/big', 'big', 'text/plain', 999999999);
    raise exception '#487: oversized file should be rejected';
  exception when others then
    if sqlstate <> '22023' then raise; end if;
  end;

  perform public.delete_user_content(v_content, 'delete_all');
  perform set_config('app.test_uid', '', false);
  delete from auth.users where id = v_uid;
  raise notice 'user content file attachment smoke OK';
end $$;
