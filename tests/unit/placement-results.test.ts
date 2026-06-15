import { describe, expect, it } from "vitest";
import { buildPlacementResults, moduleIdForItem } from "@/features/placement/placement-results";
import { getPlacementModules } from "@/features/placement/placement-seed";

// Placement results builder (#125). Maps graded per-item outcomes to per-module
// start_here / review_soon / probably_familiar suggestions (suggestion-only).

const modules = getPlacementModules();
const firstModule = modules[0];
const firstItem = firstModule.item_ids[0];

describe("buildPlacementResults (#125)", () => {
  it("covers every placement module, in display order", () => {
    const results = buildPlacementResults({});
    expect(results.map((r) => r.module_id)).toEqual(modules.map((m) => m.module_id));
  });

  it("defaults an unanswered module to start_here with zero total", () => {
    const results = buildPlacementResults({});
    for (const r of results) {
      expect(r.total).toBe(0);
      expect(r.level).toBe("start_here");
    }
  });

  it("marks a fully-correct single-item module probably_familiar", () => {
    const results = buildPlacementResults({ [firstItem]: true });
    const r = results.find((x) => x.module_id === firstModule.module_id)!;
    expect(r.correct).toBe(1);
    expect(r.total).toBe(1);
    expect(r.level).toBe("probably_familiar");
    expect(r.reason).toMatch(/probably familiar/i);
  });

  it("marks a wrong answer start_here", () => {
    const results = buildPlacementResults({ [firstItem]: false });
    const r = results.find((x) => x.module_id === firstModule.module_id)!;
    expect(r.correct).toBe(0);
    expect(r.total).toBe(1);
    expect(r.level).toBe("start_here");
  });
});

describe("moduleIdForItem (#125)", () => {
  it("resolves a placement item to its module, and unknown items to null", () => {
    expect(moduleIdForItem(firstItem)).toBe(firstModule.module_id);
    expect(moduleIdForItem("does.not.exist")).toBeNull();
  });
});
