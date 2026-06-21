import { describe, expect, it } from "vitest";
import {
  buildCodeRemediationRecommendation,
  getRepeatedErrorPattern,
  pickRemediationTargetItem
} from "@/features/code-lab/error-remediation-service";
import type { CodeTagClassification } from "@/features/code-lab/code-error-tags";
import type { LearningItemSummary } from "@/features/code-lab/error-remediation-types";

const det = (tag: CodeTagClassification["tag"], confidence: CodeTagClassification["confidence"]): CodeTagClassification => ({
  tag,
  source: "test",
  confidence,
  message: ""
});

describe("getRepeatedErrorPattern", () => {
  it("returns a deterministic medium/high tag seen at least twice", () => {
    const tag = getRepeatedErrorPattern({
      recentClassifications: [
        det("dsa.binary_search.boundary_update", "medium"),
        det("dsa.binary_search.boundary_update", "high")
      ],
      windowSize: 4
    });
    expect(tag).toBe("dsa.binary_search.boundary_update");
  });

  it("ignores low-confidence and single occurrences", () => {
    expect(
      getRepeatedErrorPattern({
        recentClassifications: [det("cpp.loop.off_by_one", "low"), det("cpp.loop.off_by_one", "low")],
        windowSize: 4
      })
    ).toBeNull();
  });
});

describe("buildCodeRemediationRecommendation", () => {
  it("creates a high-priority recommendation for a repeated deterministic tag", () => {
    const rec = buildCodeRemediationRecommendation({
      itemId: "item.1",
      skillIds: ["dsa.searching.binary_search_on_array"],
      classifications: [det("dsa.binary_search.boundary_update", "medium")],
      recentClassifications: [
        det("dsa.binary_search.boundary_update", "medium"),
        det("dsa.binary_search.boundary_update", "medium")
      ]
    });
    expect(rec?.priority).toBe("high");
    expect(rec?.action).toBe("use_boundary_checklist");
    expect(rec?.checklistId).toBe("binary_search");
  });

  it("creates a low-priority recommendation for an AI-only tag", () => {
    const rec = buildCodeRemediationRecommendation({
      itemId: "item.1",
      skillIds: [],
      classifications: [{ tag: "cpp.loop.off_by_one", source: "ai", confidence: "high", message: "" }]
    });
    expect(rec?.priority).toBe("low");
  });

  it("returns null for an unknown/unmapped tag", () => {
    const rec = buildCodeRemediationRecommendation({
      itemId: "item.1",
      skillIds: [],
      classifications: [det("cpp.references.copy_vs_alias", "high")]
    });
    expect(rec).toBeNull();
  });

  it("points to a completion target item when available", () => {
    const items: LearningItemSummary[] = [
      { id: "dp.completion", type: "completion", skillIds: ["dsa.dp.base_case"] }
    ];
    const rec = buildCodeRemediationRecommendation({
      itemId: "item.1",
      skillIds: ["dsa.dp.base_case"],
      classifications: [det("dsa.dp.bad_base_case", "high")],
      availableItems: items
    });
    expect(rec?.action).toBe("try_completion_item");
    expect(rec?.targetItemId).toBe("dp.completion");
  });
});

describe("pickRemediationTargetItem", () => {
  it("matches type and skill, else null", () => {
    const items: LearningItemSummary[] = [
      { id: "a", type: "completion", skillIds: ["s1"] },
      { id: "b", type: "parsons", skillIds: ["s2"] }
    ];
    expect(
      pickRemediationTargetItem({ tag: "dsa.dp.bad_base_case", skillIds: ["s1"], availableItems: items, wantedTypes: ["completion"] })?.id
    ).toBe("a");
    expect(
      pickRemediationTargetItem({ tag: "dsa.dp.bad_base_case", skillIds: ["s9"], availableItems: items, wantedTypes: ["completion"] })
    ).toBeNull();
  });
});
