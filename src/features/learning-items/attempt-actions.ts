"use server";

import { gradeChoiceAttempt } from "./grading";
import { getGradingChoices, recordAttempt } from "./attempt-service";
import { getPrimarySkillId } from "./learning-item-seed";
import { recordSkillEvents } from "@/features/events/event-service";

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

  // Append skill-mastery evidence (best effort; no-op when signed out).
  const skillId = getPrimarySkillId(itemId);
  await recordSkillEvents([
    { eventType: "quiz_attempted", skillId, learningItemId: itemId },
    { eventType: outcome.isCorrect ? "quiz_correct" : "quiz_wrong", skillId, learningItemId: itemId }
  ]);

  return {
    status: "graded",
    isCorrect: outcome.isCorrect,
    correctChoiceId: outcome.correctChoiceId,
    persisted
  };
}
