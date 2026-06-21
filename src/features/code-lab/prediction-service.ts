import type { LearningItemCodeLab } from "./code-lab-types";
import type { CodePredictionPrompt, CodePredictionSubmission } from "./prediction-types";

/**
 * Prediction-mode gating (#413). Pure helpers used by the Code Lab to decide
 * whether predictions are required before Run/Test. Default mode is "off", so the
 * normal flow is unaffected unless an item opts in.
 */

export function shouldRequirePredictionBeforeRun(config: LearningItemCodeLab): boolean {
  return (config.predictionMode ?? "off") === "required_before_run";
}

export function isPredictionEnabled(config: LearningItemCodeLab): boolean {
  return (config.predictionMode ?? "off") !== "off";
}

export function hasRequiredPredictions(input: {
  prompts: CodePredictionPrompt[];
  submissions: CodePredictionSubmission[];
}): boolean {
  const filled = new Map(
    input.submissions.map((submission) => [submission.promptId, submission.value.trim()])
  );
  return input.prompts
    .filter((prompt) => prompt.required)
    .every((prompt) => (filled.get(prompt.id) ?? "").length > 0);
}
