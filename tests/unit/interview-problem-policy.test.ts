import { describe, expect, it } from "vitest";
import { getInterviewProblem } from "@/features/interview/problem-catalog";
import {
  getInterviewCoreProblems,
  hasPriorExposure,
  isInterviewCore,
  selectUnseenTransferProblem,
  type ProblemExposure
} from "@/features/interview/problem-policy";

describe("interview problem policy", () => {
  it("uses an explicit reviewed core set", () => {
    const core = getInterviewCoreProblems();
    expect(core.length).toBeGreaterThanOrEqual(12);
    expect(core.every((problem) => isInterviewCore(problem.id))).toBe(true);
    expect(isInterviewCore("missing.problem")).toBe(false);
  });

  it("tracks exposure by exact problem and version", () => {
    const problem = getInterviewProblem("iv.heap.top-k-hot-keys");
    expect(problem).not.toBeNull();
    const exposure: ProblemExposure = {
      problemId: problem!.id,
      problemVersion: problem!.version,
      kind: "practice",
      occurredAt: "2026-06-18T12:00:00Z"
    };
    expect(hasPriorExposure(problem!, [exposure])).toBe(true);
    expect(hasPriorExposure({ ...problem!, version: problem!.version + 1 }, [exposure])).toBe(false);
  });

  it("selects a different unseen prompt with a shared pattern", () => {
    const selected = selectUnseenTransferProblem("iv.heap.top-k-hot-keys", []);
    expect(selected).not.toBeNull();
    expect(selected!.id).not.toBe("iv.heap.top-k-hot-keys");
    expect(selected!.patternTags.some((tag) => getInterviewProblem("iv.heap.top-k-hot-keys")!.patternTags.includes(tag))).toBe(true);
  });

  it("does not return an exposed transfer prompt", () => {
    const first = selectUnseenTransferProblem("iv.heap.top-k-hot-keys", []);
    expect(first).not.toBeNull();
    const exposure: ProblemExposure = {
      problemId: first!.id,
      problemVersion: first!.version,
      kind: "solution_revealed",
      occurredAt: "2026-06-18T12:00:00Z"
    };
    const second = selectUnseenTransferProblem("iv.heap.top-k-hot-keys", [exposure]);
    expect(second?.id).not.toBe(first!.id);
  });
});
