import { describe, expect, it } from "vitest";
import { RUBRIC_CALIBRATION_SAMPLES, rubricScoresIndicateReady } from "@/features/interview/rubric-calibration";

describe("rubric calibration samples (#179)", () => {
  it("contains at least twelve calibration performances with both ready and not-ready labels", () => {
    expect(RUBRIC_CALIBRATION_SAMPLES.length).toBeGreaterThanOrEqual(12);
    expect(RUBRIC_CALIBRATION_SAMPLES.some((sample) => sample.expectedReady)).toBe(true);
    expect(RUBRIC_CALIBRATION_SAMPLES.some((sample) => !sample.expectedReady)).toBe(true);
  });

  it("does not treat passing code alone as full readiness", () => {
    const passingButThin = RUBRIC_CALIBRATION_SAMPLES.find((sample) => sample.id === "passing-code-thin-tests");
    expect(passingButThin).toBeDefined();
    expect(rubricScoresIndicateReady(passingButThin!.scores)).toBe(false);
  });

  it("recognizes a balanced mock-ready score profile", () => {
    const ready = RUBRIC_CALIBRATION_SAMPLES.find((sample) => sample.id === "mock-ready");
    expect(ready).toBeDefined();
    expect(rubricScoresIndicateReady(ready!.scores)).toBe(true);
  });
});
