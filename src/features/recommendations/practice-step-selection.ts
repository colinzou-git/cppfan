import type { LearningItemType } from "@/features/learning-items/learning-item-types";
import type { SkillStatus } from "@/features/mastery/mastery-types";

export type PracticeEvidenceLevel = "recognition" | "reconstruction" | "independent_application";

export type PracticeStepSelection = {
  preferredTypes: LearningItemType[];
  evidenceLevel: PracticeEvidenceLevel;
  reason: string;
};

function hasOrderingEvidence(tags: readonly string[]): boolean {
  return tags.some((tag) => /order|syntax|loop|structure/i.test(tag));
}

/**
 * Deterministic adaptive-practice rule for #72/#124. It chooses a learning-item
 * type family from mastery/error evidence only; it does not touch FSRS state.
 */
export function selectPracticeStep(input: {
  status: SkillStatus | "unknown";
  recentErrorTags?: readonly string[];
}): PracticeStepSelection {
  const tags = input.recentErrorTags ?? [];

  if (hasOrderingEvidence(tags)) {
    return {
      preferredTypes: ["parsons", "completion", "worked_example"],
      evidenceLevel: "reconstruction",
      reason: "Recent ordering or syntax mistakes make rebuilding the code structure the best next step."
    };
  }

  if (input.status === "strong" || input.status === "mastered") {
    return {
      preferredTypes: ["code_reading", "bug_spotting", "multiple_choice"],
      evidenceLevel: "independent_application",
      reason: "This skill is already strong, so the next step should ask you to apply it with less support."
    };
  }

  if (input.status === "weak" || input.status === "regressed") {
    return {
      preferredTypes: ["completion", "parsons", "worked_example"],
      evidenceLevel: "reconstruction",
      reason: "Recent evidence is weak, so practice should rebuild the missing code shape before full recall."
    };
  }

  return {
    preferredTypes: ["worked_example", "completion", "parsons", "multiple_choice"],
    evidenceLevel: "recognition",
    reason: "This is the next supported step for building the skill from an example toward practice."
  };
}
