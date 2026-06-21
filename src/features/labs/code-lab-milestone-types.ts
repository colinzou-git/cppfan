import type { CodeRunResult, CodeTestResult } from "@/features/code-lab/code-lab-types";

/**
 * Types for in-app Code Lab capstone milestones (#418).
 */

export type MilestoneCompletionEvidence = {
  milestoneId: string;
  executionMode: "in_app_code_lab" | "codespaces" | "reflection_only" | "manual";
  testsPassed: number | null;
  testsTotal: number | null;
  ranInApp: boolean;
  reflectionSaved: boolean;
};

export type MilestoneCompletionInput = {
  codeResult?: CodeRunResult | null;
  testResult?: CodeTestResult | null;
  reflection?: string;
};
