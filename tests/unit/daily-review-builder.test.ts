import { describe, expect, it } from "vitest";
import { buildDailyReviewItems, type DailyReviewCardRow } from "@/features/review/daily-review-builder";
import type { LearningItemWithDetails } from "@/features/learning-items/learning-item-types";

const lookup = (itemId: string): LearningItemWithDetails | null => {
  if (itemId === "missing") return null;
  return {
      item: {
        id: itemId,
        title: `Title ${itemId}`,
        type: "multiple_choice",
        prompt: "",
        explanation: null,
        difficulty: "beginner",
        estimated_minutes: 2,
        order_index: 1,
        is_active: true
      },
      choices: [],
      skills: [{ learning_item_id: itemId, skill_id: `skill-${itemId}`, is_primary: true }]
    };
};

function row(id: string, dueAt: string, itemId = id): DailyReviewCardRow {
  return {
    id,
    learning_item_id: itemId,
    skill_id: `skill-${itemId}`,
    due_at: dueAt
  };
}

describe("buildDailyReviewItems", () => {
  it("keeps only cards due before the learner local-day boundary", () => {
    const now = new Date("2026-03-08T12:00:00.000Z");
    const items = buildDailyReviewItems([
      row("due", "2026-03-09T06:59:59.000Z"),
      row("future", "2026-03-09T07:00:00.000Z")
    ], "America/Los_Angeles", now, lookup);

    expect(items.map((item) => item.cardId)).toEqual(["due"]);
    expect(items[0].localPlanDate).toBe("2026-03-08");
    expect(items[0].timezone).toBe("America/Los_Angeles");
  });

  it("orders overdue and due cards by due time, then stable id", () => {
    const now = new Date("2026-06-19T12:00:00.000Z");
    const items = buildDailyReviewItems([
      row("b", "2026-06-19T10:00:00.000Z"),
      row("a", "2026-06-19T10:00:00.000Z"),
      row("old", "2026-06-18T10:00:00.000Z")
    ], "UTC", now, lookup);

    expect(items.map((item) => item.cardId)).toEqual(["old", "a", "b"]);
    expect(items[0]).toMatchObject({ overdue: true, reason: "Overdue FSRS review" });
    expect(items[2]).toMatchObject({ overdue: true });
  });

  it("skips cards whose learning item is no longer available", () => {
    const now = new Date("2026-06-19T12:00:00.000Z");
    const items = buildDailyReviewItems([
      row("known", "2026-06-19T20:00:00.000Z"),
      row("gone", "2026-06-19T20:00:00.000Z", "missing")
    ], "UTC", now, lookup);

    expect(items.map((item) => item.cardId)).toEqual(["known"]);
  });
});
