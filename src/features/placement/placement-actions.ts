"use server";

import { clearPlacement, runPlacement } from "./placement-service";
import type { PlacementResetResult, PlacementSubmitResult } from "./placement-action-types";

/**
 * Grade an optional placement assessment and, when signed in, persist the
 * per-module suggestions. Suggestion-only: never locks content or writes mastery.
 * Works signed out (results returned, not persisted).
 */
export async function submitPlacement(input: {
  answers: Record<string, string>;
}): Promise<PlacementSubmitResult> {
  const answers = input?.answers;
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return { status: "invalid" };
  }
  return runPlacement(answers as Record<string, string>);
}

/** Reset the signed-in learner's stored placement results (optional + reversible). */
export async function resetPlacement(): Promise<PlacementResetResult> {
  return clearPlacement();
}
