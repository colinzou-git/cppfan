-- #441: One-time, auditable reconciliation of legacy/invalid
-- skill_events.event_type values so the stable skill_events_event_type_check
-- constraint can be enforced again.
--
-- WHY THIS EXISTS
-- A production row whose event_type is outside the stable allowlist blocks the
-- June 14 constraint rewrite (and therefore every later migration). This script
-- quarantines the offending rows into an audit table, remaps the ones whose
-- legacy spelling has an unambiguous stable equivalent (camelCase -> snake_case),
-- and FAILS LOUDLY if any unknown value remains so a human decides what it means.
-- It never weakens the constraint and never deletes evidence.
--
-- HOW TO RUN (inspect first, then run against production):
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f scripts/db/reconcile-invalid-skill-event-types.sql
--
-- The whole script runs in ONE transaction. If any unknown invalid value is
-- present it raises and rolls back, leaving production untouched — re-run only
-- after a human has either added a justified mapping below or handled the row
-- manually. On success it commits: the audit table holds the pre-mutation copy
-- of every reconciled row and skill_events is clean.

begin;

-- Audit / quarantine table: pre-mutation snapshot of every reconciled row.
-- Server-side only; clients must never read it.
create table if not exists public.skill_events_event_type_reconciliation_audit (
  audit_id uuid primary key default gen_random_uuid(),
  reconciled_at timestamptz not null default now(),
  original_id uuid not null,
  original_user_id uuid not null,
  original_skill_id text,
  original_learning_item_id text,
  original_review_card_id uuid,
  original_event_type text not null,
  original_event_time timestamptz not null,
  original_metadata jsonb not null,
  action text not null,                 -- 'remapped' | 'quarantined_unknown'
  new_event_type text,
  note text
);

alter table public.skill_events_event_type_reconciliation_audit enable row level security;
revoke all on public.skill_events_event_type_reconciliation_audit from anon, authenticated;

do $$
declare
  -- Canonical stable allowlist (mirrors src/features/events/event-names.ts).
  v_allowed text[] := array[
    'lesson_started','concept_seen','quiz_attempted','quiz_correct','quiz_wrong',
    'hint_used','review_completed','code_attempted','code_passed','skill_mastered',
    'skill_regressed','error_pattern_observed','error_pattern_cleared',
    'worked_example_viewed','completion_submitted','parsons_submitted',
    'parsons_hint_used','parsons_checked','capstone_milestone_started',
    'capstone_milestone_completed','capstone_reflection_submitted',
    'placement_started','placement_completed','placement_reset'
  ];
  -- Known legacy spellings -> stable name. Add a row here ONLY when the semantic
  -- mapping is unambiguous; an unrecognized value must stay unknown.
  v_known jsonb := jsonb_build_object(
    'quizAttempted','quiz_attempted',
    'quizCorrect','quiz_correct',
    'quizWrong','quiz_wrong',
    'hintUsed','hint_used',
    'reviewCompleted','review_completed',
    'codeAttempted','code_attempted',
    'codePassed','code_passed',
    'skillMastered','skill_mastered',
    'skillRegressed','skill_regressed',
    'lessonStarted','lesson_started',
    'conceptSeen','concept_seen',
    'errorPatternObserved','error_pattern_observed',
    'errorPatternCleared','error_pattern_cleared',
    'workedExampleViewed','worked_example_viewed',
    'completionSubmitted','completion_submitted',
    'parsonsSubmitted','parsons_submitted',
    'parsonsHintUsed','parsons_hint_used',
    'parsonsChecked','parsons_checked',
    'capstoneMilestoneStarted','capstone_milestone_started',
    'capstoneMilestoneCompleted','capstone_milestone_completed',
    'capstoneReflectionSubmitted','capstone_reflection_submitted',
    'placementStarted','placement_started',
    'placementCompleted','placement_completed',
    'placementReset','placement_reset'
  );
  v_total_invalid bigint;
  v_remapped bigint := 0;
  v_unknown text;
  v_legacy text;
  v_stable text;
begin
  if to_regclass('public.skill_events') is null then
    raise notice 'skill_events does not exist; nothing to reconcile.';
    return;
  end if;

  select count(*) into v_total_invalid
    from public.skill_events
    where event_type <> all (v_allowed);

  if v_total_invalid = 0 then
    raise notice 'No invalid skill_events.event_type rows. Nothing to reconcile.';
    return;
  end if;

  raise notice 'Found % skill_events row(s) with an invalid event_type.', v_total_invalid;

  -- 1) Remap every KNOWN legacy spelling, auditing the pre-mutation row first.
  for v_legacy, v_stable in select key, value from jsonb_each_text(v_known)
  loop
    insert into public.skill_events_event_type_reconciliation_audit (
      original_id, original_user_id, original_skill_id, original_learning_item_id,
      original_review_card_id, original_event_type, original_event_time,
      original_metadata, action, new_event_type, note
    )
    select id, user_id, skill_id, learning_item_id, review_card_id, event_type,
           event_time, metadata, 'remapped', v_stable, 'issue #441 reconciliation'
      from public.skill_events
      where event_type = v_legacy;

    update public.skill_events
       set event_type = v_stable,
           metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
             'reconciled_from_event_type', v_legacy,
             'event_type_reconciled_at', now(),
             'event_type_reconciliation_issue', '441'
           )
     where event_type = v_legacy;

    get diagnostics v_remapped = row_count;
    if v_remapped > 0 then
      raise notice '  remapped % row(s): % -> %', v_remapped, v_legacy, v_stable;
    end if;
  end loop;

  -- 2) Anything still invalid is UNKNOWN. Capture it, then fail so a human decides.
  select string_agg(event_type || ':' || c, ', ' order by event_type)
    into v_unknown
  from (
    select event_type, count(*)::text c
      from public.skill_events
      where event_type <> all (v_allowed)
      group by event_type
  ) s;

  if v_unknown is not null then
    insert into public.skill_events_event_type_reconciliation_audit (
      original_id, original_user_id, original_skill_id, original_learning_item_id,
      original_review_card_id, original_event_type, original_event_time,
      original_metadata, action, new_event_type, note
    )
    select id, user_id, skill_id, learning_item_id, review_card_id, event_type,
           event_time, metadata, 'quarantined_unknown', null,
           'issue #441: unknown legacy event_type, needs human decision'
      from public.skill_events
      where event_type <> all (v_allowed);

    raise exception using
      errcode = 'check_violation',
      message = 'Unknown invalid skill_events.event_type value(s) remain after '
        || 'known-mapping reconciliation: ' || v_unknown,
      hint = 'Inspect these rows, then EITHER add a justified mapping to v_known '
        || 'in this script OR handle them manually. Transaction rolled back; '
        || 'production is unchanged.';
  end if;

  raise notice 'Reconciliation complete; all invalid rows mapped to stable names.';
end $$;

-- Final assertion inside the same transaction: zero invalid rows remain.
do $$
declare
  v_left bigint;
begin
  select count(*) into v_left
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
  if v_left <> 0 then
    raise exception 'Post-reconciliation guard: % invalid row(s) still present.', v_left;
  end if;
end $$;

commit;
