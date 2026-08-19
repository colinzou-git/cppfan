import { describe, expect, it } from "vitest";
import {
  classifyLessonRatingRpc,
  lessonChoiceToFsrsRating
} from "@/features/learning-items/lesson-rating-types";

describe("lesson completion rating contract", () => {
  it("maps Mastered to FSRS easy while preserving Hard and Good", () => {
    expect(lessonChoiceToFsrsRating("hard")).toBe("hard");
    expect(lessonChoiceToFsrsRating("good")).toBe("good");
    expect(lessonChoiceToFsrsRating("mastered")).toBe("easy");
  });

  it("classifies committed, replayed, and existing-card results", () => {
    const row = {
      card_id: "card-1",
      due_at: "2026-08-22T12:00:00.000Z",
      fsrs_rating: "easy"
    };
    expect(classifyLessonRatingRpc({ data: [{ ...row, status: "ok" }], error: null })).toEqual({
      status: "ok",
      cardId: "card-1",
      dueAt: row.due_at,
      fsrsRating: "easy"
    });
    expect(
      classifyLessonRatingRpc({ data: [{ ...row, status: "already_processed" }], error: null })
        .status
    ).toBe("already_processed");
    expect(
      classifyLessonRatingRpc({
        data: [{ status: "already_scheduled", card_id: "card-1", due_at: row.due_at }],
        error: null
      }).status
    ).toBe("already_scheduled");
  });

  it("distinguishes a pre-migration database from a configured failure", () => {
    expect(classifyLessonRatingRpc({ data: null, error: { code: "PGRST202" } })).toEqual({
      status: "unavailable"
    });
    expect(classifyLessonRatingRpc({ data: null, error: { code: "42501" } })).toEqual({
      status: "error"
    });
  });
});
