import { describe, expect, it } from "vitest";
import { qualityFromSelfScores } from "@/features/interview/readiness-store";
import type { RubricScore } from "@/features/interview/rubric";

describe("qualityFromSelfScores (#180)", () => {
  it("maps the testing/complexity/communication self-rubric scores to quality averages", () => {
    const scores: RubricScore[] = [
      { criterion: "testing", score: 3, source: "self" },
      { criterion: "complexity", score: 2, source: "self" },
      { criterion: "communication", score: 4, source: "self" },
      { criterion: "correctness", score: 4, source: "self" }
    ];
    expect(qualityFromSelfScores(scores)).toEqual({ testing: 3, complexity: 2, communication: 4 });
  });

  it("omits dimensions with no self score (no invented evidence)", () => {
    const scores: RubricScore[] = [{ criterion: "testing", score: 1, source: "self" }];
    expect(qualityFromSelfScores(scores)).toEqual({ testing: 1 });
  });

  it("ignores non-self sources for quality", () => {
    const scores: RubricScore[] = [
      { criterion: "testing", score: 4, source: "peer" },
      { criterion: "complexity", score: 3, source: "automated" }
    ];
    expect(qualityFromSelfScores(scores)).toEqual({});
  });
});
