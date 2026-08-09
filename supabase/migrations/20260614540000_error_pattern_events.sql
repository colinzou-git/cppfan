-- Roadmap #73 / #126 (wrong-answer remediation): add the stable
-- error_pattern_observed and error_pattern_cleared skill-event names so a
-- recurring misconception is recorded as evidence (in skill_events, separate from
-- FSRS) when it crosses the observe threshold and when it clears. The complete
-- stable allowlist is intentional: this historical migration is replayed on
-- every deploy, including after rows with newer event names exist. Keeping a
-- narrower point-in-time constraint here would make replay non-idempotent.
-- Mirrors src/features/events/event-names.ts and
-- docs/EVENT_SCHEMA_STABLE_NAMES.md.

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
    'error_pattern_cleared',
    'worked_example_viewed',
    'completion_submitted',
    'parsons_submitted',
    'parsons_hint_used',
    'parsons_checked',
    'capstone_milestone_started',
    'capstone_milestone_completed',
    'capstone_reflection_submitted',
    'placement_started',
    'placement_completed',
    'placement_reset'
  ));
