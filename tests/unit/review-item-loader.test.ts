import { describe, expect, it } from "vitest";
import { buildReviewItemContent } from "@/features/review/review-item-loader";
import type {
  LearningItem,
  PublicLearningItemChoice
} from "@/features/learning-items/learning-item-types";

describe("database-first review content adapter", () => {
  it("hydrates a database-only owner-projected lesson without the bundled seed", () => {
    const item: LearningItem = {
      id: "user.item.11111111-1111-1111-1111-111111111111",
      type: "lesson",
      title: "My projected lesson",
      prompt: "Database-only lesson body",
      explanation: "Database-only explanation",
      difficulty: "beginner",
      estimated_minutes: 4,
      order_index: 0,
      is_active: true
    };
    const choices: PublicLearningItemChoice[] = [];

    const loaded = buildReviewItemContent([item], choices);

    expect(loaded.get(item.id)).toEqual({ item, choices: [] });
  });
});
