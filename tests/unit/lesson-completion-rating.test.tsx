import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LessonCompletionRating } from "@/features/learning-items/lesson-completion-rating";

const rateLessonCompletion = vi.fn();

vi.mock("@/features/learning-items/lesson-rating-actions", () => ({
  rateLessonCompletion: (...args: unknown[]) => rateLessonCompletion(...args)
}));

describe("LessonCompletionRating", () => {
  beforeEach(() => {
    rateLessonCompletion.mockReset();
  });

  it("offers exactly Hard, Good, and Mastered for an unrated lesson", () => {
    render(<LessonCompletionRating itemId="lesson-1" initialState={{ state: "unrated" }} />);

    const choices = screen.getByTestId("lesson-rating-choices");
    expect(choices.getElementsByTagName("button")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Hard" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Good" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Mastered" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Again" })).toBeNull();
  });

  it("shows the committed due date and removes early rating controls", async () => {
    rateLessonCompletion.mockResolvedValue({
      status: "ok",
      cardId: "card-1",
      fsrsRating: "good",
      dueAt: "2026-08-22T12:00:00.000Z"
    });
    render(<LessonCompletionRating itemId="lesson-1" initialState={{ state: "unrated" }} />);

    fireEvent.click(screen.getByRole("button", { name: "Good" }));

    expect(await screen.findByTestId("lesson-rating-scheduled")).toHaveTextContent(
      /lesson completed/i
    );
    expect(screen.queryByTestId("lesson-rating-choices")).toBeNull();
  });

  it("keeps the chosen rating and submission id stable for a failed retry", async () => {
    rateLessonCompletion.mockResolvedValueOnce({ status: "error" }).mockResolvedValueOnce({
      status: "ok",
      cardId: "card-1",
      fsrsRating: "hard",
      dueAt: "2026-08-20T12:00:00.000Z"
    });
    render(<LessonCompletionRating itemId="lesson-1" initialState={{ state: "unrated" }} />);

    const retry = screen.getByTestId("lesson-rate-hard");
    await waitFor(() => expect(retry).not.toBeDisabled());
    fireEvent.click(retry);
    expect(await screen.findByTestId("lesson-rating-error")).toBeVisible();
    const first = rateLessonCompletion.mock.calls[0][0];

    await waitFor(() => expect(retry).not.toBeDisabled());
    fireEvent.click(retry);
    await waitFor(() => expect(rateLessonCompletion).toHaveBeenCalledTimes(2));
    expect(rateLessonCompletion.mock.calls[1][0]).toEqual(first);
  });

  it("does not render early rating controls for an already scheduled lesson", () => {
    render(
      <LessonCompletionRating
        itemId="lesson-1"
        initialState={{
          state: "scheduled",
          cardId: "card-1",
          dueAt: "2026-08-22T12:00:00.000Z",
          reps: 1
        }}
      />
    );

    expect(screen.getByTestId("lesson-rating-scheduled")).toBeVisible();
    expect(screen.queryByTestId("lesson-rating-choices")).toBeNull();
  });
});
