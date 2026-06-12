export type LearningItemType =
  | "lesson"
  | "concept_check"
  | "multiple_choice"
  | "code_reading"
  | "bug_spotting";

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

export type LearningItemWithDetails = {
  item: LearningItem;
  skills: LearningItemSkill[];
  choices: PublicLearningItemChoice[];
};

export type LearningItemSource = "seed" | "database";
