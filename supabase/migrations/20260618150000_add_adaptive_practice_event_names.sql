-- Roadmap #72 / #123: add stable adaptive-practice event names for worked
-- examples, completion, and Parsons evidence. These events live in the mastery
-- ledger and remain separate from FSRS review scheduling. The complete stable
-- allowlist keeps this historical constraint rewrite safe to replay after newer
-- event names have been recorded.

alter table public.skill_events drop constraint if exists skill_events_event_type_check;
alter table public.skill_events add constraint skill_events_event_type_check
  check (event_type in (
    'lesson_started',
    'lesson_self_assessed',
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
