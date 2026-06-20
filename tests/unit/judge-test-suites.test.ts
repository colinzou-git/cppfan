import { describe, expect, it } from "vitest";
import { buildJudgeRequest } from "@/features/interview/judge-client";
import { getInterviewProblems } from "@/features/interview/problem-catalog";
import { judgeSupportedProblemIds, getJudgeProblemSuite } from "@/features/interview/judge-test-suites";
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

describe("judge problem test suites (#178)", () => {
  it("exposes selected problem ids with visible and hidden tests", () => {
    expect(judgeSupportedProblemIds()).toEqual([
      "iv.bsearch.balance-link-load",
      "iv.bsearch.insert-position",
      "iv.bsearch.min-rate-before-deadline",
      "iv.bsearch.peak-index",
      "iv.bsearch.rotated-min",
      "iv.prefix.balance-returns-to-zero",
      "iv.stack.balanced-delimiters"
    ]);

    const suite = getJudgeProblemSuite("iv.prefix.balance-returns-to-zero");
    expect(suite?.visibleTests.length).toBe(2);
    expect(suite?.hiddenTests.length).toBe(2);
    expect(suite?.fixtures.length).toBe(4);
  });

  it("makes every binary-search catalog problem executable", () => {
    const binarySearchProblems = getInterviewProblems().filter((problem) => problem.group === "binary_search");
    expect(binarySearchProblems).toHaveLength(5);

    for (const problem of binarySearchProblems) {
      const suite = getJudgeProblemSuite(problem.id);
      expect(suite, problem.id).not.toBeNull();
      expect(suite?.version).toBe(problem.version);
      expect(suite?.visibleTests.length, problem.id).toBeGreaterThanOrEqual(2);
      expect(suite?.hiddenTests.length, problem.id).toBeGreaterThanOrEqual(2);
      expect(suite?.fixtures.length).toBe((suite?.visibleTests.length ?? 0) + (suite?.hiddenTests.length ?? 0));
    }
  });

  it("covers boundary, adversarial, or scale behavior in each binary-search suite", () => {
    const binarySearchIds = getInterviewProblems()
      .filter((problem) => problem.group === "binary_search")
      .map((problem) => problem.id);

    for (const problemId of binarySearchIds) {
      const suite = getJudgeProblemSuite(problemId)!;
      const hiddenCategories = new Set(suite.hiddenTests.map((test) => test.category));
      expect(
        ["edge_case", "boundary", "adversarial", "overflow_guard"].some((category) => hiddenCategories.has(category)),
        problemId
      ).toBe(true);
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

  it("returns null for problems without a judge suite yet", () => {
    expect(getJudgeProblemSuite("iv.graph.service-init-order")).toBeNull();
  });
});
