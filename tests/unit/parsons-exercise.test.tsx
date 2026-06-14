import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ParsonsExercise } from "@/features/learning-items/parsons-exercise";
import type { PublicParsonsBlock } from "@/features/learning-items/learning-item-types";

const submitParsons = vi.fn();

vi.mock("@/features/learning-items/parsons-actions", () => ({
  submitParsons: (...args: unknown[]) => submitParsons(...args)
}));

function blocks(): PublicParsonsBlock[] {
  return [
    { id: "b1", learning_item_id: "item", content: "int sum = 0;" },
    { id: "b2", learning_item_id: "item", content: "sum += i;" },
    { id: "d1", learning_item_id: "item", content: "sum -= i;" }
  ];
}

describe("ParsonsExercise (#124)", () => {
  beforeEach(() => {
    submitParsons.mockReset();
    submitParsons.mockResolvedValue({ status: "graded", isCorrect: true, correctCount: 2, total: 2 });
  });

  it("renders every block and keeps drag from being the only input (move buttons exist)", () => {
    render(<ParsonsExercise itemId="item" blocks={blocks()} />);
    expect(screen.getAllByTestId("parsons-block")).toHaveLength(3);
    expect(screen.getAllByTestId("parsons-move-up").length).toBe(3);
    expect(screen.getAllByTestId("parsons-move-down").length).toBe(3);
  });

  it("submits included block ids in their current order, excluding toggled-off lines", async () => {
    render(<ParsonsExercise itemId="item" blocks={blocks()} />);

    // Exclude the distractor (third row).
    fireEvent.click(screen.getAllByTestId("parsons-toggle-include")[2]);
    fireEvent.click(screen.getByTestId("parsons-check"));

    await waitFor(() =>
      expect(submitParsons).toHaveBeenCalledWith({ itemId: "item", blockIds: ["b1", "b2"] })
    );
    expect(await screen.findByTestId("parsons-feedback")).toHaveTextContent(/correct/i);
  });

  it("reorders with move-down before submitting", async () => {
    render(<ParsonsExercise itemId="item" blocks={blocks()} />);

    // Move the first line down, then exclude the distractor.
    fireEvent.click(screen.getAllByTestId("parsons-move-down")[0]);
    fireEvent.click(screen.getAllByTestId("parsons-toggle-include")[2]);
    fireEvent.click(screen.getByTestId("parsons-check"));

    await waitFor(() =>
      expect(submitParsons).toHaveBeenCalledWith({ itemId: "item", blockIds: ["b2", "b1"] })
    );
  });

  it("shows partial structural feedback without revealing the solution", async () => {
    submitParsons.mockResolvedValue({ status: "graded", isCorrect: false, correctCount: 1, total: 2 });
    render(<ParsonsExercise itemId="item" blocks={blocks()} />);

    fireEvent.click(screen.getByTestId("parsons-check"));

    expect(await screen.findByTestId("parsons-feedback")).toHaveTextContent(/1 of 2 lines/i);
  });
});
