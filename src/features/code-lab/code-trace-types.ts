import type { CodeRunResult, CodeTestResult } from "./code-lab-types";
import type { StructuredCodeFeedback } from "./code-feedback-types";

/**
 * Types for the Phase 2 AI execution trace (#408). The trace is an AI-generated
 * educational explanation — NOT real runtime inspection or a debugger. Shared by
 * client UI and server route/service, so this module stays free of server-only or
 * browser-only imports.
 */

export type CodeTraceInputKind = "stdin" | "visible-test";

export type CodeTraceRequest = {
  itemId: string;
  language: "cpp";
  source: string;
  /** stdin or the visible test's input the learner chose to trace. */
  selectedInput?: string;
  selectedTestName?: string;
  /** Only ever a VISIBLE test's expected output — hidden tests never appear. */
  selectedExpectedOutput?: string;
  selectedActualOutput?: string;
  lastRunResult?: CodeRunResult | null;
  lastTestResult?: CodeTestResult | null;
  userQuestion?: string;
};

export type CodeTraceStep = {
  step: number;
  lineHint?: string;
  variables?: Record<string, string>;
  explanation: string;
};

export type CodeTraceResult = {
  status: "ok" | "unavailable" | "invalid";
  inputSummary?: string;
  codeSummary?: string;
  steps: CodeTraceStep[];
  likelyIssue?: string;
  nextHint?: string;
  relatedSkills?: string[];
  confidence: "low" | "medium" | "high";
  /** Always present on a successful trace; the UI shows it verbatim. */
  disclaimer: string;
  /** Friendly message for unavailable/invalid states. */
  message?: string;
  /** Structured weak-evidence feedback derived from the trace (#410). */
  feedback?: StructuredCodeFeedback;
};

export const CODE_TRACE_DISCLAIMER =
  "This is an AI-generated trace based on your code and the selected input. It may simplify details. Compiler output and test results are the source of truth.";
