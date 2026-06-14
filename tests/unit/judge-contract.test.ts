import { describe, expect, it } from "vitest";
import {
  DEFAULT_JUDGE_LIMITS,
  deriveExecutionStatus,
  isSubmissionWithinLimits,
  learnerFacingResult,
  sanitizeJudgeLog,
  summarizeOutcomes,
  type JudgeResult,
  type TestOutcome
} from "@/features/interview/judge-contract";

const outcomes: TestOutcome[] = [
  { name: "sample_1", hidden: false, passed: true },
  { name: "sample_2", hidden: false, passed: false },
  { name: "hidden_edge", hidden: true, passed: true },
  { name: "hidden_scale", hidden: true, passed: false }
];

describe("judge submission limits (#178)", () => {
  it("accepts a normal submission and rejects oversize source or too many tests", () => {
    expect(isSubmissionWithinLimits({ sourceBytes: 1000 }, 10)).toBe(true);
    expect(isSubmissionWithinLimits({ sourceBytes: 0 }, 10)).toBe(false);
    expect(isSubmissionWithinLimits({ sourceBytes: DEFAULT_JUDGE_LIMITS.maxSourceBytes + 1 }, 10)).toBe(false);
    expect(isSubmissionWithinLimits({ sourceBytes: 1000 }, DEFAULT_JUDGE_LIMITS.maxTests + 1)).toBe(false);
  });
});

describe("outcome summary + status (#178)", () => {
  it("summarizes visible and hidden pass counts separately", () => {
    expect(summarizeOutcomes(outcomes)).toEqual({
      visible: { passed: 1, total: 2 },
      hidden: { passed: 1, total: 2 }
    });
  });

  it("derives accepted only when compiled and all tests pass", () => {
    expect(deriveExecutionStatus(false, outcomes)).toBe("compile_error");
    expect(deriveExecutionStatus(true, outcomes)).toBe("wrong_answer");
    expect(deriveExecutionStatus(true, [{ name: "a", hidden: true, passed: true }])).toBe("accepted");
    expect(deriveExecutionStatus(true, [])).toBe("infrastructure_error");
  });
});

describe("hidden-test non-disclosure (#178)", () => {
  it("learner view exposes failed visible test names but only a hidden FAIL COUNT, never names", () => {
    const result: JudgeResult = {
      submissionId: "s1",
      status: "wrong_answer",
      compiled: true,
      visible: { passed: 1, total: 2 },
      hidden: { passed: 1, total: 2 },
      runtimeMs: 12,
      memoryMb: 8
    };
    const view = learnerFacingResult(result, outcomes);
    expect(view.failedVisibleTests).toEqual(["sample_2"]);
    expect(view.failedHiddenCount).toBe(1);
    // The hidden test name is never surfaced.
    expect(JSON.stringify(view)).not.toContain("hidden_scale");
  });

  it("the result type carries no hidden inputs/expected outputs (counts only)", () => {
    const summary = summarizeOutcomes(outcomes);
    expect(Object.keys(summary.hidden)).toEqual(["passed", "total"]);
  });
});

describe("log sanitization (#178)", () => {
  it("truncates logs beyond the output cap", () => {
    const big = "x".repeat(DEFAULT_JUDGE_LIMITS.outputKb * 1024 + 500);
    const out = sanitizeJudgeLog(big);
    expect(out.length).toBeLessThan(big.length);
    expect(out).toContain("truncated");
  });

  it("leaves small logs unchanged", () => {
    expect(sanitizeJudgeLog("ok")).toBe("ok");
  });
});
