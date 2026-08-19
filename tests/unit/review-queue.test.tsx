import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewQueue } from "@/features/review/review-queue";
import type { DueReviewEntry } from "@/features/review/review-types";

const rateReview = vi.fn();

// The review-queue imports the rateReview server action; replace it so the
// component test stays in jsdom without a server.
vi.mock("@/features/review/review-actions", () => ({
  rateReview: (...args: unknown[]) => rateReview(...args)
}));

function entry(overrides: Partial<DueReviewEntry> = {}): DueReviewEntry {
  return {
    cardId: "card-1",
    itemId: "item-1",
    skillId: "skill-1",
    title: "Default access",
    type: "multiple_choice",
    prompt: "What is the default access level in a struct?",
    explanation: "In a struct, members are public by default.",
    choices: [
      { id: "c1", learning_item_id: "item-1", content: "Public", order_index: 10 },
      { id: "c2", learning_item_id: "item-1", content: "Private", order_index: 20 }
    ],
    ...overrides
  };
}

describe("ReviewQueue reveal-then-rate flow", () => {
  beforeEach(() => {
    rateReview.mockReset();
    rateReview.mockResolvedValue({
      status: "ok",
      state: "review",
      dueAt: "2026-06-13T00:00:00.000Z"
    });
  });

  it("shows the prompt but hides ratings and explanation until revealed", () => {
    render(<ReviewQueue entries={[entry()]} />);

    expect(screen.getByTestId("review-prompt")).toHaveTextContent(/default access level/i);
    expect(screen.getByTestId("review-reveal")).toBeInTheDocument();
    expect(screen.queryByTestId("review-ratings")).toBeNull();
    expect(screen.queryByTestId("review-explanation")).toBeNull();
    expect(screen.queryByTestId("review-choices")).toBeNull();
  });

  it("reveals explanation and neutral choices, then rates and advances", async () => {
    render(<ReviewQueue entries={[entry()]} />);

    fireEvent.click(screen.getByTestId("review-reveal"));

    expect(screen.getByTestId("review-explanation")).toHaveTextContent(/public by default/i);
    const choices = screen.getByTestId("review-choices");
    expect(choices).toHaveTextContent("Public");
    expect(choices).toHaveTextContent("Private");
    expect(screen.getByTestId("review-ratings")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("review-rate-good"));

    await waitFor(() =>
      expect(rateReview).toHaveBeenCalledWith(
        expect.objectContaining({
          cardId: "card-1",
          rating: "good",
          submissionId: expect.any(String)
        })
      )
    );
    expect(await screen.findByTestId("review-empty")).toBeInTheDocument();
  });

  it("resets the reveal gate when advancing to the next card", async () => {
    render(
      <ReviewQueue entries={[entry({ cardId: "a" }), entry({ cardId: "b", title: "Card B" })]} />
    );

    fireEvent.click(screen.getByTestId("review-reveal"));
    expect(screen.getByTestId("review-ratings")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("review-rate-good"));

    await waitFor(() => expect(screen.getByText("Card B")).toBeInTheDocument());
    // The next card must start hidden again.
    expect(screen.queryByTestId("review-ratings")).toBeNull();
    expect(screen.getByTestId("review-reveal")).toBeInTheDocument();
  });

  it("never carries the answer key on choices", () => {
    for (const choice of entry().choices) {
      expect("is_correct" in choice).toBe(false);
    }
  });

  it("hides lesson content until reveal and presents Easy as Mastered", async () => {
    render(
      <ReviewQueue
        entries={[
          entry({
            type: "lesson",
            prompt: "Execution starts in main and returns an integer.",
            choices: []
          })
        ]}
      />
    );

    expect(screen.getByTestId("review-prompt")).toHaveTextContent(/explain its key idea/i);
    expect(screen.queryByText(/execution starts in main/i)).toBeNull();
    expect(screen.getByTestId("review-reveal")).toHaveTextContent("Reveal lesson");

    fireEvent.click(screen.getByTestId("review-reveal"));
    expect(screen.getByTestId("review-lesson-content")).toHaveTextContent(
      /execution starts in main/i
    );
    expect(screen.getByRole("button", { name: "Again" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Hard" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Good" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Mastered" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Easy" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Mastered" }));
    await waitFor(() =>
      expect(rateReview).toHaveBeenCalledWith(expect.objectContaining({ rating: "easy" }))
    );
  });

  it("reuses a failed rating submission id when the learner retries", async () => {
    rateReview
      .mockResolvedValueOnce({ status: "error" })
      .mockResolvedValueOnce({ status: "ok", state: "review", dueAt: "2026-06-13T00:00:00.000Z" });
    render(<ReviewQueue entries={[entry()]} />);
    fireEvent.click(screen.getByTestId("review-reveal"));
    fireEvent.click(screen.getByTestId("review-rate-hard"));
    expect(await screen.findByRole("alert")).toBeVisible();
    const first = rateReview.mock.calls[0][0];

    const retry = screen.getByTestId("review-rate-hard");
    await waitFor(() => expect(retry).not.toBeDisabled());
    fireEvent.click(retry);
    await waitFor(() => expect(rateReview).toHaveBeenCalledTimes(2));
    expect(rateReview.mock.calls[1][0]).toEqual(first);
  });
});
