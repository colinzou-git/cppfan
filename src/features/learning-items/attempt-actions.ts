"use server";

import { randomUUID } from "node:crypto";
import { submitGradedAnswer, type SubmitAnswerResult } from "./submit-service";

/**
 * Grade a submitted choice and, when the learner is signed in, atomically record
 * the attempt, enroll an eligible review card, and append skill events through one
 * idempotent server-authoritative RPC (#218). A stable `submissionId` makes
 * retries and double taps idempotent; one is generated when the caller omits it.
 * Seed grading (no persistence) is used only in deliberate non-database modes; a
 * configured-database failure returns a degraded error rather than seed-grading
 * (#146).
 */
export async function submitAnswer(input: {
  itemId: string;
  choiceId: string;
  submissionId?: string;
}): Promise<SubmitAnswerResult> {
  const itemId = typeof input?.itemId === "string" ? input.itemId : "";
  const choiceId = typeof input?.choiceId === "string" ? input.choiceId : "";

  if (!itemId || !choiceId) {
    return { status: "invalid" };
  }

  const submissionId =
    typeof input?.submissionId === "string" && input.submissionId ? input.submissionId : randomUUID();

  return submitGradedAnswer(itemId, choiceId, submissionId);
}
