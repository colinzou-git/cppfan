import { describe, expect, it } from "vitest";
import { getProjectLabById, getProjectLabsByDifficulty, projectLabs } from "@/features/labs/project-labs";
import { getCodeLabConfigForItem } from "@/features/code-lab/code-lab-catalog";

const VALID_DIFFICULTY = new Set(["beginner", "intermediate"]);

describe("project labs catalog", () => {
  it("has projects with unique ids", () => {
    const ids = projectLabs.map((lab) => lab.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every project a difficulty, focus tags, and milestones", () => {
    for (const lab of projectLabs) {
      expect(VALID_DIFFICULTY.has(lab.difficulty)).toBe(true);
      expect(lab.focus.length).toBeGreaterThan(0);
      expect(lab.milestones.length).toBeGreaterThanOrEqual(2);
      expect(lab.title.length).toBeGreaterThan(0);
      expect(lab.summary.length).toBeGreaterThan(0);
    }
  });

  it("filters by difficulty", () => {
    expect(getProjectLabsByDifficulty("beginner").every((lab) => lab.difficulty === "beginner")).toBe(true);
    expect(getProjectLabsByDifficulty("beginner").length).toBeGreaterThan(0);
  });

  it("looks up a project by id", () => {
    expect(getProjectLabById("csv-table-summarizer")?.title).toMatch(/csv/i);
    expect(getProjectLabById("does-not-exist")).toBeNull();
  });

  it("gives every project a project-level Code Lab config (#439)", () => {
    for (const project of projectLabs) {
      expect(getCodeLabConfigForItem(project.id)).not.toBeNull();
    }
  });
});
