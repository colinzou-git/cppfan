import { localDateKey } from "@/lib/time/local-day";
import { inclusiveGoalDurationDays } from "./goal-contract";
import type { StudyGoalView } from "./goal-view-types";

export function remainingGoalDays(
  goal: Pick<StudyGoalView, "endLocalDate" | "timezone">,
  now: Date = new Date()
): number {
  let today: string;
  try {
    today = localDateKey(now, goal.timezone);
  } catch {
    today = localDateKey(now, "UTC");
  }
  return Math.max(0, inclusiveGoalDurationDays(today, goal.endLocalDate) ?? 0);
}
