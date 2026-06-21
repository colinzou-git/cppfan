import { describe, expect, it } from "vitest";
import {
  findBoundaryChecklistItem,
  getBoundaryChecklistsForCodeLab,
  getBoundaryChecklistsForSkills,
  getSuggestedBoundaryChecklistForTags
} from "@/features/code-lab/boundary-checklist-service";
import { BOUNDARY_CHECKLISTS } from "@/features/code-lab/boundary-checklist-data";
import type { LearningItemCodeLab } from "@/features/code-lab/code-lab-types";

const baseConfig: LearningItemCodeLab = {
  enabled: true,
  language: "cpp",
  mode: "stdin",
  starterCode: "",
  visibleTests: []
};

describe("boundary checklist data", () => {
  it("defines at least 5 high-value checklists", () => {
    expect(BOUNDARY_CHECKLISTS.length).toBeGreaterThanOrEqual(5);
  });
});

describe("getBoundaryChecklistsForSkills", () => {
  it("maps skill ids to expected checklists", () => {
    const ids = getBoundaryChecklistsForSkills(["dsa.searching.binary_search_on_array"]).map((c) => c.id);
    expect(ids).toContain("binary_search");
  });

  it("returns empty for unknown skills", () => {
    expect(getBoundaryChecklistsForSkills(["not.a.skill"])).toEqual([]);
    expect(getBoundaryChecklistsForSkills([])).toEqual([]);
  });
});

describe("getBoundaryChecklistsForCodeLab", () => {
  it("supplements skill-mapped checklists with explicit ids, de-duplicated", () => {
    const ids = getBoundaryChecklistsForCodeLab({
      ...baseConfig,
      skillTags: ["cpp.program_basics.io"],
      boundaryChecklistIds: ["binary_search"]
    }).map((c) => c.id);
    expect(ids).toContain("io_basics");
    expect(ids).toContain("binary_search");
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("returns nothing when checklists are disabled", () => {
    expect(
      getBoundaryChecklistsForCodeLab({
        ...baseConfig,
        skillTags: ["cpp.program_basics.io"],
        boundaryChecklistsEnabled: false
      })
    ).toEqual([]);
  });
});

describe("getSuggestedBoundaryChecklistForTags", () => {
  it("finds a checklist whose items relate to an error tag", () => {
    const checklist = getSuggestedBoundaryChecklistForTags(["dsa.binary_search.boundary_update"]);
    expect(checklist?.id).toBe("binary_search");
  });

  it("returns null for no tags", () => {
    expect(getSuggestedBoundaryChecklistForTags([])).toBeNull();
  });
});

describe("findBoundaryChecklistItem", () => {
  it("finds a known item and returns null for unknown", () => {
    expect(findBoundaryChecklistItem("binary_search", "shrink")?.label).toMatch(/shrink/i);
    expect(findBoundaryChecklistItem("binary_search", "nope")).toBeNull();
    expect(findBoundaryChecklistItem("nope", "shrink")).toBeNull();
  });
});
