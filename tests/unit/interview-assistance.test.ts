import { describe, expect, it } from "vitest";
import { summarizeAssistance } from "@/features/interview/interview-assistance";
import type { InterviewEvidence } from "@/features/interview/readiness";

function ev(overrides: Partial<InterviewEvidence>): InterviewEvidence {
  return {
    pattern: "binary_search",
    problemId: "iv.bs.x",
    unseen: true,
    mode: "interview",
    correct: true,
    hintsUsed: 0,
    context: "independent",
    completedAtMs: 0,
    ...overrides
  };
}

describe("summarizeAssistance (#182)", () => {
  it("returns nulls with no solves", () => {
    const s = summarizeAssistance([ev({ correct: false })]);
    expect(s).toEqual({
      recentSolves: 0,
      independentSolves: 0,
      hintedSolves: 0,
      hintRelianceRate: null,
      band: null
    });
  });

  it("counts independent vs hinted solves and bands a low reliance as independent", () => {
    const s = summarizeAssistance([
      ev({ problemId: "a", hintsUsed: 0 }),
      ev({ problemId: "b", hintsUsed: 0 }),
      ev({ problemId: "c", hintsUsed: 0 }),
      ev({ problemId: "d", hintsUsed: 2 }),
      ev({ problemId: "e", correct: false, hintsUsed: 3 }) // wrong -> not a solve
    ]);
    expect(s.recentSolves).toBe(4);
    expect(s.independentSolves).toBe(3);
    expect(s.hintedSolves).toBe(1);
    expect(s.hintRelianceRate).toBeCloseTo(0.25);
    expect(s.band).toBe("light"); // 0.25 is not < 0.25
  });

  it("bands heavy hint use as reliant and pure independence as independent", () => {
    expect(summarizeAssistance([ev({ hintsUsed: 1 }), ev({ problemId: "b", hintsUsed: 1 })]).band).toBe("reliant");
    expect(summarizeAssistance([ev({ hintsUsed: 0 })]).band).toBe("independent");
  });
});
