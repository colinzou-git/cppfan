import { describe, expect, it } from "vitest";
import { selectTransferProblem } from "@/features/interview/interview-transfer";
import { getInterviewProblemsByGroup } from "@/features/interview/problem-catalog";
import type { InterviewEvidence } from "@/features/interview/readiness";

const NOW = 1_800_000_000_000;
const DAY_MS = 24 * 60 * 60 * 1000;

// A pattern that has more than one catalog problem, so "not identical" is testable.
const PATTERN = "arrays_hashing_prefix" as const;
const problems = getInterviewProblemsByGroup(PATTERN);

function ev(problemId: string, completedAtMs: number): InterviewEvidence {
  return {
    pattern: PATTERN,
    problemId,
    unseen: false,
    mode: "interview",
    correct: true,
    hintsUsed: 0,
    context: "independent",
    completedAtMs
  };
}

describe("selectTransferProblem (#180)", () => {
  it("returns null for a pattern with no catalog problems is impossible here; picks an unseen problem first", () => {
    const pick = selectTransferProblem(PATTERN, []);
    expect(pick).not.toBeNull();
    expect(pick?.unseen).toBe(true);
    expect(pick?.problemId).toBe(problems[0]?.id);
  });

  it("prefers an unseen problem over one already attempted", () => {
    if (problems.length < 2) {
      return; // guarded: only meaningful when the pattern has >= 2 problems
    }
    const pick = selectTransferProblem(PATTERN, [ev(problems[0].id, NOW - DAY_MS)]);
    expect(pick?.unseen).toBe(true);
    expect(pick?.problemId).not.toBe(problems[0].id);
  });

  it("avoids repeating the just-attempted problem when all are seen (spacing after success)", () => {
    if (problems.length < 2) {
      return;
    }
    // Every problem attempted; the most recent was problems[0].
    const evidence = problems.map((p, i) => ev(p.id, NOW - (problems.length - i) * DAY_MS));
    const mostRecent = evidence[evidence.length - 1].problemId; // problems[last]
    const pick = selectTransferProblem(PATTERN, evidence);
    expect(pick?.unseen).toBe(false);
    expect(pick?.problemId).not.toBe(mostRecent);
  });

  it("is deterministic for identical inputs", () => {
    const evidence = [ev(problems[0]?.id ?? "x", NOW - DAY_MS)];
    expect(selectTransferProblem(PATTERN, evidence)).toEqual(selectTransferProblem(PATTERN, evidence));
  });
});
