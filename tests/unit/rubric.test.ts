import { describe, expect, it } from "vitest";
import {
  RUBRIC_CRITERIA,
  reviewSession,
  scoreBand,
  summarizeRubric,
  type RubricScore
} from "@/features/interview/rubric";

describe("rubric definition (#179)", () => {
  it("scores the twelve interview dimensions separately, each with a category and remediation", () => {
    expect(RUBRIC_CRITERIA.length).toBe(12);
    expect(new Set(RUBRIC_CRITERIA.map((c) => c.id)).size).toBe(12);
    for (const c of RUBRIC_CRITERIA) {
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.remediation.length).toBeGreaterThan(0);
    }
    // Coding-ish and communication dimensions are distinguishable by category.
    const categories = new Set(RUBRIC_CRITERIA.map((c) => c.category));
    expect(categories.has("communication")).toBe(true);
    expect(categories.has("implementation")).toBe(true);
  });

  it("bands a 0-4 score deterministically", () => {
    expect(scoreBand(4)).toBe("strong");
    expect(scoreBand(3)).toBe("solid");
    expect(scoreBand(2)).toBe("developing");
    expect(scoreBand(1)).toBe("needs_work");
    expect(scoreBand(0)).toBe("needs_work");
  });
});

describe("rubric summary keeps feedback sources distinct (#179)", () => {
  it("groups scores by self / peer / automated and averages across them", () => {
    const scores: RubricScore[] = [
      { criterion: "correctness", score: 4, source: "automated" },
      { criterion: "correctness", score: 2, source: "self" },
      { criterion: "communication", score: 1, source: "peer" }
    ];
    const summaries = summarizeRubric(scores);
    const correctness = summaries.find((s) => s.criterion === "correctness");
    expect(correctness?.bySource.automated).toEqual([4]);
    expect(correctness?.bySource.self).toEqual([2]);
    expect(correctness?.bySource.peer).toEqual([]);
    expect(correctness?.average).toBe(3);
    expect(correctness?.band).toBe("solid");
  });

  it("leaves unscored criteria with a null average (no invented evidence)", () => {
    const summaries = summarizeRubric([{ criterion: "testing", score: 3, source: "self" }]);
    const optimization = summaries.find((s) => s.criterion === "optimization");
    expect(optimization?.average).toBeNull();
    expect(optimization?.band).toBeNull();
  });

  it("clamps out-of-range scores into 0-4", () => {
    const summaries = summarizeRubric([{ criterion: "testing", score: 9, source: "self" }]);
    expect(summaries.find((s) => s.criterion === "testing")?.average).toBe(4);
  });
});

describe("session review: separable categories + actionable remediation (#179)", () => {
  it("computes per-category averages so coding vs communication stay separable", () => {
    const review = reviewSession([
      { criterion: "correctness", score: 4, source: "automated" },
      { criterion: "cpp_implementation", score: 2, source: "automated" },
      { criterion: "communication", score: 1, source: "peer" }
    ]);
    expect(review.categoryAverages.implementation).toBe(3); // (4 + 2) / 2
    expect(review.categoryAverages.communication).toBe(1);
  });

  it("returns deterministic remediation for weak dimensions, weakest first", () => {
    const review = reviewSession([
      { criterion: "communication", score: 0, source: "peer" },
      { criterion: "testing", score: 1, source: "self" },
      { criterion: "correctness", score: 4, source: "automated" }
    ]);
    expect(review.remediation.map((r) => r.criterion)).toEqual(["communication", "testing"]);
    expect(review.remediation[0].advice.length).toBeGreaterThan(0);
    // A strong dimension is not flagged.
    expect(review.remediation.some((r) => r.criterion === "correctness")).toBe(false);
  });

  it("is stable for identical evidence", () => {
    const scores: RubricScore[] = [{ criterion: "optimization", score: 1, source: "self" }];
    expect(reviewSession(scores)).toEqual(reviewSession(scores));
  });
});
