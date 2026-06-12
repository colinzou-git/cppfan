import { describe, expect, it } from "vitest";
import {
  getSeedSkillMapPreview,
  getSkillsForModule,
  skillModules,
  skillPrerequisitesSeed,
  skillSeed
} from "@/features/skills/skill-seed";

const REQUIRED_MODULE_IDS = [
  "cpp.structs_classes",
  "cpp.constructors",
  "cpp.raii",
  "cpp.smart_pointers"
];

const REQUIRED_SKILL_IDS = [
  "cpp.structs_classes.syntax",
  "cpp.structs_classes.public_private",
  "cpp.constructors.default_constructor",
  "cpp.constructors.parameterized_constructor",
  "cpp.constructors.member_initializer_list",
  "cpp.constructors.destructor_intro",
  "cpp.raii.resource_lifetime",
  "cpp.raii.destructor_cleanup",
  "cpp.raii.ownership_boundary",
  "cpp.smart_pointers.unique_ptr",
  "cpp.smart_pointers.shared_ptr",
  "cpp.smart_pointers.weak_ptr"
];

describe("skill seed integrity", () => {
  it("has no duplicate skill ids", () => {
    const ids = skillSeed.map((skill) => skill.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("points every prerequisite reference at an existing skill", () => {
    const ids = new Set(skillSeed.map((skill) => skill.id));

    for (const prerequisite of skillPrerequisitesSeed) {
      expect(ids.has(prerequisite.skill_id)).toBe(true);
      expect(ids.has(prerequisite.prerequisite_skill_id)).toBe(true);
    }
  });

  it("never makes a skill its own prerequisite", () => {
    for (const prerequisite of skillPrerequisitesSeed) {
      expect(prerequisite.skill_id).not.toBe(prerequisite.prerequisite_skill_id);
    }
  });

  it("assigns every seeded skill to a known module", () => {
    const moduleIds = new Set(skillModules.map((module) => module.id));

    for (const skill of skillSeed) {
      expect(moduleIds.has(skill.module_id)).toBe(true);
    }
  });

  it("includes the four required modules", () => {
    const moduleIds = new Set(skillModules.map((module) => module.id));

    for (const requiredId of REQUIRED_MODULE_IDS) {
      expect(moduleIds.has(requiredId)).toBe(true);
    }
  });

  it("includes the required stable skill ids from docs/SKILL_ENGINE.md", () => {
    const ids = new Set(skillSeed.map((skill) => skill.id));

    for (const requiredId of REQUIRED_SKILL_IDS) {
      expect(ids.has(requiredId)).toBe(true);
    }
  });

  it("backs every populated module with at least one active skill", () => {
    for (const module of skillModules) {
      expect(getSkillsForModule(module.id).length).toBeGreaterThan(0);
    }
  });
});

describe("getSeedSkillMapPreview", () => {
  it("reports the seed source and returns sorted modules", () => {
    const preview = getSeedSkillMapPreview();

    expect(preview.source).toBe("seed");
    expect(preview.skills.length).toBe(skillSeed.length);

    const orderIndexes = preview.modules.map((module) => module.order_index);
    expect(orderIndexes).toEqual([...orderIndexes].sort((a, b) => a - b));
  });
});

describe("getSkillsForModule", () => {
  it("returns skills for a module sorted by order_index", () => {
    const skills = getSkillsForModule("cpp.structs_classes");

    expect(skills.length).toBeGreaterThan(0);
    expect(skills.every((skill) => skill.module_id === "cpp.structs_classes")).toBe(true);

    const orderIndexes = skills.map((skill) => skill.order_index);
    expect(orderIndexes).toEqual([...orderIndexes].sort((a, b) => a - b));
  });
});
