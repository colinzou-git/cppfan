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
  "dsa.trees.linked_list",
  "dsa.trees.list_vs_vector",
  "dsa.trees.tree_terminology",
  "dsa.trees.traversal",
  "dsa.trees.bst_search",
  "dsa.trees.heap",
  "dsa.trees.heap_applications",
  "dsa.trees.disjoint_set",
  "dsa.trees.dsu_internals",
  "dsa.trees.traversal_techniques",
  "dsa.trees.traversal_reconstruction",
  "dsa.trees.tree_diameter"
];

const REQUIRED_ITEMS = [
  "dsa.trees.linked_list.mc_access",
  "dsa.trees.list_vs_vector.mc_default",
  "dsa.trees.traversal_techniques.code_level_trace",
  "dsa.trees.traversal_reconstruction.code_pre_in_trace",
  "dsa.trees.tree_diameter.code_trace",
  "dsa.trees.heap_applications.mc_choose_structure",
  "dsa.trees.dsu_internals.code_union_trace"
];

const REQUIRED_RESOURCE_IDS = [
  "cppreference-vector",
  "cppreference-list",
  "cppreference-priority-queue",
  "cp-algorithms-disjoint-set-union"
];

describe("trees/heaps/DSU completion coverage (#114)", () => {
  it("keeps the original #74 checklist represented as active skills and items", () => {
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

  it("includes accessible text equivalents for tree and DSU traces", () => {
    const levelOrder = learningItems.find((item) => item.id === "dsa.trees.traversal_techniques.code_level_trace");
    const reconstruction = learningItems.find(
      (item) => item.id === "dsa.trees.traversal_reconstruction.code_pre_in_trace"
    );
    const diameter = learningItems.find((item) => item.id === "dsa.trees.tree_diameter.code_trace");
    const dsu = learningItems.find((item) => item.id === "dsa.trees.dsu_internals.code_union_trace");

    expect(levelOrder?.prompt).toMatch(/Text equivalent: A is the root/i);
    expect(levelOrder?.explanation).toMatch(/A B C D E F/);
    expect(reconstruction?.explanation).toMatch(/Text equivalent: A is root/i);
    expect(diameter?.prompt).toMatch(/Text equivalent: 1 is root/i);
    expect(diameter?.explanation).toMatch(/best diameter is 3/i);
    expect(dsu?.prompt).toMatch(/Text equivalent: 4 points to 3/i);
    expect(dsu?.explanation).toMatch(/parent\[4\].*parent\[3\].*parent\[2\].*parent\[1\].*0/i);
  });

  it("keeps the heap selection item gradeable with exactly one correct answer", () => {
    const choices = learningItemChoices.filter(
      (choice) => choice.learning_item_id === "dsa.trees.heap_applications.mc_choose_structure"
    );

    expect(choices).toHaveLength(4);
    expect(choices.filter((choice) => choice.is_correct).map((choice) => choice.id)).toEqual([
      "dsa.trees.heap_applications.mc_choose_structure.a"
    ]);
  });

  it("registers exact resources and a compiled path-compression example", () => {
    const resourceIds = new Set(
      externalResources.filter((resource) => resource.tags.includes("dsa")).map((resource) => resource.id)
    );

    for (const id of REQUIRED_RESOURCE_IDS) {
      expect(resourceIds.has(id), `${id} should be registered`).toBe(true);
    }

    expect(existsSync(join(process.cwd(), "curriculum-examples", "dsu-path-compression-trace", "example.cpp"))).toBe(
      true
    );
  });
});
