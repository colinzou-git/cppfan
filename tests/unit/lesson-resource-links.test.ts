import { describe, expect, it } from "vitest";
import { getLessonResourceIds } from "@/features/resources/lesson-resource-links";
import { getResourceById } from "@/features/resources/resource-catalog";

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
