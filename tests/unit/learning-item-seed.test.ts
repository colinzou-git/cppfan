import { describe, expect, it } from "vitest";
import {
  getLearningItemById,
  learningItemChoices,
  learningItems,
  learningItemSkills
} from "@/features/learning-items/learning-item-seed";
import { skillSeed } from "@/features/skills/skill-seed";

const VALID_TYPES = new Set(["lesson", "concept_check", "multiple_choice", "code_reading", "bug_spotting"]);

describe("learning item seed integrity", () => {
  it("has unique, stable item ids", () => {
    const ids = learningItems.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses only supported item types", () => {
    for (const item of learningItems) {
      expect(VALID_TYPES.has(item.type)).toBe(true);
    }
  });

  it("maps every item to at least one skill", () => {
    for (const item of learningItems) {
      const mappings = learningItemSkills.filter((mapping) => mapping.learning_item_id === item.id);
      expect(mappings.length).toBeGreaterThan(0);
    }
  });

  it("references only existing skills in skill mappings", () => {
    const skillIds = new Set(skillSeed.map((skill) => skill.id));

    for (const mapping of learningItemSkills) {
      expect(skillIds.has(mapping.skill_id)).toBe(true);
    }
  });

  it("references only existing items in skill mappings", () => {
    const itemIds = new Set(learningItems.map((item) => item.id));

    for (const mapping of learningItemSkills) {
      expect(itemIds.has(mapping.learning_item_id)).toBe(true);
    }
  });

  it("gives every item exactly one primary skill mapping", () => {
    for (const item of learningItems) {
      const primaries = learningItemSkills.filter(
        (mapping) => mapping.learning_item_id === item.id && mapping.is_primary
      );
      expect(primaries.length).toBe(1);
    }
  });

  it("references only existing items in choices", () => {
    const itemIds = new Set(learningItems.map((item) => item.id));

    for (const choice of learningItemChoices) {
      expect(itemIds.has(choice.learning_item_id)).toBe(true);
    }
  });

  it("gives every multiple-choice item exactly one correct answer", () => {
    const multipleChoiceItems = learningItems.filter((item) => item.type === "multiple_choice");
    expect(multipleChoiceItems.length).toBeGreaterThan(0);

    for (const item of multipleChoiceItems) {
      const choices = learningItemChoices.filter((choice) => choice.learning_item_id === item.id);
      expect(choices.length).toBeGreaterThanOrEqual(2);

      const correct = choices.filter((choice) => choice.is_correct);
      expect(correct.length).toBe(1);
    }
  });

  it("never leaves a choice set with zero or multiple correct answers", () => {
    const itemIdsWithChoices = new Set(learningItemChoices.map((choice) => choice.learning_item_id));

    for (const itemId of itemIdsWithChoices) {
      const correct = learningItemChoices.filter(
        (choice) => choice.learning_item_id === itemId && choice.is_correct
      );
      expect(correct.length).toBe(1);
    }
  });
});

describe("getLearningItemById", () => {
  it("returns an item with skills and answer-key-free choices", () => {
    const result = getLearningItemById("cpp.structs_classes.syntax.mc_default_access");

    expect(result).not.toBeNull();
    expect(result?.item.type).toBe("multiple_choice");
    expect(result?.skills.length).toBeGreaterThan(0);
    expect(result?.choices.length).toBe(4);

    for (const choice of result?.choices ?? []) {
      expect("is_correct" in choice).toBe(false);
    }
  });

  it("returns null for an unknown item", () => {
    expect(getLearningItemById("does.not.exist")).toBeNull();
  });
});
