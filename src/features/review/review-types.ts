import type { ReviewCardState } from "@/lib/fsrs/scheduler";
import type {
  LearningItemType,
  PublicLearningItemChoice
} from "@/features/learning-items/learning-item-types";

export type ReviewCard = {
  id: string;
  user_id: string;
  learning_item_id: string;
  skill_id: string;
  state: ReviewCardState;
  due_at: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  last_reviewed_at: string | null;
  created_at?: string;
  updated_at?: string;
};

/** A due review card joined with the learning item it reviews. */
export type DueReviewEntry = {
  cardId: string;
  itemId: string;
  skillId: string;
  title: string;
  type: LearningItemType;
  prompt: string;
  /** Revealed only after the learner attempts recall. May be null for items with no explanation. */
  explanation: string | null;
  /** Public choices (no answer key) shown as neutral reference after reveal. */
  choices: PublicLearningItemChoice[];
};

/** An eligible item shown before the learner has signed in / created cards. */
export type ReviewPreviewEntry = {
  itemId: string;
  skillId: string;
  title: string;
  type: LearningItemType;
};

export type ReviewQueueView = {
  authenticated: boolean;
  due: DueReviewEntry[];
  preview: ReviewPreviewEntry[];
};
