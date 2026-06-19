import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exerciseCatalog } from "@/features/exercises/exercise-catalog";
import {
  getLearningItemById,
  learningItemChoices,
  learningItems,
  learningItemSkills
} from "@/features/learning-items/learning-item-seed";
import { capstoneProjects, capstoneTracks } from "@/features/labs/capstone-tracks";
import { projectLabs } from "@/features/labs/project-labs";
import { externalResources } from "@/features/resources/resource-catalog";
import { skillSeed } from "@/features/skills/skill-seed";

const REQUIRED_SKILLS = [
  "cpp.utilities.file_io",
  "cpp.utilities.stream_validation",
  "cpp.utilities.getline_input",
  "cpp.utilities.filesystem",
  "cpp.utilities.binary_io",
  "cpp.utilities.chrono_depth",
  "cpp.utilities.random_quality",
  "cpp.utilities.tuples",
  "cpp.utilities.variant",
  "cpp.utilities.variant_visit",
  "cpp.utilities.enums",
  "cpp.utilities.any_caution"
];

const REQUIRED_ITEMS = [
  "cpp.utilities.file_io.code_raii_close",
  "cpp.utilities.stream_validation.code_state_trace",
  "cpp.utilities.getline_input.lesson",
  "cpp.utilities.filesystem.lesson",
  "cpp.utilities.binary_io.lesson",
  "cpp.utilities.chrono_depth.lesson",
  "cpp.utilities.random_quality.lesson",
  "cpp.utilities.tuples.lesson",
  "cpp.utilities.variant_visit.lesson",
  "cpp.utilities.enums.lesson",
  "cpp.utilities.any_caution.lesson",
  "cpp.utilities.any_caution.mc_choice"
];

const REQUIRED_RESOURCES = [
  "cppreference-filesystem",
  "cppreference-fstream",
  "cppreference-chrono",
  "cppreference-random",
  "cppreference-optional",
  "cppreference-variant",
  "cppreference-any",
  "cppreference-tuple"
];

describe("robust I/O, filesystem, chrono/random, and utility-type completion coverage (#121)", () => {
  it("keeps the original #80 outcomes represented as active skills and items", () => {
    const activeSkillIds = new Set(skillSeed.filter((skill) => skill.is_active).map((skill) => skill.id));

    for (const skillId of REQUIRED_SKILLS) {
      expect(activeSkillIds.has(skillId), `${skillId} should be active`).toBe(true);
      const itemCount = learningItemSkills.filter((mapping) => mapping.skill_id === skillId).length;
      expect(itemCount, `${skillId} should have lesson and quiz/trace coverage`).toBeGreaterThanOrEqual(2);
    }

    for (const itemId of REQUIRED_ITEMS) {
      expect(getLearningItemById(itemId), `${itemId} should exist`).not.toBeNull();
    }
  });

  it("deepens stream state and file lifetime beyond introductory recall", () => {
    const streamTrace = learningItems.find((item) => item.id === "cpp.utilities.stream_validation.code_state_trace");
    const fileLifetime = learningItems.find((item) => item.id === "cpp.utilities.file_io.code_raii_close");
    const getline = getLearningItemById("cpp.utilities.getline_input.lesson")?.item;

    expect(streamTrace?.prompt).toMatch(/failbit|unchanged|buffered|recovery|clear|ignore/i);
    expect(streamTrace?.explanation).toMatch(/failbit|leaves `abc` buffered|clear\(\).*ignore/i);
    expect(fileLifetime?.explanation).toMatch(/destructor|early return|close\(\).*errors/i);
    expect(getline?.prompt).toMatch(/while.*getline|leftover newline|ignore/i);
  });

  it("keeps chrono/random and utility-type tradeoffs explicit", () => {
    const chrono = getLearningItemById("cpp.utilities.chrono_depth.lesson")?.item;
    const random = getLearningItemById("cpp.utilities.random_quality.lesson")?.item;
    const variant = getLearningItemById("cpp.utilities.variant_visit.lesson")?.item;
    const any = getLearningItemById("cpp.utilities.any_caution.lesson")?.item;
    const anyChoices = learningItemChoices.filter(
      (choice) => choice.learning_item_id === "cpp.utilities.any_caution.mc_choice"
    );

    expect(chrono?.prompt).toMatch(/steady_clock|duration_cast|system_clock/i);
    expect(random?.prompt).toMatch(/engine|distribution|seed.*once|rand\(\)%n/i);
    expect(variant?.prompt).toMatch(/std::visit|every alternative|compile error/i);
    expect(any?.prompt).toMatch(/type-erased|optional|variant|templates|polymorphism/i);
    expect(anyChoices.filter((choice) => choice.is_correct).map((choice) => choice.content)).toEqual([
      "A plugin metadata bag whose value types are open-ended and not known by the core library"
    ]);
  });

  it("registers utility resources, project lab, capstone path, and filesystem exercise", () => {
    const resourceIds = new Set(
      externalResources.filter((resource) => resource.tags.includes("cpp")).map((resource) => resource.id)
    );
    for (const id of REQUIRED_RESOURCES) {
      expect(resourceIds.has(id), `${id} should be registered`).toBe(true);
    }

    const lab = projectLabs.find((entry) => entry.id === "directory-inventory-reporter");
    expect(lab?.focus).toEqual(["file I/O", "filesystem", "chrono", "enum state"]);
    expect(capstoneTracks.find((track) => track.id === "data_analysis")?.projectIds).toContain(
      "directory-inventory-reporter"
    );

    const project = capstoneProjects.find((entry) => entry.id === "directory-inventory-reporter");
    expect(project?.milestones.some((milestone) => milestone.exerciseId === "filesystem-inventory")).toBe(true);
    expect(project?.milestones.some((milestone) => milestone.practicedSkillIds.includes("cpp.utilities.chrono_depth"))).toBe(
      true
    );
    expect(project?.milestones.some((milestone) => milestone.practicedSkillIds.includes("cpp.utilities.any_caution"))).toBe(
      true
    );

    const exercise = exerciseCatalog.find((entry) => entry.id === "filesystem-inventory");
    expect(exercise?.projectLab).toBe("directory-inventory-reporter");
    expect(exercise?.skillIds).toEqual([
      "cpp.utilities.filesystem",
      "cpp.utilities.file_io",
      "cpp.utilities.stream_validation"
    ]);
    expect(existsSync(join(process.cwd(), "exercises", "filesystem-inventory", "tests", "tests.cpp"))).toBe(true);

    const solution = readFileSync(
      join(process.cwd(), "exercises", "filesystem-inventory", "solution", "inventory.hpp"),
      "utf8"
    );
    expect(solution).toMatch(/recursive_directory_iterator/);
    expect(solution).toMatch(/std::error_code/);
    expect(solution).toMatch(/is_regular_file|is_directory|file_size/);
  });
});
