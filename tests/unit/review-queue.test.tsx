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
    rateReview.mockResolvedValue({ status: "ok", state: "review", dueAt: "2026-06-13T00:00:00.000Z" });
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

    await waitFor(() => expect(rateReview).toHaveBeenCalledWith({ cardId: "card-1", rating: "good" }));
    expect(await screen.findByTestId("review-empty")).toBeInTheDocument();
  });

  it("resets the reveal gate when advancing to the next card", async () => {
    render(<ReviewQueue entries={[entry({ cardId: "a" }), entry({ cardId: "b", title: "Card B" })]} />);

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
});
