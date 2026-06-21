import { describe, expect, it } from "vitest";
import { toPredictionSkillEvents } from "@/features/code-lab/prediction-evidence";
import type { CodePredictionComparison } from "@/features/code-lab/prediction-types";

const comparisons: CodePredictionComparison[] = [
  { promptId: "stdout", status: "matched", explanation: "" },
  { promptId: "failing_test", status: "mismatched", explanation: "" },
  { promptId: "loop_invariant", status: "not_comparable", explanation: "" }
];

describe("toPredictionSkillEvents", () => {
  it("emits submitted + matched/mismatched drafts per skill", () => {
    const drafts = toPredictionSkillEvents({
      itemId: "item.1",
      skillIds: ["cpp.loops"],
      comparisons
    });
    const kinds = drafts.map((d) => d.eventType);
    expect(kinds).toContain("code_prediction_submitted");
    expect(kinds).toContain("code_prediction_matched");
    expect(kinds).toContain("code_prediction_mismatched");
    // not_comparable yields only a submitted draft (no matched/mismatched).
    expect(drafts.filter((d) => d.promptId === "loop_invariant")).toHaveLength(1);
    expect(drafts.every((d) => d.skillId === "cpp.loops")).toBe(true);
  });

  it("still emits drafts when an item has no skills", () => {
    const drafts = toPredictionSkillEvents({ itemId: "x", skillIds: [], comparisons: [comparisons[0]] });
    expect(drafts.length).toBeGreaterThan(0);
  });
});
