/**
 * Prediction-before-run types (#413). Lightweight, AI-free: learners record a
 * prediction before executing, then compare it to the actual result. Shared by
 * client UI and pure comparison logic — no server-only/browser-only imports.
 */

export type PredictionPromptKind =
  | "stdout"
  | "failing_test"
  | "first_variable_change"
  | "loop_invariant"
  | "complexity";

export type CodePredictionPrompt = {
  id: string;
  kind: PredictionPromptKind;
  label: string;
  placeholder?: string;
  required?: boolean;
};

export type CodePredictionSubmission = {
  promptId: string;
  value: string;
  createdAt: string;
};

export type CodePredictionComparison = {
  promptId: string;
  status: "matched" | "mismatched" | "not_comparable";
  explanation: string;
};

export type PredictionMode = "off" | "optional" | "required_before_run";
