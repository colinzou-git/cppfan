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
