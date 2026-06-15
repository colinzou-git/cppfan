import { describe, expect, it } from "vitest";
import { rowsToEvidence } from "@/features/interview/interview-evidence-store";
import { mocksCompletedFromEvidence } from "@/features/interview/readiness-store";
import type { InterviewEvidence } from "@/features/interview/readiness";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("rowsToEvidence (#180)", () => {
  it("maps a valid row to InterviewEvidence", () => {
    const evidence = rowsToEvidence([
      {
        pattern: "arrays_hashing_prefix",
        problem_id: "iv.prefix.balance-returns-to-zero",
        unseen: true,
        mode: "interview",
        correct: true,
        hints_used: 0,
        context: "mock",
        completed_at: "2026-06-15T00:00:00.000Z"
      }
    ]);
    expect(evidence).toEqual([
      {
        pattern: "arrays_hashing_prefix",
        problemId: "iv.prefix.balance-returns-to-zero",
        unseen: true,
        mode: "interview",
        correct: true,
        hintsUsed: 0,
        context: "mock",
        completedAtMs: Date.parse("2026-06-15T00:00:00.000Z")
      }
    ]);
  });

  it("drops rows with an unknown pattern and clamps/defaults invalid fields", () => {
    const evidence = rowsToEvidence([
      { pattern: "not_a_group", problem_id: "x", unseen: true, mode: "interview", correct: true, hints_used: 1, context: "mock", completed_at: "2026-06-15T00:00:00.000Z" },
      { pattern: "binary_search", problem_id: "iv.bs.x", unseen: false, mode: "bogus", correct: false, hints_used: -3, context: "bogus", completed_at: "2026-06-15T00:00:00.000Z" }
    ]);
    expect(evidence).toHaveLength(1);
    expect(evidence[0]).toMatchObject({ pattern: "binary_search", mode: "practice", context: "independent", hintsUsed: 0 });
  });
});

describe("mocksCompletedFromEvidence (#180)", () => {
  const base: InterviewEvidence = {
    pattern: "binary_search",
    problemId: "iv.bs.x",
    unseen: true,
    mode: "interview",
    correct: true,
    hintsUsed: 0,
    context: "mock",
    completedAtMs: 0
  };

  it("counts distinct days carrying mock evidence (never over-counts one session)", () => {
    const day0 = 5 * DAY_MS;
    const evidence: InterviewEvidence[] = [
      { ...base, problemId: "a", completedAtMs: day0 },
      { ...base, problemId: "b", completedAtMs: day0 + 60_000 }, // same day mock
      { ...base, problemId: "c", completedAtMs: day0 + DAY_MS }, // next day mock
      { ...base, context: "independent", completedAtMs: day0 + 2 * DAY_MS } // not a mock
    ];
    expect(mocksCompletedFromEvidence(evidence)).toBe(2);
  });

  it("is zero with no mock evidence", () => {
    expect(mocksCompletedFromEvidence([{ ...base, context: "independent" }])).toBe(0);
  });
});
