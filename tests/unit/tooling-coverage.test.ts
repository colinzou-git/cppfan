import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getLearningItemById,
  learningItemChoices,
  learningItems,
  learningItemSkills
} from "@/features/learning-items/learning-item-seed";
import { exerciseCatalog } from "@/features/exercises/exercise-catalog";
import { externalResources } from "@/features/resources/resource-catalog";
import { skillSeed } from "@/features/skills/skill-seed";

const REQUIRED_SKILLS = [
  "cpp.tooling.error_handling",
  "cpp.tooling.testing",
  "cpp.tooling.debugging",
  "cpp.tooling.build",
  "cpp.tooling.warnings",
  "cpp.tooling.sanitizers",
  "cpp.tooling.cmake",
  "cpp.tooling.preconditions",
  "cpp.tooling.optional_expected",
  "cpp.tooling.error_strategy",
  "cpp.tooling.debugging_method",
  "cpp.tooling.unit_testing",
  "cpp.tooling.regression_testing",
  "cpp.tooling.format_static_analysis"
];

const REQUIRED_ITEMS = [
  "cpp.tooling.debugging_method.code_first_diagnostic",
  "cpp.tooling.debugging_method.mc_failure_kind",
  "cpp.tooling.unit_testing.code_failure_output",
  "cpp.tooling.unit_testing.mc_boundaries",
  "cpp.tooling.sanitizers.code_asan_report",
  "cpp.tooling.format_static_analysis.lesson",
  "cpp.tooling.format_static_analysis.mc_role",
  "cpp.tooling.error_strategy.mc_controlflow",
  "cpp.tooling.cmake.mc_link"
];

const REQUIRED_RESOURCES = [
  "cmake-tutorial",
  "gcc-warning-options",
  "clang-address-sanitizer",
  "clang-undefined-behavior-sanitizer",
  "clang-tidy"
];

describe("debugging/testing/tooling completion coverage (#113)", () => {
  it("keeps the original #71 checklist represented as active skills and items", () => {
    const activeSkillIds = new Set(skillSeed.filter((skill) => skill.is_active).map((skill) => skill.id));

    for (const skillId of REQUIRED_SKILLS) {
      expect(activeSkillIds.has(skillId), `${skillId} should be active`).toBe(true);
      const itemCount = learningItemSkills.filter((mapping) => mapping.skill_id === skillId).length;
      expect(itemCount, `${skillId} should have multiple learning items`).toBeGreaterThanOrEqual(2);
    }

    for (const itemId of REQUIRED_ITEMS) {
      expect(getLearningItemById(itemId), `${itemId} should exist`).not.toBeNull();
    }
  });

  it("includes realistic diagnostic, test failure, and sanitizer output interpretation", () => {
    const diagnostic = learningItems.find((item) => item.id === "cpp.tooling.debugging_method.code_first_diagnostic");
    const testFailure = learningItems.find((item) => item.id === "cpp.tooling.unit_testing.code_failure_output");
    const asan = learningItems.find((item) => item.id === "cpp.tooling.sanitizers.code_asan_report");

    expect(diagnostic?.prompt).toMatch(/parser\.cpp:17|expected ';'|STL headers/i);
    expect(diagnostic?.explanation).toMatch(/first actionable diagnostic|cascade errors/i);
    expect(testFailure?.prompt).toMatch(/test_empty_input_returns_zero|actual: 1/i);
    expect(asan?.prompt).toMatch(/AddressSanitizer|heap-buffer-overflow|scores\.cpp:42/i);
  });

  it("keeps the new multiple-choice items gradeable with one correct answer each", () => {
    for (const itemId of [
      "cpp.tooling.debugging_method.mc_failure_kind",
      "cpp.tooling.unit_testing.mc_boundaries",
      "cpp.tooling.format_static_analysis.mc_role"
    ]) {
      const choices = learningItemChoices.filter((choice) => choice.learning_item_id === itemId);
      expect(choices, itemId).toHaveLength(4);
      expect(choices.filter((choice) => choice.is_correct), itemId).toHaveLength(1);
    }
  });

  it("registers exact tooling resources and the guided CMake exercise", () => {
    const resourceIds = new Set(externalResources.filter((resource) => resource.tags.includes("cpp")).map((r) => r.id));
    for (const id of REQUIRED_RESOURCES) {
      expect(resourceIds.has(id), `${id} should be registered`).toBe(true);
    }

    const exercise = exerciseCatalog.find((entry) => entry.id === "tooling-status-parser");
    expect(exercise?.skillIds).toEqual([
      "cpp.tooling.debugging_method",
      "cpp.tooling.unit_testing",
      "cpp.tooling.regression_testing",
      "cpp.tooling.warnings",
      "cpp.tooling.sanitizers",
      "cpp.tooling.cmake"
    ]);

    const exerciseDir = join(process.cwd(), "exercises", "tooling-status-parser");
    expect(existsSync(join(exerciseDir, "CMakeLists.txt"))).toBe(true);
    expect(existsSync(join(exerciseDir, "tests", "tests.cpp"))).toBe(true);

    const cmake = readFileSync(join(exerciseDir, "CMakeLists.txt"), "utf8");
    expect(cmake).toMatch(/target_compile_options\(status_parser_tests PRIVATE -Wall -Wextra -Wpedantic\)/);
    expect(cmake).toMatch(/fsanitize=address,undefined/);
    expect(cmake).toMatch(/add_test\(NAME tooling_status_parser_tests/);
  });
});
