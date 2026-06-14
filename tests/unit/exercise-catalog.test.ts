import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exerciseCatalog, getExerciseById, getExercisesForSkill } from "@/features/exercises/exercise-catalog";
import { skillSeed } from "@/features/skills/skill-seed";

const ROOT = process.cwd();
const EXERCISES_DIR = join(ROOT, "exercises");
const skillIds = new Set(skillSeed.map((skill) => skill.id));

type RawExercise = {
  id: string;
  title: string;
  skill_ids: string[];
  difficulty: string;
  estimated_minutes: number;
  editable_files: string[];
  required_tests: string[];
  hints: string[];
  project_lab: string;
};

function exerciseDirs(): string[] {
  return readdirSync(EXERCISES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "_harness")
    .map((entry) => entry.name);
}

function readExerciseJson(dir: string): RawExercise {
  return JSON.parse(readFileSync(join(EXERCISES_DIR, dir, "exercise.json"), "utf8")) as RawExercise;
}

const DIFFICULTIES = new Set(["beginner", "intermediate", "advanced"]);

describe("exercise.json packages validate against the schema (#128)", () => {
  const dirs = exerciseDirs();

  it("has at least the three #81 packages", () => {
    expect(dirs.length).toBeGreaterThanOrEqual(3);
  });

  it("each package has well-formed, complete metadata", () => {
    for (const dir of dirs) {
      const ex = readExerciseJson(dir);
      expect(ex.id, `${dir} id`).toBe(dir);
      expect(typeof ex.title).toBe("string");
      expect(Array.isArray(ex.skill_ids) && ex.skill_ids.length > 0).toBe(true);
      expect(DIFFICULTIES.has(ex.difficulty), `${dir} difficulty`).toBe(true);
      expect(ex.estimated_minutes).toBeGreaterThan(0);
      expect(Array.isArray(ex.editable_files) && ex.editable_files.length > 0).toBe(true);
      expect(Array.isArray(ex.required_tests) && ex.required_tests.length > 0).toBe(true);
    }
  });

  it("references only skills that exist in the curriculum", () => {
    for (const dir of dirs) {
      for (const skillId of readExerciseJson(dir).skill_ids) {
        expect(skillIds.has(skillId), `${dir} references missing skill ${skillId}`).toBe(true);
      }
    }
  });

  it("editable files exist in both starter and solution", () => {
    for (const dir of dirs) {
      for (const file of readExerciseJson(dir).editable_files) {
        expect(existsSync(join(EXERCISES_DIR, dir, "starter", file)), `${dir} starter/${file}`).toBe(true);
        expect(existsSync(join(EXERCISES_DIR, dir, "solution", file)), `${dir} solution/${file}`).toBe(true);
      }
    }
  });

  it("every required test name appears in the package's tests.cpp", () => {
    for (const dir of dirs) {
      const tests = readFileSync(join(EXERCISES_DIR, dir, "tests", "tests.cpp"), "utf8");
      for (const name of readExerciseJson(dir).required_tests) {
        expect(tests.includes(name), `${dir} tests.cpp missing ${name}`).toBe(true);
      }
    }
  });
});

describe("typed web catalog stays in parity with the JSON packages (#128)", () => {
  it("has one catalog entry per package, matching the canonical metadata", () => {
    const dirs = exerciseDirs().sort();
    expect(exerciseCatalog.map((e) => e.id).sort()).toEqual(dirs);

    for (const entry of exerciseCatalog) {
      const raw = readExerciseJson(entry.id);
      expect(entry.title).toBe(raw.title);
      expect(entry.skillIds).toEqual(raw.skill_ids);
      expect(entry.difficulty).toBe(raw.difficulty);
      expect(entry.estimatedMinutes).toBe(raw.estimated_minutes);
      expect(entry.editableFiles).toEqual(raw.editable_files);
      expect(entry.requiredTests).toEqual(raw.required_tests);
      expect(entry.hints).toEqual(raw.hints);
      expect(entry.projectLab).toBe(raw.project_lab);
    }
  });

  it("catalog accessors resolve by id and by skill", () => {
    expect(getExerciseById("raii-scoped-array")?.title).toMatch(/scoped array/i);
    expect(getExerciseById("does-not-exist")).toBeNull();
    expect(getExercisesForSkill("dsa.arrays.two_pointers").map((e) => e.id)).toContain("dsa-two-sum-sorted");
    expect(getExercisesForSkill("nope.nope")).toEqual([]);
  });
});
