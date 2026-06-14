"use server";

import { gradeChoiceAttempt } from "./grading";
import { getGradingChoices, gradeViaRpc, recordAttempt } from "./attempt-service";
import { getPrimarySkillId } from "./learning-item-seed";
import { recordSkillEvents } from "@/features/events/event-service";

export type SubmitAnswerResult =
  | { status: "invalid" }
  | { status: "error" }
  | { status: "graded"; isCorrect: boolean; correctChoiceId: string; persisted: boolean };

/**
 * Grade a submitted choice for a learning item and, when the learner is signed
 * in, record the attempt. Seed grading is used only in deliberate non-database
 * modes (Supabase unconfigured, or the grading function not migrated yet); a
 * configured-database failure returns a degraded `error` result rather than
 * silently grading against the bundled seed (#146). Recording is best-effort.
 */
export async function submitAnswer(input: { itemId: string; choiceId: string }): Promise<SubmitAnswerResult> {
  const itemId = typeof input?.itemId === "string" ? input.itemId : "";
  const choiceId = typeof input?.choiceId === "string" ? input.choiceId : "";

  if (!itemId || !choiceId) {
    return { status: "invalid" };
  }

  // Prefer the DB-authoritative, answer-key-hiding RPC.
  const viaRpc = await gradeViaRpc(itemId, choiceId);

  if (viaRpc.status === "error") {
    // Configured database failed — do not grade against the seed answer key.
    return { status: "error" };
  }

  // graded → use the database result; unconfigured/unavailable → legitimate
  // seed grading (demo or pre-migration mode).
  const outcome =
    viaRpc.status === "graded"
      ? ({ status: "graded", isCorrect: viaRpc.isCorrect, correctChoiceId: viaRpc.correctChoiceId } as const)
      : gradeChoiceAttempt(await getGradingChoices(itemId), choiceId);

  if (outcome.status === "invalid") {
    return { status: "invalid" };
  }

  const persisted = await recordAttempt({ itemId, choiceId });

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
