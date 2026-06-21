import type { Recommendation } from "./recommendation-types";
import type { CodeRemediationRecommendation } from "@/features/code-lab/error-remediation-types";

/**
 * Merges a Code Lab remediation recommendation (#414) into the daily plan as a
 * `remediation` card. Due FSRS reviews always rank first: the code remediation is
 * inserted after any `due_reviews` recommendation, never before it. Pure.
 */

function toRecommendation(code: CodeRemediationRecommendation): Recommendation {
  const href = code.checklistId
    ? `/learn/${code.itemId}`
    : code.targetItemId
      ? `/learn/${code.targetItemId}`
      : `/learn/${code.itemId}`;
  return {
    kind: "remediation",
    title: code.title,
    reason: code.reason,
    href
  };
}

export function mergeCodeRemediationIntoDailyPlan(input: {
  existingRecommendations: Recommendation[];
  codeRecommendation: CodeRemediationRecommendation | null;
}): Recommendation[] {
  if (!input.codeRecommendation) return input.existingRecommendations;

  const card = toRecommendation(input.codeRecommendation);
  const result = [...input.existingRecommendations];

  // Insert after the last due_reviews card so due reviews are never displaced.
  let insertAt = 0;
  for (let i = 0; i < result.length; i += 1) {
    if (result[i].kind === "due_reviews") insertAt = i + 1;
  }
  result.splice(insertAt, 0, card);
  return result;
}
