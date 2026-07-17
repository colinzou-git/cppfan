import { describe, expect, it } from "vitest";
import {
  combineEvaluationOutcome,
  objectiveOutcomeFromTestResult,
  buildUserContentEvaluationResult
} from "@/features/user-content/user-content-evaluation";

describe("combineEvaluationOutcome (#609)", () => {
  it("automated/judge: objective determines the outcome", () => {
    expect(combineEvaluationOutcome({ mode: "automated_tests", objective: { passed: 3, total: 3 } })).toMatchObject({
      status: "passed",
      completionCredited: true,
      objectiveAuthoritative: true
    });
    expect(combineEvaluationOutcome({ mode: "judge", objective: { passed: 2, total: 3 } })).toMatchObject({
      status: "failed",
      completionCredited: false
    });
    expect(combineEvaluationOutcome({ mode: "automated_tests" }).status).toBe("invalid");
  });

  it("combined: a FAILING objective never becomes a pass from optimistic AI", () => {
    const result = combineEvaluationOutcome({
      mode: "automated_plus_ai",
      objective: { passed: 1, total: 3 },
      ai: { available: true, verdict: "pass" } // AI is optimistic…
    });
    // …but the objective failure is authoritative.
    expect(result.status).toBe("failed");
    expect(result.completionCredited).toBe(false);
    expect(result.objectiveAuthoritative).toBe(true);
  });

  it("combined: objective pass credits completion; AI is advisory", () => {
    expect(
      combineEvaluationOutcome({ mode: "judge_plus_ai", objective: { passed: 4, total: 4 }, ai: { available: false, verdict: "unknown" } })
    ).toMatchObject({ status: "passed", completionCredited: true, objectiveAuthoritative: true });
  });

  it("ai_evaluation: provider failure is retryable-unavailable, never a pass", () => {
    expect(combineEvaluationOutcome({ mode: "ai_evaluation", ai: { available: false, verdict: "unknown" } })).toMatchObject({
      status: "unavailable",
      completionCredited: false
    });
    expect(combineEvaluationOutcome({ mode: "ai_evaluation", ai: { available: true, verdict: "pass" } })).toMatchObject({
      status: "passed",
      completionCredited: true,
      objectiveAuthoritative: false
    });
    expect(combineEvaluationOutcome({ mode: "ai_evaluation", ai: { available: true, verdict: "revise" } }).status).toBe("partial");
  });

  it("self_evaluation: complete credits completion as weak (non-authoritative) evidence", () => {
    const complete = combineEvaluationOutcome({ mode: "self_evaluation", self: { rating: "complete" } });
    expect(complete).toMatchObject({ status: "passed", completionCredited: true, objectiveAuthoritative: false });
    expect(combineEvaluationOutcome({ mode: "self_evaluation", self: { rating: "partial" } }).status).toBe("partial");
    expect(combineEvaluationOutcome({ mode: "self_evaluation", self: { rating: "not_yet" } })).toMatchObject({
      status: "failed",
      completionCredited: false
    });
    expect(combineEvaluationOutcome({ mode: "self_evaluation" }).status).toBe("invalid");
  });

  it("automated with no tests cannot assert a pass on its own", () => {
    expect(combineEvaluationOutcome({ mode: "automated_tests", objective: { passed: 0, total: 0 } }).status).toBe("partial");
  });

  it("objectiveOutcomeFromTestResult extracts passed/total (or undefined)", () => {
    expect(objectiveOutcomeFromTestResult({ passed: 3, total: 4 })).toEqual({ passed: 3, total: 4 });
    expect(objectiveOutcomeFromTestResult(null)).toBeUndefined();
  });

  it("buildUserContentEvaluationResult composes the result contract with a next action", () => {
    const passed = buildUserContentEvaluationResult({ mode: "automated_plus_ai", objective: { passed: 2, total: 2 }, ai: { available: true, verdict: "pass" } });
    expect(passed).toMatchObject({ status: "passed", mode: "automated_plus_ai", completionCredited: true, objective: { passed: 2, total: 2 } });
    expect(passed.nextAction).toMatch(/completion recorded/i);

    // Objective failure keeps completion uncredited even with optimistic AI.
    const failed = buildUserContentEvaluationResult({ mode: "automated_plus_ai", objective: { passed: 1, total: 2 }, ai: { available: true, verdict: "pass" } });
    expect(failed).toMatchObject({ status: "failed", completionCredited: false });
    expect(failed.nextAction).toMatch(/resubmit|fix/i);
  });
});
