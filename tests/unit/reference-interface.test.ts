import { describe, expect, it } from "vitest";
import { getLearningItemById, learningItemChoices } from "@/features/learning-items/learning-item-seed";
import { externalResources } from "@/features/resources/resource-catalog";
import { skillPrerequisitesSeed, skillSeed } from "@/features/skills/skill-seed";

const skillIds = new Set(skillSeed.map((skill) => skill.id));
const prerequisiteEdges = new Set(
  skillPrerequisitesSeed.map((edge) => `${edge.skill_id}->${edge.prerequisite_skill_id}`)
);

function choicesFor(itemId: string) {
  return learningItemChoices.filter((choice) => choice.learning_item_id === itemId);
}

describe("reference and interface design coverage (#109)", () => {
  it("adds explicit function-interface design skills without duplicating existing reference slices", () => {
    expect(skillIds.has("cpp.references.interface_intent")).toBe(true);
    expect(skillIds.has("cpp.references.optional_overloads")).toBe(true);
    expect(skillIds.has("cpp.references.views")).toBe(true);

    expect(prerequisiteEdges.has("cpp.references.interface_intent->cpp.references.parameter_passing")).toBe(true);
    expect(prerequisiteEdges.has("cpp.references.interface_intent->cpp.references.views")).toBe(true);
    expect(prerequisiteEdges.has("cpp.references.optional_overloads->cpp.references.interface_intent")).toBe(true);
  });

  it("links ownership topics back to reference/interface prerequisites", () => {
    expect(prerequisiteEdges.has("cpp.raii.ownership_boundary->cpp.references.non_owning")).toBe(true);
    expect(prerequisiteEdges.has("cpp.smart_pointers.ownership_choice->cpp.references.interface_intent")).toBe(true);
  });

  it("ships API-choice practice for parameter intent and optional absence", () => {
    for (const id of [
      "cpp.references.interface_intent.lesson",
      "cpp.references.interface_intent.mc_result",
      "cpp.references.interface_intent.bug_ownership",
      "cpp.references.optional_overloads.lesson",
      "cpp.references.optional_overloads.mc_find"
    ]) {
      expect(getLearningItemById(id), `${id} item`).not.toBeNull();
    }

    expect(choicesFor("cpp.references.interface_intent.mc_result").filter((choice) => choice.is_correct)).toHaveLength(1);
    expect(choicesFor("cpp.references.optional_overloads.mc_find").filter((choice) => choice.is_correct)).toHaveLength(1);
  });

  it("attaches exact references for optional, views, and interface contracts", () => {
    for (const id of [
      "cpp-core-guidelines-interfaces",
      "cppreference-optional",
      "cppreference-span",
      "cppreference-string-view"
    ]) {
      expect(externalResources.some((resource) => resource.id === id), `${id} resource`).toBe(true);
    }
  });
});
