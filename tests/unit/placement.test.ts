import { describe, expect, it } from "vitest";
import { learningItems } from "@/features/learning-items/learning-item-seed";
import {
  INITIAL_PLACEMENT_QUESTION_COUNT,
  MAX_PLACEMENT_QUESTION_COUNT,
  getPlacementItemIds,
  getPlacementModules,
  placementModules
} from "@/features/placement/placement-seed";
import { getPlacementAssessment } from "@/features/placement/placement-queries";
import { classifyPlacement, summarizeModule } from "@/features/placement/placement-scoring";

const itemIds = new Set(learningItems.map((item) => item.id));

describe("placement definitions integrity (#125)", () => {
  it("has unique module ids and order indexes", () => {
    const ids = placementModules.map((m) => m.module_id);
    expect(new Set(ids).size).toBe(ids.length);
    const orders = placementModules.map((m) => m.order_index);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("reuses only existing, gradeable learning items (never duplicates content)", () => {
    for (const module of placementModules) {
      expect(module.item_ids.length).toBeGreaterThan(0);
      for (const id of module.item_ids) {
        expect(itemIds.has(id), `placement references missing item ${id}`).toBe(true);
      }
    }
  });

  it("spans the breadth required by ADR 0005 (C++ basics through intro DSA)", () => {
    const modules = placementModules.map((m) => m.module_id);
    expect(modules).toEqual(expect.arrayContaining(["cpp.references", "cpp.stl", "dsa.complexity"]));
    expect(modules.length).toBeGreaterThanOrEqual(5);
  });

  it("getPlacementItemIds returns each item once, in display order", () => {
    const ids = getPlacementItemIds();
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids[0]).toBe(getPlacementModules()[0].item_ids[0]);
  });

  it("offers an extended placement check after the first 7 questions, capped at 60", () => {
    const questions = getPlacementAssessment();
    expect(questions.length).toBeGreaterThan(INITIAL_PLACEMENT_QUESTION_COUNT);
    expect(questions.length).toBeLessThanOrEqual(MAX_PLACEMENT_QUESTION_COUNT);
    expect(questions.slice(0, INITIAL_PLACEMENT_QUESTION_COUNT).map((q) => q.moduleId)).toEqual(
      getPlacementModules().map((module) => module.module_id)
    );
  });
});

describe("placement scoring is deterministic and suggestion-only (#125)", () => {
  it("classifies by familiarity ratio", () => {
    expect(classifyPlacement(1, 1)).toBe("probably_familiar");
    expect(classifyPlacement(4, 5)).toBe("probably_familiar");
    expect(classifyPlacement(2, 4)).toBe("review_soon");
    expect(classifyPlacement(1, 4)).toBe("start_here");
    expect(classifyPlacement(0, 1)).toBe("start_here");
  });

  it("treats no evidence as a safe start_here default", () => {
    expect(classifyPlacement(0, 0)).toBe("start_here");
  });

  it("produces a transparent reason for each module result", () => {
    const result = summarizeModule({ module_id: "cpp.stl", title: "The standard library" }, 1, 1);
    expect(result.level).toBe("probably_familiar");
    expect(result.reason).toMatch(/standard library/i);
    expect(result.reason).toMatch(/1 of 1/);
  });
});
