import type { CodeRunResult, CodeTestResult } from "./code-lab-types";
import {
  CODE_FEEDBACK_SCHEMA_VERSION,
  type CodeAttemptFeedbackSummary,
  type CodeFeedbackEvidence,
  type StructuredCodeFeedback
} from "./code-feedback-types";

/**
 * Projects structured AI feedback into weak evidence and merges it with the
 * authoritative deterministic run/test outcome (#410). The authoritative outcome
 * is derived ONLY from compiler/test results — AI output can never change it.
 */

export function toWeakCodeFeedbackEvidence(input: StructuredCodeFeedback): CodeFeedbackEvidence {
  return {
    schemaVersion: CODE_FEEDBACK_SCHEMA_VERSION,
    errorTags: input.errorTags,
    relatedSkills: input.relatedSkills,
    confidence: input.confidence,
    evidenceStrength: "weak_ai_inference"
  };
}

function authoritativeOutcome(
  runResult?: CodeRunResult,
  testResult?: CodeTestResult
): CodeAttemptFeedbackSummary["authoritativeOutcome"] {
  if (testResult) {
    if (testResult.status === "compile_error") return "compile_error";
    if (testResult.total > 0 && testResult.passed === testResult.total) return "passed";
    return "failed";
  }
  if (runResult) {
    switch (runResult.status) {
      case "compile_error":
        return "compile_error";
      case "success":
        return "ran";
      case "runner_unconfigured":
        return "unknown";
      default:
        return "failed";
    }
  }
  return "unknown";
}

export function mergeRunAndAiFeedback(input: {
  runResult?: CodeRunResult;
  testResult?: CodeTestResult;
  aiFeedback?: StructuredCodeFeedback;
}): CodeAttemptFeedbackSummary {
  const usableFeedback = input.aiFeedback && input.aiFeedback.status === "ok" ? input.aiFeedback : undefined;
  return {
    authoritativeOutcome: authoritativeOutcome(input.runResult, input.testResult),
    testsPassed: input.testResult?.passed ?? null,
    testsTotal: input.testResult?.total ?? null,
    aiFeedback: input.aiFeedback,
    aiEvidence: usableFeedback ? toWeakCodeFeedbackEvidence(usableFeedback) : undefined
  };
}
