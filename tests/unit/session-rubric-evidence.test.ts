import { describe, expect, it } from "vitest";
import {
  automatedScoresFromSessionEvidence,
  type SessionRubricEvidence
} from "@/features/interview/session-rubric-evidence";
import type { RubricCriterionId } from "@/features/interview/rubric";

function scoreOf(evidence: SessionRubricEvidence, criterion: RubricCriterionId): number | undefined {
  return automatedScoresFromSessionEvidence(evidence).find((s) => s.criterion === criterion)?.score;
}

const cleanRun: SessionRubricEvidence = {
  sessionId: "00000000-0000-4000-8000-000000000001",
  durationMinutes: 45,
  elapsedSeconds: 40 * 60,
  phaseElapsedSeconds: { testing: 180 },
  notesByPhase: {
    clarification: "Confirmed input ranges and the empty-array contract.",
    examples: "Walked a small balanced and an unbalanced example.",
    baseline: "Brute force O(n^2), then noted the bottleneck.",
    optimization: "Mapped to a hash + prefix-sum pass.",
    complexity: "O(n) time and O(n) space, justified from the single pass.",
    follow_up: "Adapted to the streaming variant without a full re-solve."
  },
  testNotes: "Added empty, single-element, and overflow edge cases before submitting.",
  assistanceUsed: false,
  judge: { compiled: true, visiblePassed: 1, visibleTotal: 1, hiddenPassed: 3, hiddenTotal: 3, status: "passed" }
};

describe("automatedScoresFromSessionEvidence (#179)", () => {
  it("marks every score as automated source (kept distinct from self/peer)", () => {
    expect(automatedScoresFromSessionEvidence(cleanRun).every((s) => s.source === "automated")).toBe(true);
  });

  it("rewards a clean, all-tests-passing, in-budget independent run", () => {
    expect(scoreOf(cleanRun, "correctness")).toBe(4);
    expect(scoreOf(cleanRun, "cpp_implementation")).toBe(4);
    expect(scoreOf(cleanRun, "time_management")).toBe(4);
    expect(scoreOf(cleanRun, "hint_dependence")).toBe(4); // no assistance used
  });

  it("scores correctness from hidden-test results and zeroes C++ when it did not compile", () => {
    const brokenBuild: SessionRubricEvidence = {
      ...cleanRun,
      judge: { compiled: false, visiblePassed: 0, visibleTotal: 1, hiddenPassed: 0, hiddenTotal: 3, status: "compile_error" }
    };
    expect(scoreOf(brokenBuild, "cpp_implementation")).toBe(0);
    expect(scoreOf(brokenBuild, "correctness")).toBe(0);
  });

  it("penalizes assistance dependence", () => {
    const assisted: SessionRubricEvidence = { ...cleanRun, assistanceUsed: true };
    expect(scoreOf(assisted, "hint_dependence")).toBeLessThan(scoreOf(cleanRun, "hint_dependence")!);
  });

  it("does not invent communication credit when phases carry no notes", () => {
    const silent: SessionRubricEvidence = { ...cleanRun, notesByPhase: {} };
    expect(scoreOf(silent, "communication")).toBeLessThan(scoreOf(cleanRun, "communication")!);
  });

  it("derives a score for every rubric criterion it can observe", () => {
    const scores = automatedScoresFromSessionEvidence(cleanRun);
    // Every derived score is within the 0-4 band.
    expect(scores.every((s) => s.score >= 0 && s.score <= 4)).toBe(true);
  });
});
