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
import { stringTraceFixtures } from "@/features/learning-items/string-fixtures";
import { capstoneProjects, capstoneTracks } from "@/features/labs/capstone-tracks";
import { projectLabs } from "@/features/labs/project-labs";
import { externalResources } from "@/features/resources/resource-catalog";
import { skillSeed } from "@/features/skills/skill-seed";

const REQUIRED_SKILLS = [
  "dsa.strings.manipulation",
  "dsa.strings.searching",
  "dsa.strings.palindrome",
  "dsa.strings.parsing",
  "dsa.strings.prefix_function",
  "dsa.strings.trie",
  "dsa.strings.hashing",
  "dsa.strings.z_function",
  "dsa.strings.palindrome_substrings",
  "dsa.strings.parsing_edge_cases",
  "dsa.strings.char_frequency",
  "dsa.strings.substring_subsequence",
  "dsa.strings.case_handling"
];

const REQUIRED_ITEMS = [
  "dsa.strings.char_frequency.lesson",
  "dsa.strings.substring_subsequence.lesson",
  "dsa.strings.case_handling.lesson",
  "dsa.strings.parsing_edge_cases.lesson",
  "dsa.strings.searching.code_naive_trace",
  "dsa.strings.searching.mc_method_constraints",
  "dsa.strings.prefix_function.code_table_trace",
  "dsa.strings.z_function.code_table_trace",
  "dsa.strings.trie.lesson",
  "dsa.strings.hashing.mc_double_hash",
  "dsa.strings.palindrome_substrings.lesson"
];

const REQUIRED_RESOURCES = [
  "cses-string-algorithms",
  "cp-algorithms-prefix-function",
  "cp-algorithms-z-function",
  "cp-algorithms-string-hashing"
];

describe("string algorithm completion coverage (#120)", () => {
  it("keeps the original #79 scope represented as active skills and learning items", () => {
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

  it("uses trace fixtures with text equivalents for string tables", () => {
    expect(stringTraceFixtures.prefixTable.textDescription).toMatch(/proper prefix and suffix/i);
    expect(stringTraceFixtures.zTable.textDescription).toMatch(/matches the string prefix/i);
    expect(stringTraceFixtures.naiveSearch.textDescription).toMatch(/repeats most comparisons/i);

    const naive = learningItems.find((item) => item.id === "dsa.strings.searching.code_naive_trace");
    const prefix = learningItems.find((item) => item.id === "dsa.strings.prefix_function.code_table_trace");
    const zTrace = learningItems.find((item) => item.id === "dsa.strings.z_function.code_table_trace");

    expect(naive?.prompt).toContain("Text equivalent:");
    expect(naive?.explanation).toMatch(/O\(n\*m\)/);
    expect(prefix?.prompt).toContain(stringTraceFixtures.prefixTable.textDescription);
    expect(prefix?.explanation).toMatch(/pi\[3\] = 2/);
    expect(zTrace?.prompt).toContain(stringTraceFixtures.zTable.textDescription);
    expect(zTrace?.explanation).toMatch(/pattern\+separator\+text/);
  });

  it("makes method selection and collision limitations explicit", () => {
    const methodChoices = learningItemChoices.filter(
      (choice) => choice.learning_item_id === "dsa.strings.searching.mc_method_constraints"
    );
    expect(methodChoices.filter((choice) => choice.is_correct).map((choice) => choice.content)).toEqual([
      "KMP with a prefix table"
    ]);

    const hashingLesson = getLearningItemById("dsa.strings.hashing.lesson")?.item;
    const doubleHash = getLearningItemById("dsa.strings.hashing.mc_double_hash")?.item;
    const doubleHashChoices = learningItemChoices.filter(
      (choice) => choice.learning_item_id === "dsa.strings.hashing.mc_double_hash"
    );

    expect(hashingLesson?.prompt).toMatch(/verify.*character|double hashing/i);
    expect(doubleHash?.explanation).toMatch(/probabilistic filter|verify/i);
    expect(doubleHashChoices.filter((choice) => choice.is_correct).map((choice) => choice.content)).toEqual([
      "It greatly lowers collision probability, but direct verification is still needed for absolute correctness"
    ]);
  });

  it("registers string resources, project lab, capstone path, and autocomplete exercise", () => {
    const resourceIds = new Set(
      externalResources.filter((resource) => resource.tags.includes("dsa")).map((resource) => resource.id)
    );
    for (const id of REQUIRED_RESOURCES) {
      expect(resourceIds.has(id), `${id} should be registered`).toBe(true);
    }

    const lab = projectLabs.find((entry) => entry.id === "dictionary-autocomplete");
    expect(lab?.focus).toEqual(["strings", "tries", "prefix queries", "autocomplete"]);
    expect(capstoneTracks.find((track) => track.id === "string_applications")?.projectIds).toContain(
      "dictionary-autocomplete"
    );

    const project = capstoneProjects.find((entry) => entry.id === "dictionary-autocomplete");
    expect(project?.milestones.some((milestone) => milestone.exerciseId === "trie-autocomplete")).toBe(true);
    expect(project?.milestones.some((milestone) => milestone.practicedSkillIds.includes("dsa.strings.hashing"))).toBe(
      true
    );

    const exercise = exerciseCatalog.find((entry) => entry.id === "trie-autocomplete");
    expect(exercise?.projectLab).toBe("dictionary-autocomplete");
    expect(exercise?.skillIds).toEqual([
      "dsa.strings.trie",
      "dsa.strings.char_frequency",
      "dsa.strings.case_handling"
    ]);
    expect(existsSync(join(process.cwd(), "exercises", "trie-autocomplete", "tests", "tests.cpp"))).toBe(true);

    const tests = readFileSync(join(process.cwd(), "exercises", "trie-autocomplete", "tests", "tests.cpp"), "utf8");
    expect(tests).toMatch(/test_prefix_suggestions_sorted/);
    expect(tests).toMatch(/test_empty_prefix_returns_dictionary_order/);
  });
});
