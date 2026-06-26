import { describe, expect, it } from "vitest";
import { expandedExerciseBacklog } from "@/features/exercises/expanded-exercise-backlog";
import { exerciseCatalog } from "@/features/exercises/exercise-catalog";
import { projectLabs } from "@/features/labs/project-labs";
import { skillSeed } from "@/features/skills/skill-seed";

const skillIds = new Set(skillSeed.map((skill) => skill.id));
const implementedExerciseIds = new Set(exerciseCatalog.map((exercise) => exercise.id));
const knownProjectLabIds = new Set(projectLabs.map((lab) => lab.id));

// Current main already has tooling-status-parser -> debugging-toolchain-lab
// before project-labs.ts defines that lab. Keep the seed aware of this gap but
// force Claude to either add the lab or remap before converting specs to JSON.
const TEMPORARY_ALLOWED_MISSING_PROJECT_LABS = new Set(["debugging-toolchain-lab"]);

describe("expanded exercise backlog seed (#473)", () => {
  it("has unique ids that do not collide with already implemented exercises", () => {
    const ids = expandedExerciseBacklog.map((exercise) => exercise.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(implementedExerciseIds.has(id), `${id} already exists in exerciseCatalog`).toBe(false);
    }
  });

  it("uses valid skill ids and chooses a real primary grouping skill", () => {
    for (const exercise of expandedExerciseBacklog) {
      expect(exercise.skillIds.length, `${exercise.id} skillIds`).toBeGreaterThan(0);
      for (const skillId of exercise.skillIds) {
        expect(skillIds.has(skillId), `${exercise.id} missing skill ${skillId}`).toBe(true);
      }
      expect(skillIds.has(exercise.skillIds[0]), `${exercise.id} primary grouping skill`).toBe(true);
    }
  });

  it("uses existing or explicitly pending project labs", () => {
    for (const exercise of expandedExerciseBacklog) {
      const known = knownProjectLabIds.has(exercise.projectLab);
      const pending = TEMPORARY_ALLOWED_MISSING_PROJECT_LABS.has(exercise.projectLab);
      expect(known || pending, `${exercise.id} projectLab ${exercise.projectLab}`).toBe(true);
    }
  });

  it("keeps exercise specs small and implementation-ready", () => {
    for (const exercise of expandedExerciseBacklog) {
      expect(exercise.estimatedMinutes, `${exercise.id} estimate`).toBeGreaterThan(0);
      expect(exercise.estimatedMinutes, `${exercise.id} too large; split it`).toBeLessThanOrEqual(60);
      expect(exercise.editableFiles.length, `${exercise.id} editableFiles`).toBeGreaterThan(0);
      expect(exercise.task.trim().length, `${exercise.id} task`).toBeGreaterThan(20);
      expect(exercise.mustTest.length, `${exercise.id} mustTest`).toBeGreaterThanOrEqual(3);
    }
  });

  it("prioritizes foundation before interview and advanced work", () => {
    const phases = expandedExerciseBacklog.map((exercise) => exercise.phase);
    expect(phases).toEqual([...phases].sort((a, b) => a - b));
    expect(expandedExerciseBacklog.filter((exercise) => exercise.phase === 1).length).toBeGreaterThanOrEqual(8);
    expect(expandedExerciseBacklog.some((exercise) => exercise.practiceFocus === "interview-pattern")).toBe(true);
    expect(expandedExerciseBacklog.some((exercise) => exercise.practiceFocus === "cpp-modern")).toBe(true);
  });
});
