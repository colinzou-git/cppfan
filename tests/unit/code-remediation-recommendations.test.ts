import { describe, expect, it } from "vitest";
import { mergeCodeRemediationIntoDailyPlan } from "@/features/recommendations/code-remediation-recommendations";
import type { Recommendation } from "@/features/recommendations/recommendation-types";
import type { CodeRemediationRecommendation } from "@/features/code-lab/error-remediation-types";

const due: Recommendation = { kind: "due_reviews", title: "Reviews", reason: "due", href: "/review" };
const explore: Recommendation = { kind: "explore", title: "Explore", reason: "x", href: "/" };

const code: CodeRemediationRecommendation = {
  id: "i:cpp.loop.off_by_one",
  itemId: "i",
  primaryTag: "cpp.loop.off_by_one",
  relatedSkillIds: [],
  action: "use_boundary_checklist",
  title: "Practice loop boundaries",
  reason: "boundary fails",
  priority: "high",
  checklistId: "io_basics"
};

describe("mergeCodeRemediationIntoDailyPlan", () => {
  it("inserts after due reviews so due reviews are not displaced", () => {
    const merged = mergeCodeRemediationIntoDailyPlan({
      existingRecommendations: [due, explore],
      codeRecommendation: code
    });
    expect(merged[0].kind).toBe("due_reviews");
    expect(merged[1].kind).toBe("remediation");
    expect(merged[1].title).toBe("Practice loop boundaries");
  });

  it("inserts at the front when there are no due reviews", () => {
    const merged = mergeCodeRemediationIntoDailyPlan({
      existingRecommendations: [explore],
      codeRecommendation: code
    });
    expect(merged[0].kind).toBe("remediation");
  });

  it("returns the original list when there is no code recommendation", () => {
    const existing = [due, explore];
    expect(mergeCodeRemediationIntoDailyPlan({ existingRecommendations: existing, codeRecommendation: null })).toBe(
      existing
    );
  });
});
