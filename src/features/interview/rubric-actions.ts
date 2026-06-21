"use server";

import { savePeerRubricScores, saveSelfRubricScores } from "./rubric-store";
import type { RubricScore } from "./rubric";
import type { RubricActionResult } from "./rubric-action-types";

function toActionResult(outcome: "ok" | "signed_out" | "error"): RubricActionResult {
  if (outcome === "ok") {
    return { status: "ok" };
  }
  if (outcome === "signed_out") {
    return { status: "signed_out" };
  }
  return { status: "error" };
}

/**
 * Persist the learner's interview rubric self-scores (#179) so the post-session
 * review and readiness reporting can read self-reported evidence under RLS.
 * `signed_out` lets the UI keep its local heat map and prompt to sign in to save.
 */
export async function saveRubric(scores: RubricScore[]): Promise<RubricActionResult> {
  if (!Array.isArray(scores)) {
    return { status: "error" };
  }
  return toActionResult(await saveSelfRubricScores(scores));
}

/**
 * Persist peer-interviewer rubric scores (#179) separately from self scores, so
 * a mock-interview partner's assessment stays a distinct, trusted feedback source
 * in the review and readiness model rather than being merged with self-reporting.
 */
export async function savePeerRubric(scores: RubricScore[]): Promise<RubricActionResult> {
  if (!Array.isArray(scores)) {
    return { status: "error" };
  }
  return toActionResult(await savePeerRubricScores(scores));
}
