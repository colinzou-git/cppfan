import { describe, expect, it } from "vitest";
import { getLessonResourceIds } from "@/features/resources/lesson-resource-links";
import { getResourceById } from "@/features/resources/resource-catalog";
import { learningItemSkills } from "@/features/learning-items/learning-item-seed";

describe("lesson further-reading resolver (#448)", () => {
  it("uses the exact item override for the graph representation lesson", () => {
    const ids = getLessonResourceIds("dsa.graphs.representation.lesson", ["dsa.graphs.representation"]);
    expect(ids).toContain("usaco-guide-graph-traversal");
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.length).toBeLessThanOrEqual(3);
  });

  it("maps a C++ variables lesson to LearnCpp / cppreference via prefix fallback", () => {
    const ids = getLessonResourceIds("cpp.values_types.variables.lesson", ["cpp.values_types.variables"]);
    expect(ids).toContain("learncpp-initialization");
  });

  it("maps dsa.techniques.* to technique resources before the generic DSA fallback", () => {
    const ids = getLessonResourceIds("dsa.techniques.prefix_sums.lesson", ["dsa.techniques.prefix_sums"]);
    expect(ids).toContain("usaco-guide-prefix-sums");
    expect(ids).not.toEqual(["usaco-guide", "cp-algorithms", "cses"]);
  });

  it("falls back to the C++ domain for an unmapped cpp.* skill", () => {
    const ids = getLessonResourceIds("cpp.unknown.thing.lesson", ["cpp.unknown.thing"]);
    expect(ids).toEqual(["learncpp", "cppreference"]);
  });

  it("falls back to the DSA domain for an unmapped dsa.* skill", () => {
    const ids = getLessonResourceIds("dsa.unknown.thing.lesson", ["dsa.unknown.thing"]);
    expect(ids).toEqual(["usaco-guide", "cp-algorithms", "cses"]);
  });

  it("returns nothing for a skill outside the known domains", () => {
    expect(getLessonResourceIds("misc.unknown.lesson", ["misc.unknown"])).toEqual([]);
  });

  it("every seeded cpp.* / dsa.* lesson resolves at least one valid resource", () => {
    const lessonSkills = new Map<string, string[]>();
    for (const mapping of learningItemSkills) {
      if (!mapping.learning_item_id.endsWith(".lesson")) continue;
      if (!/^(cpp|dsa)\./.test(mapping.skill_id)) continue;
      const list = lessonSkills.get(mapping.learning_item_id) ?? [];
      list.push(mapping.skill_id);
      lessonSkills.set(mapping.learning_item_id, list);
    }
    expect(lessonSkills.size).toBeGreaterThan(0);
    for (const [itemId, skillIds] of lessonSkills) {
      const ids = getLessonResourceIds(itemId, skillIds);
      expect(ids.length, `${itemId} has no resources`).toBeGreaterThan(0);
      for (const id of ids) {
        expect(getResourceById(id), `${itemId} -> ${id}`).not.toBeNull();
      }
    }
  });

  it("caps at 3 resources and every returned id resolves in the catalog", () => {
    const samples = [
      ["dsa.graphs.representation.lesson", ["dsa.graphs.representation"]],
      ["cpp.stl.vector.lesson", ["cpp.stl.vector"]],
      ["dsa.dp.knapsack.lesson", ["dsa.dp.knapsack"]]
    ] as const;
    for (const [itemId, skills] of samples) {
      const ids = getLessonResourceIds(itemId, [...skills]);
      expect(ids.length).toBeLessThanOrEqual(3);
      for (const id of ids) {
        expect(getResourceById(id), `${itemId} -> ${id}`).not.toBeNull();
      }
    }
  });
});
