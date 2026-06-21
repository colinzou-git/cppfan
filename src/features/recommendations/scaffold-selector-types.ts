import type { CodeErrorTag } from "@/features/code-lab/code-error-tags";
import type { LearningItemSummary } from "@/features/code-lab/error-remediation-types";

/**
 * Adaptive scaffold-selector types (#415). Deterministic selection of the next
 * practice format from mastery status, recent errors, and item availability. No
 * ML, no mastery-scoring rewrite, no hard locks.
 */

export type ScaffoldLevel =
  | "worked_example"
  | "completion"
  | "parsons"
  | "code_reading"
  | "bug_spotting"
  | "code_lab"
  | "review"
  | "project_milestone";

export type ScaffoldSelectionInput = {
  skillId: string;
  masteryStatus: string;
  recentCorrectness?: number;
  recentHintCount?: number;
  recentCodeErrorTags?: CodeErrorTag[];
  availableItems: LearningItemSummary[];
  dueReviewCount?: number;
};

export type ScaffoldRecommendation = {
  skillId: string;
  level: ScaffoldLevel;
  itemId?: string;
  reason: string;
  priority: "low" | "medium" | "high";
};

export type { LearningItemSummary };
