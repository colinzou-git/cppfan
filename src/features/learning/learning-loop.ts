export const learningLoopSteps = [
  "choose_skill",
  "learn_concept",
  "practice_immediately",
  "log_event",
  "update_review_schedule",
  "update_mastery",
  "recommend_next_action"
] as const;

export type LearningLoopStep = (typeof learningLoopSteps)[number];
