"use server";

import { gradeChoiceAttempt } from "./grading";
import { getGradingChoices, recordAttempt } from "./attempt-service";

export type SubmitAnswerResult =
  | { status: "invalid" }
  | { status: "graded"; isCorrect: boolean; correctChoiceId: string; persisted: boolean };

/**
 * Grade a submitted choice for a learning item and, when the learner is signed
 * in, record the attempt. Grading works even when Supabase is unconfigured or
 * the migration is not applied (it falls back to the bundled seed); recording
 * is best-effort.
 */
export async function submitAnswer(input: { itemId: string; choiceId: string }): Promise<SubmitAnswerResult> {
  const itemId = typeof input?.itemId === "string" ? input.itemId : "";
  const choiceId = typeof input?.choiceId === "string" ? input.choiceId : "";

  if (!itemId || !choiceId) {
    return { status: "invalid" };
  }

  const choices = await getGradingChoices(itemId);
  const outcome = gradeChoiceAttempt(choices, choiceId);

  if (outcome.status === "invalid") {
    return { status: "invalid" };
  }

  const persisted = await recordAttempt({ itemId, choiceId, isCorrect: outcome.isCorrect });

  return {
    status: "graded",
    isCorrect: outcome.isCorrect,
    correctChoiceId: outcome.correctChoiceId,
    persisted
  };
}
