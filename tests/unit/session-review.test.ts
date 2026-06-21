import { describe, expect, it } from "vitest";
import { summarizeSessionReview, type SessionReviewInput } from "@/features/interview/session-review";

const base: SessionReviewInput = {
  phaseElapsedSeconds: { clarification: 120, baseline: 180, implementation: 600, testing: 120 },
  elapsedSeconds: 1020,
  durationMinutes: 45,
  testNotes: "Checked empty, single, and overflow inputs.",
  codeDraft: "int main(){}",
  codeRevisionCount: 4,
  judge: { compiled: true, visiblePassed: 1, visibleTotal: 1, hiddenPassed: 3, hiddenTotal: 3 }
};

describe("summarizeSessionReview (#179)", () => {
  it("builds a per-phase timeline with shares that sum to 1", () => {
    const summary = summarizeSessionReview(base);
    expect(summary.totalPhaseSeconds).toBe(1020);
    const totalShare = summary.timeline.reduce((sum, e) => sum + e.share, 0);
    expect(totalShare).toBeCloseTo(1, 5);
    const implement = summary.timeline.find((e) => e.phase === "implementation");
    expect(implement?.seconds).toBe(600);
    expect(implement?.share).toBeCloseTo(600 / 1020, 5);
  });

  it("identifies the busiest phase and within-budget status", () => {
    const summary = summarizeSessionReview(base);
    expect(summary.busiestPhase).toBe("implementation");
    expect(summary.budgetSeconds).toBe(45 * 60);
    expect(summary.withinBudget).toBe(true);
  });

  it("flags an over-budget session", () => {
    const summary = summarizeSessionReview({ ...base, elapsedSeconds: 45 * 60 + 1 });
    expect(summary.withinBudget).toBe(false);
  });

  it("summarizes a fully-passing judge run as allPassed", () => {
    const summary = summarizeSessionReview(base);
    expect(summary.testSummary.attempted).toBe(true);
    expect(summary.testSummary.allPassed).toBe(true);
    expect(summary.testSummary.hiddenPassed).toBe(3);
  });

  it("does not mark allPassed when hidden tests fail", () => {
    const summary = summarizeSessionReview({
      ...base,
      judge: { compiled: true, visiblePassed: 1, visibleTotal: 1, hiddenPassed: 2, hiddenTotal: 3 }
    });
    expect(summary.testSummary.allPassed).toBe(false);
  });

  it("does not invent test results when no judge run was attempted", () => {
    const summary = summarizeSessionReview({ ...base, judge: null });
    expect(summary.testSummary.attempted).toBe(false);
    expect(summary.testSummary.allPassed).toBeNull();
    expect(summary.testSummary.hiddenTotal).toBeNull();
    // Learner's own test notes are still preserved for the review.
    expect(summary.testSummary.notes).toContain("overflow");
  });

  it("reports code revision count and byte size, with an empty timeline when nothing was logged", () => {
    const summary = summarizeSessionReview({
      ...base,
      phaseElapsedSeconds: {},
      codeDraft: "",
      codeRevisionCount: 0
    });
    expect(summary.totalPhaseSeconds).toBe(0);
    expect(summary.busiestPhase).toBeNull();
    expect(summary.timeline.every((e) => e.seconds === 0 && e.share === 0)).toBe(true);
    expect(summary.codeBytes).toBe(0);
    expect(summary.codeRevisionCount).toBe(0);
  });
});
