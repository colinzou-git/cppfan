import { describe, expect, it } from "vitest";
import { automatedScoresFromSessionEvidence } from "@/features/interview/session-rubric-evidence";

describe("automatedScoresFromSessionEvidence (#179)", () => {
  it("separates passing judge results from process evidence", () => {
    const scores = automatedScoresFromSessionEvidence({
      sessionId: "11111111-1111-4111-8111-111111111111",
      durationMinutes: 45,
      elapsedSeconds: 2500,
      phaseElapsedSeconds: { testing: 30 },
      notesByPhase: {},
      testNotes: "",
      assistanceUsed: false,
      judge: {
        compiled: true,
        visiblePassed: 1,
        visibleTotal: 1,
        hiddenPassed: 3,
        hiddenTotal: 3,
        status: "accepted"
      }
    });

    expect(scores.find((score) => score.criterion === "correctness")?.score).toBe(4);
    expect(scores.find((score) => score.criterion === "cpp_implementation")?.score).toBe(4);
    expect(scores.find((score) => score.criterion === "testing")?.score).toBeLessThan(4);
    expect(scores.find((score) => score.criterion === "communication")?.score).toBeLessThan(3);
    expect(scores.every((score) => score.source === "automated")).toBe(true);
  });

  it("rewards documented testing and communication evidence separately", () => {
    const scores = automatedScoresFromSessionEvidence({
      sessionId: "22222222-2222-4222-8222-222222222222",
      durationMinutes: 45,
      elapsedSeconds: 2700,
      phaseElapsedSeconds: { testing: 180 },
      notesByPhase: {
        clarification: "asked about empty inputs",
        examples: "walked through a small example",
        baseline: "brute force first",
        optimization: "then used a hash map",
        complexity: "O(n) time and O(n) space",
        reflection: "reviewed tradeoffs"
      },
      testNotes: "tested empty input, duplicates, overflow, and no-solution cases",
      assistanceUsed: true,
      judge: {
        compiled: true,
        visiblePassed: 1,
        visibleTotal: 1,
        hiddenPassed: 2,
        hiddenTotal: 3,
        status: "wrong_answer"
      }
    });

    expect(scores.find((score) => score.criterion === "testing")?.score).toBeGreaterThanOrEqual(3);
    expect(scores.find((score) => score.criterion === "communication")?.score).toBe(4);
    expect(scores.find((score) => score.criterion === "hint_dependence")?.score).toBe(2);
  });
});
