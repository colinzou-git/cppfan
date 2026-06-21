import type { LearningItemCodeLab } from "./code-lab-types";
import type { CodePredictionPrompt } from "./prediction-types";

/**
 * Prediction prompt selection (#413). Pure data; safe on client and server. An
 * item may supply explicit `predictionPrompts`; otherwise defaults are derived
 * from the item shape and skill tags.
 */

const STDOUT_PROMPT: CodePredictionPrompt = {
  id: "stdout",
  kind: "stdout",
  label: "What do you expect the output (stdout) to be?",
  placeholder: "Type the exact output you expect",
  required: true
};

const FAILING_TEST_PROMPT: CodePredictionPrompt = {
  id: "failing_test",
  kind: "failing_test",
  label: "Which visible test do you expect to fail (or 'none')?",
  placeholder: "Test name, or 'none'"
};

const LOOP_INVARIANT_PROMPT: CodePredictionPrompt = {
  id: "loop_invariant",
  kind: "loop_invariant",
  label: "What stays true on every loop iteration (the invariant)?"
};

const COMPLEXITY_PROMPT: CodePredictionPrompt = {
  id: "complexity",
  kind: "complexity",
  label: "What time complexity do you expect (e.g. O(n))?"
};

export function getPredictionPromptsForSkills(skillIds: string[]): CodePredictionPrompt[] {
  const haystack = skillIds.join(" ").toLowerCase();
  const prompts: CodePredictionPrompt[] = [];
  if (/loop|control_flow|traversal/.test(haystack)) prompts.push(LOOP_INVARIANT_PROMPT);
  if (/dsa|complexity|search|sort|graph|dp/.test(haystack)) prompts.push(COMPLEXITY_PROMPT);
  return prompts;
}

export function getDefaultPredictionPrompts(config: LearningItemCodeLab): CodePredictionPrompt[] {
  if (config.predictionPrompts && config.predictionPrompts.length > 0) {
    return config.predictionPrompts;
  }
  const prompts: CodePredictionPrompt[] = [STDOUT_PROMPT];
  if ((config.visibleTests ?? []).length > 0) {
    prompts.push(FAILING_TEST_PROMPT);
  }
  prompts.push(...getPredictionPromptsForSkills(config.skillTags ?? []));
  return prompts;
}
