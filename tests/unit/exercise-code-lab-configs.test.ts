import { describe, expect, it } from "vitest";
import { exerciseCatalog } from "@/features/exercises/exercise-catalog";
import { getCodeLabConfigForItem } from "@/features/code-lab/code-lab-catalog";

// #440: every write-code exercise opens its own Code Lab at /lab/<exerciseId>.
// Its config must be keyed by the EXERCISE id (never exercise.projectLab) and
// carry skill tags covering the exercise's skillIds so attempt evidence maps back
// to the right skills.
describe("write-code exercise Code Lab configs (#440)", () => {
  for (const exercise of exerciseCatalog) {
    describe(exercise.id, () => {
      const config = getCodeLabConfigForItem(exercise.id);

      it("exists, enabled, C++ with starter main and visible tests", () => {
        expect(config).not.toBeNull();
        expect(config?.enabled).toBe(true);
        expect(config?.language).toBe("cpp");
        expect(config?.starterCode).toContain("int main");
        expect((config?.visibleTests.length ?? 0)).toBeGreaterThan(0);
        expect((config?.prompt ?? "").length).toBeGreaterThan(0);
      });

      it("skill tags cover the exercise's skillIds", () => {
        expect(config?.skillTags ?? []).toEqual(expect.arrayContaining(exercise.skillIds));
      });

      it("is keyed by the exercise id (the Code Lab route), not its projectLab", () => {
        // The config resolves under the exercise id, and that routing key is
        // distinct from the related project lab id used only for context.
        expect(getCodeLabConfigForItem(exercise.id)).not.toBeNull();
        expect(exercise.id).not.toBe(exercise.projectLab);
      });
    });
  }
});
