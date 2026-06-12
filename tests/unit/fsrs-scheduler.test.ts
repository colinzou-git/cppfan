import { describe, expect, it } from "vitest";
import { applyRating, createInitialSchedule, REVIEW_RATINGS } from "@/lib/fsrs/scheduler";

const NOW = new Date("2026-06-13T09:00:00.000Z");

describe("createInitialSchedule", () => {
  it("returns a brand-new, due-now card", () => {
    const schedule = createInitialSchedule(NOW);
    expect(schedule.state).toBe("new");
    expect(schedule.reps).toBe(0);
    expect(schedule.lapses).toBe(0);
    expect(schedule.last_reviewed_at).toBeNull();
    expect(new Date(schedule.due_at).getTime()).toBe(NOW.getTime());
  });
});

describe("applyRating", () => {
  it("advances reps and schedules the next due date into the future", () => {
    const initial = createInitialSchedule(NOW);
    const { schedule, log } = applyRating(initial, "good", NOW);

    expect(schedule.reps).toBe(1);
    expect(new Date(schedule.due_at).getTime()).toBeGreaterThan(NOW.getTime());
    expect(schedule.last_reviewed_at).toBe(NOW.toISOString());
    expect(log.rating).toBe("good");
    expect(log.reviewed_at).toBe(NOW.toISOString());
  });

  it("schedules 'easy' at least as far out as 'good' for a new card", () => {
    const initial = createInitialSchedule(NOW);
    const good = applyRating(initial, "good", NOW).schedule;
    const easy = applyRating(initial, "easy", NOW).schedule;

    expect(new Date(easy.due_at).getTime()).toBeGreaterThanOrEqual(new Date(good.due_at).getTime());
  });

  it("counts a lapse when a review-state card is rated 'again'", () => {
    const initial = createInitialSchedule(NOW);
    // 'easy' promotes a new card to the review state.
    const reviewing = applyRating(initial, "easy", NOW).schedule;
    expect(reviewing.state).toBe("review");

    const later = new Date(reviewing.due_at);
    const lapsed = applyRating(reviewing, "again", later).schedule;

    expect(lapsed.lapses).toBe(1);
  });

  it("accepts every supported rating", () => {
    const initial = createInitialSchedule(NOW);
    for (const rating of REVIEW_RATINGS) {
      const { schedule } = applyRating(initial, rating, NOW);
      expect(schedule.reps).toBe(1);
    }
  });
});
