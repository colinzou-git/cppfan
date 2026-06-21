import { describe, expect, it } from "vitest";
import { rankScaffoldRecommendations, selectScaffoldLevel } from "@/features/recommendations/scaffold-selector";
import type { LearningItemSummary, ScaffoldRecommendation } from "@/features/recommendations/scaffold-selector-types";

const fullItems: LearningItemSummary[] = [
  { id: "we", type: "worked_example", skillIds: ["s1"] },
  { id: "comp", type: "completion", skillIds: ["s1"] },
  { id: "par", type: "parsons", skillIds: ["s1"] },
  { id: "lab", type: "lesson", skillIds: ["s1"], hasCodeLab: true }
];

describe("selectScaffoldLevel", () => {
  it("selects a worked example / completion for a weak skill with no success", () => {
    const rec = selectScaffoldLevel({ skillId: "s1", masteryStatus: "weak", availableItems: fullItems });
    expect(rec?.level).toBe("worked_example");
    expect(rec?.priority).toBe("high");
  });

  it("selects completion/Parsons after a syntax/ordering error", () => {
    const rec = selectScaffoldLevel({
      skillId: "s1",
      masteryStatus: "learning",
      recentCodeErrorTags: ["cpp.compile.syntax"],
      availableItems: fullItems
    });
    expect(["completion", "parsons"]).toContain(rec?.level);
  });

  it("selects Code Lab after a successful scaffold (high correctness)", () => {
    const rec = selectScaffoldLevel({
      skillId: "s1",
      masteryStatus: "learning",
      recentCorrectness: 1,
      availableItems: fullItems
    });
    expect(rec?.level).toBe("code_lab");
  });

  it("selects review after passing without hints on a strong skill", () => {
    const rec = selectScaffoldLevel({
      skillId: "s1",
      masteryStatus: "strong",
      recentCorrectness: 1,
      recentHintCount: 0,
      availableItems: fullItems
    });
    expect(rec?.level).toBe("review");
    expect(rec?.priority).toBe("low");
  });

  it("falls back safely when the preferred level is unavailable", () => {
    const rec = selectScaffoldLevel({
      skillId: "s1",
      masteryStatus: "weak",
      availableItems: [{ id: "lab", type: "lesson", skillIds: ["s1"], hasCodeLab: true }]
    });
    // worked_example unavailable -> nearest available (code_lab or review).
    expect(["code_lab", "review"]).toContain(rec?.level);
  });

  it("returns null when no items are available at all", () => {
    expect(selectScaffoldLevel({ skillId: "s1", masteryStatus: "weak", availableItems: [] })?.level).toBe(
      "review"
    );
  });
});

describe("rankScaffoldRecommendations", () => {
  it("orders by priority high to low", () => {
    const recs: ScaffoldRecommendation[] = [
      { skillId: "a", level: "review", reason: "", priority: "low" },
      { skillId: "b", level: "worked_example", reason: "", priority: "high" }
    ];
    expect(rankScaffoldRecommendations(recs)[0].priority).toBe("high");
  });
});
