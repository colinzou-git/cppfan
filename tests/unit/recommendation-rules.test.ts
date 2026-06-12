import { describe, expect, it } from "vitest";
import { buildRecommendations } from "@/features/recommendations/recommendation-rules";
import type { RecommendationInput } from "@/features/recommendations/recommendation-types";

function input(overrides: Partial<RecommendationInput> = {}): RecommendationInput {
  return {
    dueReviewCount: 0,
    dailyReviewMinutes: null,
    regressedSkills: [],
    weakSkills: [],
    nextLesson: null,
    prerequisite: null,
    ...overrides
  };
}

const skill = (skillId: string, title: string, itemId: string | null = null) => ({ skillId, title, itemId });

describe("buildRecommendations ordering", () => {
  it("always offers exploration as the final fallback", () => {
    const recs = buildRecommendations(input());
    expect(recs).toHaveLength(1);
    expect(recs[0].kind).toBe("explore");
  });

  it("puts due reviews first when reviews are due", () => {
    const recs = buildRecommendations(
      input({ dueReviewCount: 3, weakSkills: [skill("s1", "Weak skill")], nextLesson: skill("s2", "Lesson") })
    );
    expect(recs[0].kind).toBe("due_reviews");
    expect(recs[0].title).toMatch(/3 due cards/);
  });

  it("orders regressed before weak before next lesson before prerequisite before explore", () => {
    const recs = buildRecommendations(
      input({
        dueReviewCount: 1,
        regressedSkills: [skill("r", "Regressed")],
        weakSkills: [skill("w", "Weak")],
        nextLesson: skill("n", "Next lesson", "item.n"),
        prerequisite: skill("p", "Prereq", "item.p")
      })
    );
    expect(recs.map((rec) => rec.kind)).toEqual([
      "due_reviews",
      "regressed_skill",
      "weak_skill",
      "next_lesson",
      "prerequisite",
      "explore"
    ]);
  });

  it("links skill recommendations to their learning item when available", () => {
    const recs = buildRecommendations(input({ weakSkills: [skill("w", "Weak", "item.w")] }));
    const weak = recs.find((rec) => rec.kind === "weak_skill");
    expect(weak?.href).toBe("/learn/item.w");
  });

  it("falls back to the dashboard when a skill has no learning item", () => {
    const recs = buildRecommendations(input({ regressedSkills: [skill("r", "Regressed", null)] }));
    const regressed = recs.find((rec) => rec.kind === "regressed_skill");
    expect(regressed?.href).toBe("/dashboard");
  });

  it("mentions the review-minutes goal when present", () => {
    const recs = buildRecommendations(input({ dueReviewCount: 2, dailyReviewMinutes: 15 }));
    expect(recs[0].reason).toMatch(/15 min/);
  });

  it("singularizes a single due review", () => {
    const recs = buildRecommendations(input({ dueReviewCount: 1 }));
    expect(recs[0].title).toBe("Review 1 due card");
  });
});
