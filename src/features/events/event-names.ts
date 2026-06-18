/*
 * Stable skill-event names. These MUST match docs/EVENT_SCHEMA_STABLE_NAMES.md
 * exactly — they appear in the database, analytics, and tests, so they are not
 * safe to rename casually. A unit test guards this list against the doc set.
 */
export const SKILL_EVENT_NAMES = [
  "lesson_started",
  "concept_seen",
  "quiz_attempted",
  "quiz_correct",
  "quiz_wrong",
  "hint_used",
  "review_completed",
  "code_attempted",
  "code_passed",
  "skill_mastered",
  "skill_regressed",
  "error_pattern_observed",
  "error_pattern_cleared",
  "worked_example_viewed",
  "completion_submitted",
  "parsons_submitted",
  "parsons_hint_used",
  "parsons_checked",
  "capstone_milestone_started",
  "capstone_milestone_completed",
  "capstone_reflection_submitted"
] as const;

export type SkillEventName = (typeof SKILL_EVENT_NAMES)[number];

export function isSkillEventName(value: string): value is SkillEventName {
  return (SKILL_EVENT_NAMES as readonly string[]).includes(value);
}
