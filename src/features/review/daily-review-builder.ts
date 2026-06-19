import { getLearningItemById } from "@/features/learning-items/learning-item-seed";
import { localDateKey, nextLocalMidnight } from "@/lib/time/local-day";
import type { DailyReviewItem } from "./daily-review-model";

export type DailyReviewCardRow = {
  id: string;
  learning_item_id: string;
  skill_id: string;
  due_at: string;
};

export function buildDailyReviewItems(
  rows: DailyReviewCardRow[],
  timezone: string,
  now: Date,
  lookupItem = getLearningItemById
): DailyReviewItem[] {
  const endOfLocalDay = nextLocalMidnight(now, timezone).getTime();
  const localPlanDate = localDateKey(now, timezone);

  return rows
    .filter((row) => new Date(row.due_at).getTime() < endOfLocalDay)
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime() || a.id.localeCompare(b.id))
    .flatMap((row) => {
      const details = lookupItem(row.learning_item_id);
      if (!details) return [];
      const dueAt = String(row.due_at);
      const overdue = new Date(dueAt).getTime() < now.getTime();
      return [{
        cardId: String(row.id),
        itemId: String(row.learning_item_id),
        skillId: String(row.skill_id),
        title: details.item.title,
        href: `/review?card=${encodeURIComponent(String(row.id))}`,
        dueAt,
        overdue,
        reason: overdue ? "Overdue FSRS review" : "Due today by FSRS",
        localPlanDate,
        timezone
      }];
    });
}
