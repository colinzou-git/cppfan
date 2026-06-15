import { describe, expect, it } from "vitest";
import { buildMockPackView } from "@/features/interview/mock-pack-view";
import { getCalibrationMockPacks, getPracticeMockPacks } from "@/features/interview/mock-packs";
import { getInterviewProblem } from "@/features/interview/problem-catalog";

// Mock-pack view (#182): surfaces the practice packs with resolved problem titles.

describe("buildMockPackView (#182)", () => {
  const view = buildMockPackView();

  it("shows exactly the practice packs (excludes the reserved calibration pool)", () => {
    expect(view.map((p) => p.id).sort()).toEqual(getPracticeMockPacks().map((p) => p.id).sort());
    const calibrationIds = new Set(getCalibrationMockPacks().map((p) => p.id));
    expect(view.every((p) => !calibrationIds.has(p.id))).toBe(true);
  });

  it("resolves each problem id to its catalog title", () => {
    for (const pack of view) {
      expect(pack.problems.length).toBeGreaterThan(0);
      for (const problem of pack.problems) {
        const fromCatalog = getInterviewProblem(problem.id);
        if (fromCatalog) {
          expect(problem.title).toBe(fromCatalog.title);
        }
      }
    }
  });

  it("carries duration, follow-up count, and pattern labels", () => {
    for (const pack of view) {
      expect([45, 50]).toContain(pack.durationMinutes);
      expect(pack.followUpCount).toBeGreaterThanOrEqual(1);
      expect(pack.patternLabels.length).toBeGreaterThan(0);
    }
  });
});
