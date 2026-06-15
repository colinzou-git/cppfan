import { describe, expect, it } from "vitest";
import { summarizeProgress } from "@/features/interview/interview-progress";
import { weakestDimensions } from "@/features/interview/interview-progress-store";
import type { InterviewEvidence, ReadinessDimension, ReadinessReport } from "@/features/interview/readiness";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const NOW = 1_800_000_000_000;

function evidence(overrides: Partial<InterviewEvidence>): InterviewEvidence {
  return {
    pattern: "binary_search",
    problemId: "iv.bs.x",
    unseen: true,
    mode: "interview",
    correct: true,
    hintsUsed: 0,
    context: "independent",
    completedAtMs: NOW,
    ...overrides
  };
}

describe("summarizeProgress (#180)", () => {
  it("buckets evidence into trailing weeks, most recent first", () => {
    const summary = summarizeProgress(
      [
        evidence({ problemId: "a", completedAtMs: NOW - 1 * DAY_MS }), // this week
        evidence({ problemId: "b", completedAtMs: NOW - 8 * DAY_MS }), // last week
        evidence({ problemId: "c", completedAtMs: NOW - 9 * DAY_MS }) // last week
      ],
      NOW,
      4
    );
    expect(summary.weeks).toHaveLength(4);
    expect(summary.weeks[0]).toMatchObject({ weekIndex: 0, label: "This week", attempts: 1 });
    expect(summary.weeks[1]).toMatchObject({ weekIndex: 1, label: "Last week", attempts: 2 });
    expect(summary.totalAttempts).toBe(3);
  });

  it("counts distinct independent unseen successes and ignores hinted/seen ones", () => {
    const summary = summarizeProgress(
      [
        evidence({ problemId: "a", completedAtMs: NOW - DAY_MS }), // counts
        evidence({ problemId: "a", completedAtMs: NOW - 2 * DAY_MS }), // same problem, not distinct
        evidence({ problemId: "b", hintsUsed: 2, completedAtMs: NOW - DAY_MS }), // hinted, excluded
        evidence({ problemId: "c", unseen: false, completedAtMs: NOW - DAY_MS }) // seen, excluded
      ],
      NOW,
      2
    );
    expect(summary.weeks[0].independentUnseenSuccesses).toBe(1);
    expect(summary.totalIndependentUnseenSuccesses).toBe(1);
  });

  it("counts mock days distinctly and computes a per-week correct rate", () => {
    const summary = summarizeProgress(
      [
        evidence({ problemId: "a", context: "mock", correct: true, completedAtMs: NOW - DAY_MS }),
        evidence({ problemId: "b", context: "mock", correct: false, completedAtMs: NOW - DAY_MS - 60_000 }), // same day
        evidence({ problemId: "c", context: "mock", correct: true, completedAtMs: NOW - 2 * DAY_MS }) // another day
      ],
      NOW,
      2
    );
    expect(summary.weeks[0].mockDays).toBe(2);
    expect(summary.weeks[0].correctRate).toBeCloseTo(2 / 3);
  });

  it("drops evidence older than the horizon and leaves empty weeks with a null rate", () => {
    const summary = summarizeProgress([evidence({ completedAtMs: NOW - 5 * WEEK_MS })], NOW, 4);
    expect(summary.totalAttempts).toBe(0);
    expect(summary.weeks.every((w) => w.correctRate === null)).toBe(true);
  });
});

function report(overrides: Partial<ReadinessReport["dimensions"]>): ReadinessReport {
  return {
    verdict: "not_ready",
    reasons: [],
    dimensions: {
      core_pattern_coverage: "met",
      unseen_problem_success: "met",
      no_critical_weak_cluster: "met",
      mock_sessions: "met",
      quality_scores: "met",
      not_single_session: "met",
      ...overrides
    }
  };
}

describe("weakestDimensions (#180)", () => {
  it("lists unmet dimensions in weakest-leverage order", () => {
    const weak = weakestDimensions(report({ mock_sessions: "unmet", no_critical_weak_cluster: "unmet" }));
    expect(weak).toEqual<ReadinessDimension[]>(["no_critical_weak_cluster", "mock_sessions"]);
  });

  it("is empty when all dimensions are met", () => {
    expect(weakestDimensions(report({}))).toEqual([]);
  });
});
