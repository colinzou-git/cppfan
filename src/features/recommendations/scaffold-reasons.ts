import type { ScaffoldLevel, ScaffoldRecommendation, ScaffoldSelectionInput } from "./scaffold-selector-types";

/**
 * Human-readable scaffold reasoning (#415). Keeps reason text in one place so the
 * card and any analytics share consistent, transparent explanations.
 */

export const SCAFFOLD_LEVEL_LABELS: Record<ScaffoldLevel, string> = {
  worked_example: "Worked example",
  completion: "Completion exercise",
  parsons: "Parsons puzzle",
  code_reading: "Code reading",
  bug_spotting: "Bug spotting",
  code_lab: "Code Lab",
  review: "Spaced review",
  project_milestone: "Project milestone"
};

export function explainScaffoldRecommendation(input: ScaffoldRecommendation): string {
  return input.reason;
}

export function formatScaffoldReasonForUser(
  _input: ScaffoldSelectionInput,
  recommendation: ScaffoldRecommendation
): string {
  return `${SCAFFOLD_LEVEL_LABELS[recommendation.level]}: ${recommendation.reason}`;
}
