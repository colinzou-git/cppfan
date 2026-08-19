import type { ReviewRating } from "@/lib/fsrs/scheduler";
import { isMissingObjectError } from "@/lib/supabase/errors";

export const LESSON_COMPLETION_CHOICES = ["hard", "good", "mastered"] as const;

export type LessonCompletionChoice = (typeof LESSON_COMPLETION_CHOICES)[number];
export type LessonFsrsRating = Extract<ReviewRating, "hard" | "good" | "easy">;

export type LessonRatingState =
  | { state: "unrated" }
  | { state: "scheduled"; cardId: string; dueAt: string; reps: number }
  | { state: "signed_out" }
  | { state: "unavailable" };

export type RateLessonCompletionResult =
  | {
      status: "ok" | "already_processed";
      cardId: string;
      fsrsRating: LessonFsrsRating;
      dueAt: string;
    }
  | { status: "already_scheduled"; cardId: string; dueAt: string }
  | { status: "signed_out" | "invalid" | "unavailable" | "error" };

export function isLessonCompletionChoice(value: unknown): value is LessonCompletionChoice {
  return (
    typeof value === "string" && (LESSON_COMPLETION_CHOICES as readonly string[]).includes(value)
  );
}

/** "Mastered" is presentation copy only; FSRS and persistence continue to use `easy`. */
export function lessonChoiceToFsrsRating(choice: LessonCompletionChoice): LessonFsrsRating {
  return choice === "mastered" ? "easy" : choice;
}

type LessonRatingRpcResult = {
  data: unknown;
  error: { code?: string | null } | null;
};

export function classifyLessonRatingRpc(result: LessonRatingRpcResult): RateLessonCompletionResult {
  if (result.error) {
    return { status: isMissingObjectError(result.error) ? "unavailable" : "error" };
  }

  const row = (Array.isArray(result.data) ? result.data[0] : result.data) as {
    status?: unknown;
    card_id?: unknown;
    due_at?: unknown;
    fsrs_rating?: unknown;
  } | null;
  const status = row?.status;

  if (
    (status === "ok" || status === "already_processed") &&
    typeof row?.card_id === "string" &&
    typeof row?.due_at === "string" &&
    (row?.fsrs_rating === "hard" || row?.fsrs_rating === "good" || row?.fsrs_rating === "easy")
  ) {
    return {
      status,
      cardId: row.card_id,
      dueAt: row.due_at,
      fsrsRating: row.fsrs_rating
    };
  }

  if (
    status === "already_scheduled" &&
    typeof row?.card_id === "string" &&
    typeof row?.due_at === "string"
  ) {
    return { status, cardId: row.card_id, dueAt: row.due_at };
  }

  if (status === "invalid") {
    return { status: "invalid" };
  }

  return { status: "error" };
}
