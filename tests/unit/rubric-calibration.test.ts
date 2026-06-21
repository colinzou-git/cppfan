import { describe, expect, it } from "vitest";
import { RUBRIC_CALIBRATION_SAMPLES, rubricScoresIndicateReady } from "@/features/interview/rubric-calibration";

describe("rubric calibration samples (#179)", () => {
  it("contains at least twelve calibration performances", () => {
    expect(RUBRIC_CALIBRATION_SAMPLES.length).toBeGreaterThanOrEqual(12);
  });

  it("classifies calibration performances as expected", () => {
    for (const sample of RUBRIC_CALIBRATION_SAMPLES) {
      expect(rubricScoresIndicateReady(sample.scores), sample.id).toBe(sample.expectedReady);
    }
  });

  it("does not treat passing code alone as full readiness", () => {
    const passingButThin = RUBRIC_CALIBRATION_SAMPLES.find((sample) => sample.id === "passing-code-thin-tests");
    expect(passingButThin).toBeDefined();
    expect(rubricScoresIndicateReady(passingButThin!.scores)).toBe(false);
  });
});
