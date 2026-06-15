-- Roadmap #73 / #126 (wrong-answer remediation): add the stable
-- error_pattern_observed and error_pattern_cleared skill-event names so a
-- recurring misconception is recorded as evidence (in skill_events, separate from
-- FSRS) when it crosses the observe threshold and when it clears. Extends the
-- skill_events event_type CHECK. Idempotent; mirrors
-- src/features/events/event-names.ts and docs/EVENT_SCHEMA_STABLE_NAMES.md.

alter table public.skill_events drop constraint if exists skill_events_event_type_check;
alter table public.skill_events add constraint skill_events_event_type_check
  check (event_type in (
    'lesson_started',
    'concept_seen',
    'quiz_attempted',
    'quiz_correct',
    'quiz_wrong',
    'hint_used',
    'review_completed',
    'code_attempted',
    'code_passed',
    'skill_mastered',
    'skill_regressed',
    'error_pattern_observed',
    'error_pattern_cleared'
  ));
