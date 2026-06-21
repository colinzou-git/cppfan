import { describe, expect, it } from "vitest";
import {
  mergeRunAndAiFeedback,
  toWeakCodeFeedbackEvidence
} from "@/features/code-lab/code-feedback-evidence";
import type { StructuredCodeFeedback } from "@/features/code-lab/code-feedback-types";
import type { CodeRunResult, CodeTestResult } from "@/features/code-lab/code-lab-types";

const feedback: StructuredCodeFeedback = {
  schemaVersion: 1,
  status: "ok",
  summary: "Off-by-one in the loop.",
  errorTags: ["cpp.loop.off_by_one"],
  relatedSkills: ["cpp.basics.control_flow"],
  nextAction: "try_boundary_case_checklist",
  confidence: "medium",
  learnerMessage: "Check your loop bound.",
  evidenceStrength: "weak_ai_inference"
};

const passingTests: CodeTestResult = {
  status: "ok",
  passed: 2,
  total: 2,
  visible: [],
  hiddenPassed: 1,
  hiddenTotal: 1,
  compileOutput: "",
  provider: "mock",
  simulated: true
};

const compileRun: CodeRunResult = {
  status: "compile_error",
  compileOutput: "error",
  stdout: "",
  stderr: "",
  exitCode: 1,
  timedOut: false,
  durationMs: 1,
  memoryKb: null,
  provider: "mock",
  simulated: true
};

describe("toWeakCodeFeedbackEvidence", () => {
  it("projects only weak-evidence fields", () => {
    const evidence = toWeakCodeFeedbackEvidence(feedback);
    expect(evidence.errorTags).toEqual(["cpp.loop.off_by_one"]);
    expect(evidence.evidenceStrength).toBe("weak_ai_inference");
    expect(evidence).not.toHaveProperty("summary");
  });
});

describe("mergeRunAndAiFeedback", () => {
  it("derives the authoritative outcome from tests, not AI", () => {
    const merged = mergeRunAndAiFeedback({ testResult: passingTests, aiFeedback: feedback });
    expect(merged.authoritativeOutcome).toBe("passed");
    expect(merged.testsPassed).toBe(2);
    expect(merged.aiEvidence?.errorTags).toEqual(["cpp.loop.off_by_one"]);
  });

  it("reports compile_error from the run regardless of AI feedback", () => {
    const merged = mergeRunAndAiFeedback({ runResult: compileRun, aiFeedback: feedback });
    expect(merged.authoritativeOutcome).toBe("compile_error");
  });

  it("does not attach evidence for unavailable AI feedback", () => {
    const merged = mergeRunAndAiFeedback({
      testResult: passingTests,
      aiFeedback: { ...feedback, status: "unavailable" }
    });
    expect(merged.aiEvidence).toBeUndefined();
  });

  it("is unknown when there is no run or test result", () => {
    expect(mergeRunAndAiFeedback({}).authoritativeOutcome).toBe("unknown");
  });
});
