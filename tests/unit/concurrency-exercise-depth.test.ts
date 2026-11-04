import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getExerciseById } from "@/features/exercises/exercise-catalog";
import { getCodeLabConfigForItem } from "@/features/code-lab/code-lab-catalog";

const ADDED = [
  "concurrency-data-race-repair",
  "concurrency-deadlock-safe-transfer",
  "concurrency-jthread-cancellation",
  "concurrency-promise-future-errors",
  "concurrency-shared-mutex-registry",
  "concurrency-release-acquire-handoff"
] as const;

describe("focused concurrency practice (#706)", () => {
  it("registers six complete exercises with Code Lab configurations", () => {
    for (const id of ADDED) {
      const exercise = getExerciseById(id);
      const lab = getCodeLabConfigForItem(id);
      expect(exercise, id).not.toBeNull();
      expect(exercise!.projectLab).toBe("task-queue-lab");
      expect(exercise!.requiredTests.length).toBeGreaterThanOrEqual(4);
      expect(exercise!.skillIds.some((skill) => skill.startsWith("cpp.concurrency."))).toBe(true);
      expect(lab?.enabled).toBe(true);
      expect(lab?.language).toBe("cpp");
      expect(lab?.starterCode).toContain("int main");
      expect(lab?.skillTags).toEqual(expect.arrayContaining(exercise!.skillIds));
      expect(lab?.visibleTests.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("avoids sleep-timing assertions in all new reference solutions and tests", () => {
    for (const id of ADDED) {
      const exercise = getExerciseById(id)!;
      const dir = join(process.cwd(), "exercises", id);
      const tests = readFileSync(join(dir, "tests", "tests.cpp"), "utf8");
      const solution = readFileSync(join(dir, "solution", exercise.editableFiles[0]), "utf8");
      expect(tests + solution, id).not.toMatch(/\bsleep_(?:for|until)\s*\(/);
      for (const name of exercise.requiredTests) {
        expect(tests, id).toContain(name);
      }
    }
  });
});
