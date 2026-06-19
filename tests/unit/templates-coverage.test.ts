import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getLearningItemById,
  learningItemChoices,
  learningItems,
  learningItemSkills
} from "@/features/learning-items/learning-item-seed";
import { externalResources } from "@/features/resources/resource-catalog";
import { skillSeed } from "@/features/skills/skill-seed";

const REQUIRED_SKILLS = [
  "cpp.templates.function_templates",
  "cpp.templates.class_templates",
  "cpp.templates.concepts",
  "cpp.templates.ranges",
  "cpp.templates.constexpr",
  "cpp.templates.if_constexpr",
  "cpp.templates.static_assert",
  "cpp.templates.multiple_params",
  "cpp.templates.deduction",
  "cpp.templates.aliases_specialization",
  "cpp.templates.concepts_depth",
  "cpp.templates.ranges_depth",
  "cpp.templates.view_lifetime"
];

const REQUIRED_ITEMS = [
  "cpp.templates.multiple_params.mc_nttp",
  "cpp.templates.deduction.mc_headers",
  "cpp.templates.aliases_specialization.mc_alias",
  "cpp.templates.concepts_depth.code_diagnostic",
  "cpp.templates.ranges_depth.mc_choose_tool",
  "cpp.templates.view_lifetime.bug_return_view",
  "cpp.templates.constexpr.mc_eval",
  "cpp.templates.if_constexpr.mc_discarded",
  "cpp.templates.static_assert.mc_when"
];

const REQUIRED_RESOURCE_IDS = [
  "cppreference-concepts-library",
  "cppreference-constraints",
  "cppreference-ranges-algorithms",
  "cppreference-filter-view",
  "cppreference-transform-view",
  "cppreference-take-view",
  "cppreference-constexpr",
  "cppreference-static-assert"
];

describe("templates/concepts/ranges completion coverage (#112)", () => {
  it("keeps the original #70 checklist represented as active skills and items", () => {
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

  it("requires applied diagnostic, tool-choice, and lifetime prompts", () => {
    const diagnostic = learningItems.find((item) => item.id === "cpp.templates.concepts_depth.code_diagnostic");
    const choice = learningItems.find((item) => item.id === "cpp.templates.ranges_depth.mc_choose_tool");
    const dangling = learningItems.find((item) => item.id === "cpp.templates.view_lifetime.bug_return_view");

    expect(diagnostic?.prompt).toMatch(/constraints not satisfied|std::integral|double/i);
    expect(diagnostic?.explanation).toMatch(/failed constraint|floating_point|call site/i);
    expect(choice?.explanation).toMatch(/simple loop|std::ranges::transform|lazy views/i);
    expect(dangling?.explanation).toMatch(/destroyed when the function returns|owning container|caller-owned/i);
  });

  it("keeps the ranges tool-choice item gradeable with exactly one correct answer", () => {
    const choices = learningItemChoices.filter(
      (answer) => answer.learning_item_id === "cpp.templates.ranges_depth.mc_choose_tool"
    );

    expect(choices).toHaveLength(4);
    expect(choices.filter((choice) => choice.is_correct).map((choice) => choice.id)).toEqual([
      "cpp.templates.ranges_depth.mc_choose_tool.a"
    ]);
  });

  it("includes exact API links and a compiled lifetime-safe ranges example", () => {
    const cppResourceIds = new Set(externalResources.filter((resource) => resource.tags.includes("cpp")).map((r) => r.id));

    for (const id of REQUIRED_RESOURCE_IDS) {
      expect(cppResourceIds.has(id), `${id} should be registered`).toBe(true);
    }

    expect(existsSync(join(process.cwd(), "curriculum-examples", "ranges-materialize-view", "example.cpp"))).toBe(true);
  });
});
