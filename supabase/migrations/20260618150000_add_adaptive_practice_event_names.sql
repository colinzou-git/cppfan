-- Roadmap #72 / #123: add stable adaptive-practice event names for worked
-- examples, completion, and Parsons evidence. These events live in the mastery
-- ledger and remain separate from FSRS review scheduling.

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
    'parsons_checked'
  ));
