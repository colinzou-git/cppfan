import { describe, expect, it } from "vitest";
import {
  getCapstoneMilestone,
  getCapstoneProjectIdForMilestone,
  practicedSkillsForMilestones
} from "@/features/labs/capstone-tracks";
import { skillSeed } from "@/features/skills/skill-seed";

const skillIds = new Set(skillSeed.map((s) => s.id));

describe("capstone milestone evidence mapping (#130)", () => {
  it("maps completed milestones to the distinct union of their practiced skills", () => {
    const skills = practicedSkillsForMilestones(["note-manager.m1", "note-manager.m3"]);
    expect(skills).toContain("cpp.structs_classes.syntax");
    expect(skills).toContain("cpp.utilities.file_io");
    // Distinct only.
    expect(new Set(skills).size).toBe(skills.length);
  });

  it("ignores unknown milestone ids and yields only real skills", () => {
    const skills = practicedSkillsForMilestones(["note-manager.m1", "does.not.exist"]);
    expect(skills.length).toBeGreaterThan(0);
    for (const id of skills) {
      expect(skillIds.has(id)).toBe(true);
    }
  });

  it("never returns evidence for an empty completion set (no auto-mastery)", () => {
    expect(practicedSkillsForMilestones([])).toEqual([]);
  });

  it("resolves the owning project for a milestone, robust to hyphenated ids", () => {
    expect(getCapstoneProjectIdForMilestone("csv-table-summarizer.m5")).toBe("csv-table-summarizer");
    expect(getCapstoneProjectIdForMilestone("note-manager.m1")).toBe("note-manager");
    expect(getCapstoneProjectIdForMilestone("does.not.exist")).toBeNull();
  });

  it("looks up a milestone and its verification method", () => {
    expect(getCapstoneMilestone("note-manager.m4")?.verification).toBe("exercise_tests");
    expect(getCapstoneMilestone("nope")).toBeNull();
  });
});
