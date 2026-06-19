import { describe, expect, it } from "vitest";
import {
  normalizeGoalHistoryPageSize,
  parseGoalHistoryCursor
} from "@/features/goals/goal-history-queries";

describe("paginated study-goal history", () => {
  it("clamps page sizes to a bounded 1-50 range", () => {
    expect(normalizeGoalHistoryPageSize(0)).toBe(20);
    expect(normalizeGoalHistoryPageSize(12.9)).toBe(12);
    expect(normalizeGoalHistoryPageSize(500)).toBe(50);
  });

  it("accepts stable non-negative offset cursors and rejects malformed cursors", () => {
    expect(parseGoalHistoryCursor("40")).toBe(40);
    expect(parseGoalHistoryCursor("-1")).toBe(0);
    expect(parseGoalHistoryCursor("not-a-cursor")).toBe(0);
    expect(parseGoalHistoryCursor()).toBe(0);
  });
});
