export type LearningItemType =
  | "lesson"
  | "concept_check"
  | "multiple_choice"
  | "code_reading"
  | "bug_spotting"
  | "parsons"
  | "worked_example"
  | "completion";

export type LearningItemDifficulty = "beginner" | "intermediate" | "advanced";

export type LearningItem = {
  id: string;
  type: LearningItemType;
  title: string;
  prompt: string;
  explanation: string | null;
  difficulty: LearningItemDifficulty;
  estimated_minutes: number;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type LearningItemSkill = {
  learning_item_id: string;
  skill_id: string;
  is_primary: boolean;
  created_at?: string;
};

export type LearningItemChoice = {
  id: string;
  learning_item_id: string;
  content: string;
  order_index: number;
  /**
   * The answer key. Present in seed/server data but never sent to the client
   * for display; grading (issue #3) compares server-side.
   */
  is_correct?: boolean;
  created_at?: string;
};

/** Choice as shown to the learner — never carries the answer key. */
export type PublicLearningItemChoice = Omit<LearningItemChoice, "is_correct">;

/**
 * One draggable line of a Parsons problem. `correct_order` (the solution
 * position) and `is_distractor` are answer-bearing: present in seed/server data
 * for grading but never sent to the learner before submission (#123).
 */
export type ParsonsBlock = {
  id: string;
  learning_item_id: string;
  content: string;
  /** 1-based position in the correct solution; 0 for distractors. */
  correct_order: number;
  /** A line that does not belong in the solution. */
  is_distractor: boolean;
};

/** Parsons block as shown to the learner — no solution position, no distractor flag. */
export type PublicParsonsBlock = Pick<ParsonsBlock, "id" | "learning_item_id" | "content">;

/**
 * One fill-in blank of a `completion` item. `answer` is the expected text and is
 * answer-bearing: present in seed/server data for grading but never sent to the
 * learner before submission (#123). `position` is the 1-based blank order.
 */
export type CompletionBlank = {
  id: string;
  learning_item_id: string;
  position: number;
  answer: string;
};

/** Completion blank as shown to the learner — position only, never the answer. */
export type PublicCompletionBlank = Pick<CompletionBlank, "id" | "learning_item_id" | "position">;

export type LearningItemWithDetails = {
  item: LearningItem;
  skills: LearningItemSkill[];
  choices: PublicLearningItemChoice[];
};

export type LearningItemSource = "seed" | "database";
