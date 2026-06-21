import type { CodeErrorTag } from "./code-error-tags";

/**
 * Structured, machine-validated Code Lab AI feedback (#410). AI Review and AI
 * Trace return this shape so later remediation/mastery work can consume it.
 * Deterministic compile/test results remain authoritative; everything here is
 * advisory weak evidence (`evidenceStrength: "weak_ai_inference"`).
 */

export type CodeFeedbackConfidence = "low" | "medium" | "high";

export type CodeFeedbackNextAction =
  | "retry_current_code"
  | "trace_with_ai"
  | "try_boundary_case_checklist"
  | "review_related_skill"
  | "try_completion_scaffold"
  | "try_parsons_scaffold"
  | "continue_next_item";

export const CODE_FEEDBACK_NEXT_ACTIONS: readonly CodeFeedbackNextAction[] = [
  "retry_current_code",
  "trace_with_ai",
  "try_boundary_case_checklist",
  "review_related_skill",
  "try_completion_scaffold",
  "try_parsons_scaffold",
  "continue_next_item"
];

export const CODE_FEEDBACK_SCHEMA_VERSION = 1 as const;

export type StructuredCodeFeedback = {
  schemaVersion: typeof CODE_FEEDBACK_SCHEMA_VERSION;
  status: "ok" | "unavailable" | "invalid";
  summary: string;
  likelyIssue?: string;
  errorTags: CodeErrorTag[];
  relatedSkills: string[];
  nextAction?: CodeFeedbackNextAction;
  confidence: CodeFeedbackConfidence;
  /** Friendly, learner-facing message; always present and safe to display. */
  learnerMessage: string;
  evidenceStrength: "weak_ai_inference";
};

/** Weak-evidence projection consumed by later remediation/mastery work. */
export type CodeFeedbackEvidence = {
  schemaVersion: typeof CODE_FEEDBACK_SCHEMA_VERSION;
  errorTags: CodeErrorTag[];
  relatedSkills: string[];
  confidence: CodeFeedbackConfidence;
  evidenceStrength: "weak_ai_inference";
};

/**
 * Combined view of one attempt: deterministic run/test outcome (authoritative)
 * plus advisory AI feedback. `authoritativeOutcome` never depends on AI output.
 */
export type CodeAttemptFeedbackSummary = {
  authoritativeOutcome: "passed" | "failed" | "compile_error" | "ran" | "unknown";
  testsPassed: number | null;
  testsTotal: number | null;
  aiFeedback?: StructuredCodeFeedback;
  aiEvidence?: CodeFeedbackEvidence;
};

export const WEAK_EVIDENCE_NOTE =
  "AI feedback is advisory only and is not grading evidence by itself. Compiler output and test results are authoritative.";
