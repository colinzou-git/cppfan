/*
 * Finite, machine-checkable coverage model for the write-code exercise catalog
 * (#473). The original feature asked for "many useful" exercises with no
 * numerical endpoint, so batch expansion could continue forever. This replaces
 * count-driven growth with an auditable definition of done: every required topic
 * area must have meaningful representation, and duplicates / shallow clusters are
 * surfaced as diagnostics. Coverage is derived from the stable skill IDs the
 * catalog already carries — not a second hand-maintained topic list.
 */

import type { Exercise } from "./exercise-catalog";
import rawAreas from "./exercise-coverage-areas.json";

/** Serializable area definition, single-sourced so the CI script agrees (#473). */
export type ExerciseCoverageAreaSpec = {
  id: string;
  title: string;
  minimumExercises: number;
  skillPrefixes: string[];
};

export type ExerciseCoverageArea = ExerciseCoverageAreaSpec & {
  matches: (exercise: Exercise) => boolean;
};

/** True when any of the exercise's skill IDs is (or is under) one of `prefixes`. */
export function matchesSkillPrefixes(skillIds: string[], prefixes: string[]): boolean {
  return skillIds.some((skillId) => prefixes.some((prefix) => skillId === prefix || skillId.startsWith(`${prefix}.`)));
}

/**
 * Required coverage areas and their floors, derived from
 * `exercise-coverage-areas.json` (shared with scripts/exercises/report-coverage.mjs
 * so the report and the tests never drift). Minimums are deliberately below the
 * current catalog depth: they define the meaningful-representation contract that
 * must never regress, not a target to grow toward.
 */
export const EXERCISE_COVERAGE_AREAS: ExerciseCoverageArea[] = (rawAreas as ExerciseCoverageAreaSpec[]).map((area) => ({
  ...area,
  matches: (exercise: Exercise) => matchesSkillPrefixes(exercise.skillIds, area.skillPrefixes)
}));

export type ExerciseCoverageResult = {
  areaId: string;
  title: string;
  minimumExercises: number;
  exerciseIds: string[];
  count: number;
  gap: number;
};

export function buildExerciseCoverageReport(exercises: Exercise[]): ExerciseCoverageResult[] {
  return EXERCISE_COVERAGE_AREAS.map((area) => {
    const exerciseIds = exercises
      .filter(area.matches)
      .map((e) => e.id)
      .sort();
    return {
      areaId: area.id,
      title: area.title,
      minimumExercises: area.minimumExercises,
      exerciseIds,
      count: exerciseIds.length,
      gap: Math.max(0, area.minimumExercises - exerciseIds.length)
    };
  });
}

export type ExerciseCatalogDiagnostic =
  | { code: "duplicate_title"; exerciseIds: string[]; detail: string }
  | { code: "near_duplicate_skill_set"; exerciseIds: string[]; detail: string }
  | { code: "too_few_tests"; exerciseIds: string[]; detail: string }
  | { code: "uncovered_exercise"; exerciseIds: string[]; detail: string };

const MIN_TESTS = 4;
// Genuinely trivial exercises that legitimately need fewer than MIN_TESTS.
const FEW_TESTS_ALLOWLIST = new Set<string>([]);

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Automatable catalog-quality diagnostics (#473). These are warnings for the
 * generated report and the audit rubric — NOT hard CI failures (only uncovered
 * required areas fail CI). They flag likely duplicates and shallow tests for a
 * human to judge.
 */
export function buildExerciseCatalogDiagnostics(exercises: Exercise[]): ExerciseCatalogDiagnostic[] {
  const diagnostics: ExerciseCatalogDiagnostic[] = [];

  // Duplicate normalized titles.
  const byTitle = new Map<string, string[]>();
  for (const e of exercises) {
    const key = normalizeTitle(e.title);
    byTitle.set(key, [...(byTitle.get(key) ?? []), e.id]);
  }
  for (const [key, ids] of byTitle) {
    if (ids.length > 1) {
      diagnostics.push({ code: "duplicate_title", exerciseIds: ids.sort(), detail: `normalized title "${key}"` });
    }
  }

  // Identical skill sets (a signal of renamed variants).
  const bySkillSet = new Map<string, string[]>();
  for (const e of exercises) {
    const key = [...e.skillIds].sort().join("|");
    bySkillSet.set(key, [...(bySkillSet.get(key) ?? []), e.id]);
  }
  for (const [key, ids] of bySkillSet) {
    if (ids.length > 3) {
      diagnostics.push({
        code: "near_duplicate_skill_set",
        exerciseIds: ids.sort(),
        detail: `${ids.length} exercises share the exact skill set [${key}]`
      });
    }
  }

  // Shallow test suites.
  for (const e of exercises) {
    if (!FEW_TESTS_ALLOWLIST.has(e.id) && e.requiredTests.length < MIN_TESTS) {
      diagnostics.push({
        code: "too_few_tests",
        exerciseIds: [e.id],
        detail: `${e.requiredTests.length} required tests (< ${MIN_TESTS})`
      });
    }
  }

  // Exercises that match no coverage area — a coverage blind spot.
  const uncovered = exercises.filter((e) => !EXERCISE_COVERAGE_AREAS.some((area) => area.matches(e))).map((e) => e.id);
  if (uncovered.length > 0) {
    diagnostics.push({ code: "uncovered_exercise", exerciseIds: uncovered.sort(), detail: `${uncovered.length} exercise(s) match no coverage area` });
  }

  return diagnostics;
}
