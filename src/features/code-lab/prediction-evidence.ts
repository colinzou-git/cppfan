import type { CodePredictionComparison } from "./prediction-types";

/**
 * Prediction skill-event drafts (#413). Drafts only — this issue does NOT wire
 * events into the ledger or change mastery scoring; later phases may consume
 * them. Stable draft event names mirror the suggested schema.
 */

export type PredictionSkillEventDraft = {
  eventType:
    | "code_prediction_submitted"
    | "code_prediction_matched"
    | "code_prediction_mismatched";
  itemId: string;
  skillId: string;
  promptId: string;
};

export function toPredictionSkillEvents(input: {
  itemId: string;
  skillIds: string[];
  comparisons: CodePredictionComparison[];
}): PredictionSkillEventDraft[] {
  const drafts: PredictionSkillEventDraft[] = [];
  const skillIds = input.skillIds.length > 0 ? input.skillIds : [""];

  for (const comparison of input.comparisons) {
    for (const skillId of skillIds) {
      drafts.push({
        eventType: "code_prediction_submitted",
        itemId: input.itemId,
        skillId,
        promptId: comparison.promptId
      });
      if (comparison.status === "matched") {
        drafts.push({
          eventType: "code_prediction_matched",
          itemId: input.itemId,
          skillId,
          promptId: comparison.promptId
        });
      } else if (comparison.status === "mismatched") {
        drafts.push({
          eventType: "code_prediction_mismatched",
          itemId: input.itemId,
          skillId,
          promptId: comparison.promptId
        });
      }
    }
  }

  return drafts;
}
