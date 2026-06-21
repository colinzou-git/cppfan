import { describe, expect, it } from "vitest";
import {
  findBestItemForScaffoldLevel,
  getAvailableScaffoldLevels,
  resolveAvailableLevel
} from "@/features/recommendations/scaffold-availability";
import type { LearningItemSummary } from "@/features/recommendations/scaffold-selector-types";

const items: LearningItemSummary[] = [
  { id: "we", type: "worked_example", skillIds: ["s1"] },
  { id: "comp", type: "completion", skillIds: ["s1"] },
  { id: "lab", type: "lesson", skillIds: ["s1"], hasCodeLab: true }
];

describe("getAvailableScaffoldLevels", () => {
  it("derives levels from item types and always includes review", () => {
    const levels = getAvailableScaffoldLevels(items);
    expect(levels).toContain("worked_example");
    expect(levels).toContain("completion");
    expect(levels).toContain("code_lab");
    expect(levels).toContain("review");
  });

  it("returns just review for an empty item list", () => {
    expect(getAvailableScaffoldLevels([])).toEqual(["review"]);
  });
});

describe("findBestItemForScaffoldLevel", () => {
  it("prefers an item matching the skill", () => {
    expect(findBestItemForScaffoldLevel({ level: "completion", skillId: "s1", items })?.id).toBe("comp");
    expect(findBestItemForScaffoldLevel({ level: "code_lab", skillId: "s1", items })?.id).toBe("lab");
    expect(findBestItemForScaffoldLevel({ level: "parsons", skillId: "s1", items })).toBeNull();
  });
});

describe("resolveAvailableLevel", () => {
  it("returns the preferred level when available", () => {
    expect(resolveAvailableLevel("completion", ["completion", "review"])).toBe("completion");
  });

  it("falls back to the nearest available level", () => {
    expect(resolveAvailableLevel("worked_example", ["code_lab", "review"])).toBe("code_lab");
    expect(resolveAvailableLevel("completion", ["review"])).toBe("review");
  });

  it("returns null when nothing is available", () => {
    expect(resolveAvailableLevel("completion", [])).toBeNull();
  });
});
