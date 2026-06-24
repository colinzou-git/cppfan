import { describe, expect, it } from "vitest";
import { projectLabs } from "@/features/labs/project-labs";
import { getCodeLabConfigForItem } from "@/features/code-lab/code-lab-catalog";

// #439: every Project Labs project compiles ONE codebase. Its Code Lab config
// must be keyed by the PROJECT id (never a milestone id like ".m1") and provide
// real starter C++ and at least one meaningful visible test.
describe("project-level Code Lab configs (#439)", () => {
  for (const project of projectLabs) {
    describe(project.id, () => {
      const config = getCodeLabConfigForItem(project.id);

      it("exists and is an enabled C++ stdin lab", () => {
        expect(config).not.toBeNull();
        expect(config?.enabled).toBe(true);
        expect(config?.language).toBe("cpp");
      });

      it("provides starter code with a main and at least one visible test", () => {
        expect(config?.starterCode).toContain("int main");
        expect((config?.visibleTests.length ?? 0)).toBeGreaterThan(0);
      });

      it("declares skill tags and a coding prompt", () => {
        expect((config?.skillTags?.length ?? 0)).toBeGreaterThan(0);
        expect((config?.prompt ?? "").length).toBeGreaterThan(0);
      });

      it("is keyed by the project id, not a milestone id", () => {
        expect(project.id).not.toMatch(/\.m\d+$/);
      });
    });
  }

  it("does not expose hidden test inputs/outputs beyond visible cases", () => {
    for (const project of projectLabs) {
      const config = getCodeLabConfigForItem(project.id);
      // hiddenTestCount is a count only; there is no array of hidden cases here.
      expect(config).not.toHaveProperty("hiddenTests");
    }
  });
});
