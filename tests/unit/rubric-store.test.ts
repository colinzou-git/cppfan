import { describe, expect, it } from "vitest";
import { rowsToSelfScores } from "@/features/interview/rubric-store";

describe("rowsToSelfScores (#179)", () => {
  it("maps valid rows to self RubricScores", () => {
    const scores = rowsToSelfScores([
      { criterion: "correctness", score: 3 },
      { criterion: "communication", score: 1 }
    ]);
    expect(scores).toEqual([
      { criterion: "correctness", score: 3, source: "self" },
      { criterion: "communication", score: 1, source: "self" }
    ]);
  });

  it("drops rows whose criterion is not in the rubric (no invented evidence)", () => {
    const scores = rowsToSelfScores([
      { criterion: "correctness", score: 2 },
      { criterion: "not_a_real_criterion", score: 4 }
    ]);
    expect(scores.map((s) => s.criterion)).toEqual(["correctness"]);
  });

  it("clamps out-of-range scores into 0-4", () => {
    const scores = rowsToSelfScores([
      { criterion: "testing", score: 9 },
      { criterion: "optimization", score: -2 }
    ]);
    expect(scores.find((s) => s.criterion === "testing")?.score).toBe(4);
    expect(scores.find((s) => s.criterion === "optimization")?.score).toBe(0);
  });
});
