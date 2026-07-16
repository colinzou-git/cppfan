-- #441: READ-ONLY inspector for legacy/invalid skill_events.event_type values.
--
-- WHY THIS EXISTS
-- Before anyone reconciles production data (scripts/db/reconcile-invalid-skill-
-- event-types.sql) or re-runs the blocked migration deploy, an operator needs to
-- SEE exactly which event_type value(s) are outside the stable allowlist and how
-- many rows each affects. This script answers that question WITHOUT mutating
-- anything: it runs inside a read-only transaction that always rolls back, so it
-- is safe to point straight at production.
--
-- HOW TO RUN
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f scripts/db/inspect-invalid-skill-event-types.sql
--
-- Reading the output:
--   * Report 1 groups each invalid event_type with a row count and whether the
--     reconciliation script already knows a safe mapping for it. Values marked
--     "UNKNOWN" have no mapping yet and need a human decision before reconciling.
--   * Report 2 lists the affected rows (most recent first) for forensic context.
-- If both reports are empty, production is already clean and the constraint
-- rewrite can be replayed as-is.

begin;
-- Hard guarantee: this session cannot write. Any accidental DML would error.
set transaction read only;

\echo '== Report 1: invalid skill_events.event_type values (grouped) =='

with allowed(name) as (
  values
    ('lesson_started'),('concept_seen'),('quiz_attempted'),('quiz_correct'),
    ('quiz_wrong'),('hint_used'),('review_completed'),('code_attempted'),
    ('code_passed'),('skill_mastered'),('skill_regressed'),
    ('error_pattern_observed'),('error_pattern_cleared'),('worked_example_viewed'),
    ('completion_submitted'),('parsons_submitted'),('parsons_hint_used'),
    ('parsons_checked'),('capstone_milestone_started'),
    ('capstone_milestone_completed'),('capstone_reflection_submitted'),
    ('placement_started'),('placement_completed'),('placement_reset')
),
-- Mirrors v_known in reconcile-invalid-skill-event-types.sql: legacy spellings
-- with an unambiguous stable equivalent. Keep the two lists in sync.
known(legacy, stable) as (
  values
    ('quizAttempted','quiz_attempted'),('quizCorrect','quiz_correct'),
    ('quizWrong','quiz_wrong'),('hintUsed','hint_used'),
    ('reviewCompleted','review_completed'),('codeAttempted','code_attempted'),
    ('codePassed','code_passed'),('skillMastered','skill_mastered'),
    ('skillRegressed','skill_regressed'),('lessonStarted','lesson_started'),
    ('conceptSeen','concept_seen'),('errorPatternObserved','error_pattern_observed'),
    ('errorPatternCleared','error_pattern_cleared'),
    ('workedExampleViewed','worked_example_viewed'),
    ('completionSubmitted','completion_submitted'),
    ('parsonsSubmitted','parsons_submitted'),('parsonsHintUsed','parsons_hint_used'),
    ('parsonsChecked','parsons_checked'),
    ('capstoneMilestoneStarted','capstone_milestone_started'),
    ('capstoneMilestoneCompleted','capstone_milestone_completed'),
    ('capstoneReflectionSubmitted','capstone_reflection_submitted'),
    ('placementStarted','placement_started'),
    ('placementCompleted','placement_completed'),('placementReset','placement_reset')
),
invalid as (
  select event_type, count(*) as row_count
    from public.skill_events
    where event_type not in (select name from allowed)
    group by event_type
)
select
  i.event_type,
  i.row_count,
  case
    when k.stable is not null then 'known -> ' || k.stable
    else 'UNKNOWN (needs human decision before reconciling)'
  end as reconciliation
from invalid i
left join known k on k.legacy = i.event_type
order by i.row_count desc, i.event_type;

\echo '== Report 2: affected rows (most recent first, capped at 500) =='

with allowed(name) as (
  values
    ('lesson_started'),('concept_seen'),('quiz_attempted'),('quiz_correct'),
    ('quiz_wrong'),('hint_used'),('review_completed'),('code_attempted'),
    ('code_passed'),('skill_mastered'),('skill_regressed'),
    ('error_pattern_observed'),('error_pattern_cleared'),('worked_example_viewed'),
    ('completion_submitted'),('parsons_submitted'),('parsons_hint_used'),
    ('parsons_checked'),('capstone_milestone_started'),
    ('capstone_milestone_completed'),('capstone_reflection_submitted'),
    ('placement_started'),('placement_completed'),('placement_reset')
)
select
  id, user_id, skill_id, learning_item_id, review_card_id,
  event_type, event_time, metadata
from public.skill_events
where event_type not in (select name from allowed)
order by event_time desc
limit 500;

rollback;
