import { describe, expect, it } from "vitest";
import { getLearningItemById, learningItemChoices } from "@/features/learning-items/learning-item-seed";
import { externalResources } from "@/features/resources/resource-catalog";
import { skillPrerequisitesSeed, skillSeed } from "@/features/skills/skill-seed";

const skillIds = new Set(skillSeed.map((skill) => skill.id));
const prerequisiteEdges = new Set(
  skillPrerequisitesSeed.map((edge) => `${edge.skill_id}->${edge.prerequisite_skill_id}`)
);
const choicesByItem = new Map<string, number>();
for (const choice of learningItemChoices) {
  choicesByItem.set(choice.learning_item_id, (choicesByItem.get(choice.learning_item_id) ?? 0) + 1);
}

describe("C++ foundations depth coverage (#108)", () => {
  it("covers initialization pitfalls and function-organization skills explicitly", () => {
    for (const id of [
      "cpp.values_types.initialization_pitfalls",
      "cpp.functions.declarations_definitions",
      "cpp.functions.namespaces"
    ]) {
      expect(skillIds.has(id), `${id} skill`).toBe(true);
    }

    expect(prerequisiteEdges.has("cpp.values_types.initialization_pitfalls->cpp.values_types.conversions")).toBe(true);
    expect(prerequisiteEdges.has("cpp.functions.declarations_definitions->cpp.functions.decomposition")).toBe(true);
    expect(prerequisiteEdges.has("cpp.functions.namespaces->cpp.functions.declarations_definitions")).toBe(true);
  });

  it("ships original practice items for the remaining checklist gaps", () => {
    const requiredItems = [
      "cpp.values_types.initialization_pitfalls.lesson",
      "cpp.values_types.initialization_pitfalls.bug_uninitialized",
      "cpp.functions.declarations_definitions.lesson",
      "cpp.functions.declarations_definitions.code_link_error",
      "cpp.functions.namespaces.lesson",
      "cpp.functions.namespaces.mc_header_using"
    ];

    for (const id of requiredItems) {
      expect(getLearningItemById(id), `${id} item`).not.toBeNull();
    }
    expect(choicesByItem.get("cpp.functions.namespaces.mc_header_using")).toBe(4);
  });

  it("attaches focused beginner C++ resource links for the new topics", () => {
    for (const id of ["learncpp-initialization", "learncpp-forward-declarations", "learncpp-namespaces"]) {
      expect(externalResources.some((resource) => resource.id === id), `${id} resource`).toBe(true);
    }
  });
});
