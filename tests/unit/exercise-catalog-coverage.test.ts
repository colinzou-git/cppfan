import { describe, expect, it } from "vitest";
import { exerciseCatalog } from "@/features/exercises/exercise-catalog";
import {
  EXERCISE_COVERAGE_AREAS,
  buildExerciseCoverageReport,
  buildExerciseCatalogDiagnostics
} from "@/features/exercises/exercise-coverage";

describe("exercise catalog coverage (#473)", () => {
  it("covers every required area at or above its floor", () => {
    const report = buildExerciseCoverageReport(exerciseCatalog);
    const gaps = report.filter((row) => row.gap > 0);
    expect(gaps.map((g) => `${g.areaId} (${g.count}/${g.minimumExercises})`)).toEqual([]);
  });

  it("keeps coverage area ids unique", () => {
    const ids = EXERCISE_COVERAGE_AREAS.map((area) => area.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("assigns every catalog exercise to at least one coverage area", () => {
    const uncovered = exerciseCatalog
      .filter((e) => !EXERCISE_COVERAGE_AREAS.some((area) => area.matches(e)))
      .map((e) => e.id);
    expect(uncovered).toEqual([]);
  });

  it("has no duplicate normalized titles and no shallow test suites (hard-quality diagnostics)", () => {
    const diagnostics = buildExerciseCatalogDiagnostics(exerciseCatalog);
    // Duplicate titles, shallow tests, and uncovered exercises are defects that
    // must stay at zero; near-duplicate skill sets are advisory (distinct
    // problems can legitimately share a skill tag) and are not asserted here.
    const hard = diagnostics.filter(
      (d) => d.code === "duplicate_title" || d.code === "too_few_tests" || d.code === "uncovered_exercise"
    );
    expect(hard).toEqual([]);
  });
});
