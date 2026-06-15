"use server";

import { saveSelfRubricScores } from "./rubric-store";
import type { RubricScore } from "./rubric";
import type { RubricActionResult } from "./rubric-action-types";

/**
 * Persist the learner's interview rubric self-scores (#179) so the post-session
 * review and readiness reporting can read self-reported evidence under RLS.
 * `signed_out` lets the UI keep its local heat map and prompt to sign in to save.
 */
export async function saveRubric(scores: RubricScore[]): Promise<RubricActionResult> {
  if (!Array.isArray(scores)) {
    return { status: "error" };
  }
  const outcome = await saveSelfRubricScores(scores);
  if (outcome === "ok") {
    return { status: "ok" };
  }
  if (outcome === "signed_out") {
    return { status: "signed_out" };
  }
  return { status: "error" };
}
