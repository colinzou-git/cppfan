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

const REQUIRED_ITEMS = [
  "cpp.value_semantics.special_members.mc_which",
  "cpp.value_semantics.special_members.bug_missing_assignment",
  "cpp.value_semantics.special_members.code_state_trace",
  "cpp.value_semantics.copy_elision.mc_return",
  "cpp.value_semantics.deep_copy.bug_double_free",
  "cpp.value_semantics.rule_of_zero_five.bug_refactor_zero",
  "cpp.value_semantics.self_assignment.mc_guard",
  "cpp.value_semantics.stream_insertion.mc_signature",
  "cpp.value_semantics.operators.bug_implicit_conversion"
];

const REQUIRED_SKILLS = [
  "cpp.value_semantics.copy",
  "cpp.value_semantics.move",
  "cpp.value_semantics.rule_of_zero_five",
  "cpp.value_semantics.special_members",
  "cpp.value_semantics.copy_elision",
  "cpp.value_semantics.operators",
  "cpp.value_semantics.self_assignment",
  "cpp.value_semantics.deep_copy",
  "cpp.value_semantics.stream_insertion"
];

describe("value semantics completion coverage (#111)", () => {
  it("keeps the original #69 checklist represented by applied learning items", () => {
    for (const itemId of REQUIRED_ITEMS) {
      expect(getLearningItemById(itemId), `${itemId} should exist`).not.toBeNull();
    }

    for (const skillId of REQUIRED_SKILLS) {
      const count = learningItemSkills.filter((mapping) => mapping.skill_id === skillId).length;
      expect(count, `${skillId} should have multiple learning items`).toBeGreaterThanOrEqual(2);
    }
  });

  it("uses state tracing and API-design prompts, not syntax recall alone", () => {
    const stateTrace = learningItems.find((item) => item.id === "cpp.value_semantics.special_members.code_state_trace");
    const missingAssignment = learningItems.find(
      (item) => item.id === "cpp.value_semantics.special_members.bug_missing_assignment"
    );
    const refactor = learningItems.find(
      (item) => item.id === "cpp.value_semantics.rule_of_zero_five.bug_refactor_zero"
    );
    const conversion = learningItems.find(
      (item) => item.id === "cpp.value_semantics.operators.bug_implicit_conversion"
    );

    expect(stateTrace?.prompt).toMatch(/std::move|owns `7`|guaranteed/i);
    expect(missingAssignment?.explanation).toMatch(/copy assignment|shallowly|Rule of Three\/Five/i);
    expect(refactor?.explanation).toMatch(/std::vector<int>|Rule of Zero/i);
    expect(conversion?.explanation).toMatch(/explicit|implicitly converted/i);
  });

  it("keeps the implicit-conversion item gradeable with exactly one correct answer", () => {
    const choices = learningItemChoices.filter(
      (choice) => choice.learning_item_id === "cpp.value_semantics.operators.bug_implicit_conversion"
    );

    expect(choices).toHaveLength(4);
    expect(choices.filter((choice) => choice.is_correct).map((choice) => choice.id)).toEqual([
      "cpp.value_semantics.operators.bug_implicit_conversion.a"
    ]);
  });

  it("keeps value-semantics resource links and compiled examples registered", () => {
    const resourceIds = new Set(externalResources.filter((resource) => resource.tags.includes("cpp")).map((r) => r.id));

    expect(resourceIds.has("cpp-core-guidelines-rule-of-zero")).toBe(true);
    expect(resourceIds.has("cppreference-rule-of-three")).toBe(true);
    expect(resourceIds.has("cppreference-copy-assignment")).toBe(true);
    expect(resourceIds.has("cppreference-explicit")).toBe(true);
    expect(existsSync(join(process.cwd(), "curriculum-examples", "rule-of-zero-refactor", "example.cpp"))).toBe(true);
  });
});
