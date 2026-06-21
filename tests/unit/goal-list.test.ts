import { describe, expect, it } from "vitest";
import { remainingGoalDays } from "@/features/goals/goal-date";

describe("remainingGoalDays", () => {
  it("counts the learner local end date inclusively until local midnight", () => {
    const lateEndDateInLosAngeles = new Date("2026-06-21T06:30:00.000Z");

    expect(remainingGoalDays({
      endLocalDate: "2026-06-20",
      timezone: "America/Los_Angeles"
    }, lateEndDateInLosAngeles)).toBe(1);
  });

  it("returns zero after the learner local end date has passed", () => {
    const afterEndDateInLosAngeles = new Date("2026-06-21T07:30:00.000Z");

    expect(remainingGoalDays({
      endLocalDate: "2026-06-20",
      timezone: "America/Los_Angeles"
    }, afterEndDateInLosAngeles)).toBe(0);
  });
});
