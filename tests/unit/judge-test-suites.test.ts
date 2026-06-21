import { describe, expect, it } from "vitest";
import { buildJudgeRequest } from "@/features/interview/judge-client";
import { interviewProblems } from "@/features/interview/problem-catalog";
import {
  getJudgeIoDescription,
  getJudgeProblemSuite,
  judgeSupportedProblemIds
} from "@/features/interview/judge-test-suites";
import type { JudgeSubmission } from "@/features/interview/judge-contract";

const submission: JudgeSubmission = {
  submissionId: "00000000-0000-4000-8000-000000000578",
  problemId: "iv.prefix.balance-returns-to-zero",
  problemVersion: 1,
  compiler: "gcc",
  standard: "c++20",
  sourceHash: "c".repeat(64),
  sourceBytes: 1024
};

describe("judge problem test suites (#176/#178)", () => {
  it("covers every interview-catalog problem with visible and hidden executable tests", () => {
    const catalogIds = interviewProblems.map((problem) => problem.id).sort();
    expect(judgeSupportedProblemIds()).toEqual(catalogIds);
    expect(catalogIds).toHaveLength(60);

    for (const problem of interviewProblems) {
      const suite = getJudgeProblemSuite(problem.id);
      expect(suite, problem.id).not.toBeNull();
      expect(suite!.version, problem.id).toBe(problem.version);
      expect(suite!.visibleTests.length, problem.id).toBeGreaterThan(0);
      expect(suite!.hiddenTests.length, problem.id).toBeGreaterThan(0);
      expect(suite!.fixtures.length, problem.id).toBe(
        suite!.visibleTests.length + suite!.hiddenTests.length
      );
      expect(getJudgeIoDescription(problem.id), problem.id).toMatch(/stdin:/i);
    }
  });

  it("keeps raw hidden stdin and expected output out of worker request metadata", () => {
    const suite = getJudgeProblemSuite("iv.prefix.balance-returns-to-zero");
    expect(suite).not.toBeNull();
    const request = buildJudgeRequest({
      submission,
      taskKind: "compile_and_run",
      visibleTests: suite!.visibleTests,
      hiddenTests: suite!.hiddenTests
    });

    expect("error" in request).toBe(false);
    const metadata = JSON.stringify(request);
    expect(metadata).toContain("fixtureHash");
    expect(metadata).toContain("hidden");
    expect(metadata).not.toContain("10000000000 -10000000000");
    expect(metadata).not.toContain("expectedStdout");
    expect(metadata).not.toContain("stdin");
  });

  it("keeps raw fixtures only in the worker fixture payload", () => {
    const suite = getJudgeProblemSuite("iv.bsearch.insert-position");
    expect(suite?.hiddenTests.every((test) => test.fixtureHash.length === 64)).toBe(true);
    expect(JSON.stringify(suite?.hiddenTests)).not.toContain("2 2 2");
    expect(JSON.stringify(suite?.fixtures)).toContain("2 2 2");
  });

  it("includes boundary/adversarial/scale coverage for every final mock problem", () => {
    const mockProblemIds = [
      "iv.graph.service-init-order",
      "iv.sliding.longest-window-under-budget",
      "iv.heap.top-k-hot-keys",
      "iv.intervals.max-concurrent-maintenance",
      "iv.bsearch.min-rate-before-deadline",
      "iv.heap.k-closest-points",
      "iv.tree.diameter",
      "iv.graph.cheapest-route",
      "iv.dp.fewest-coins",
      "iv.cache.lru-design",
      "iv.cpp.iterator-invalidation",
      "iv.cpp.dangling-reference",
      "iv.cpp.missing-virtual-destructor"
    ];

    for (const problemId of mockProblemIds) {
      const suite = getJudgeProblemSuite(problemId);
      const categories = new Set(
        [...(suite?.visibleTests ?? []), ...(suite?.hiddenTests ?? [])].map((test) => test.category)
      );
      expect(categories.has("normal"), problemId).toBe(true);
      expect(
        categories.has("boundary") || categories.has("adversarial"),
        problemId
      ).toBe(true);
      expect(suite!.fixtures.length, problemId).toBeGreaterThanOrEqual(4);
    }
  });
});
