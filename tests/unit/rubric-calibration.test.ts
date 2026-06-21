import { describe, expect, it } from "vitest";
import {
  RUBRIC_CALIBRATION_SAMPLES,
  rubricScoresIndicateReady
} from "@/features/interview/rubric-calibration";
import type { RubricScore } from "@/features/interview/rubric";

describe("rubric calibration (#179)", () => {
  it("provides at least 12 reviewed sample sessions", () => {
    expect(RUBRIC_CALIBRATION_SAMPLES.length).toBeGreaterThanOrEqual(12);
    const ids = new Set(RUBRIC_CALIBRATION_SAMPLES.map((s) => s.id));
    expect(ids.size).toBe(RUBRIC_CALIBRATION_SAMPLES.length);
  });

  it("covers weak reasoning/testing, incomplete code, assistance-heavy success, and clean success", () => {
    const labels = RUBRIC_CALIBRATION_SAMPLES.map((s) => s.id);
    expect(labels).toContain("passing-code-thin-reasoning");
    expect(labels).toContain("passing-code-thin-tests");
    expect(labels).toContain("approach-with-broken-code");
    expect(labels).toContain("many-prompts-success");
    expect(RUBRIC_CALIBRATION_SAMPLES.some((s) => s.expectedReady)).toBe(true);
    expect(RUBRIC_CALIBRATION_SAMPLES.some((s) => !s.expectedReady)).toBe(true);
  });

  it("classifies every reviewed sample to its expected readiness", () => {
    for (const sample of RUBRIC_CALIBRATION_SAMPLES) {
      expect(
        rubricScoresIndicateReady(sample.scores),
        `${sample.id} (${sample.label}) should be ${sample.expectedReady ? "ready" : "not ready"}`
      ).toBe(sample.expectedReady);
    }
  });

  it("does not report passing code with weak communication and testing as ready", () => {
    // Correct, well-implemented C++ but the learner stayed silent and skipped
    // edge-case testing — strong code must not be reported as interview-ready.
    const scores: RubricScore[] = [
      { criterion: "correctness", score: 4, source: "automated" },
      { criterion: "cpp_implementation", score: 4, source: "automated" },
      { criterion: "communication", score: 1, source: "peer" },
      { criterion: "testing", score: 1, source: "automated" },
      { criterion: "complexity", score: 3, source: "self" }
    ];
    expect(rubricScoresIndicateReady(scores)).toBe(false);
  });
});
