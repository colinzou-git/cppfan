import { describe, expect, it } from "vitest";
import {
  preferredScoreForCriterion,
  qualityFromScores,
  qualityFromSelfScores
} from "@/features/interview/readiness-store";
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

describe("qualityFromScores source preference (#179)", () => {
  it("prefers automated, then peer, then self evidence per dimension", () => {
    expect(
      preferredScoreForCriterion(
        [
          { criterion: "testing", score: 1, source: "self" },
          { criterion: "testing", score: 2, source: "peer" },
          { criterion: "testing", score: 4, source: "automated" }
        ],
        "testing"
      )
    ).toBe(4);
    expect(
      preferredScoreForCriterion(
        [
          { criterion: "testing", score: 1, source: "self" },
          { criterion: "testing", score: 3, source: "peer" }
        ],
        "testing"
      )
    ).toBe(3);
  });

  it("uses trusted automated/peer quality instead of a learner's optimistic self score", () => {
    // The learner self-reported strong testing/communication, but the judge-derived
    // automated evidence and the peer interviewer recorded weak signals. Readiness
    // must consume the trusted evidence, not the self-assessment.
    const scores: RubricScore[] = [
      { criterion: "testing", score: 4, source: "self" },
      { criterion: "testing", score: 1, source: "automated" },
      { criterion: "communication", score: 4, source: "self" },
      { criterion: "communication", score: 1, source: "peer" },
      { criterion: "complexity", score: 3, source: "self" }
    ];
    expect(qualityFromScores(scores)).toEqual({ testing: 1, communication: 1, complexity: 3 });
  });

  it("omits dimensions with no score at all (no invented evidence)", () => {
    expect(qualityFromScores([{ criterion: "correctness", score: 4, source: "automated" }])).toEqual({});
  });
});
