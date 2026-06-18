import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlacementAssessment } from "@/features/placement/placement-assessment";
import {
  INITIAL_PLACEMENT_QUESTION_COUNT,
  MAX_PLACEMENT_QUESTION_COUNT,
  PLACEMENT_QUESTION_BATCH_SIZE
} from "@/features/placement/placement-seed";
import type { PlacementQuestion } from "@/features/placement/placement-queries";

vi.mock("@/features/placement/placement-actions", () => ({
  resetPlacement: vi.fn(),
  submitPlacement: vi.fn()
}));

function questions(count: number): PlacementQuestion[] {
  return Array.from({ length: count }, (_, index) => ({
    itemId: `item-${index + 1}`,
    moduleId: `module-${(index % INITIAL_PLACEMENT_QUESTION_COUNT) + 1}`,
    moduleTitle: `Module ${(index % INITIAL_PLACEMENT_QUESTION_COUNT) + 1}`,
    prompt: `Question ${index + 1}`,
    choices: [
      { id: `item-${index + 1}.a`, learning_item_id: `item-${index + 1}`, content: "A", order_index: 10 },
      { id: `item-${index + 1}.b`, learning_item_id: `item-${index + 1}`, content: "B", order_index: 20 }
    ]
  }));
}

describe("PlacementAssessment extended question flow (#330)", () => {
  it("starts with 7 questions and lets the learner reveal more up to 60", () => {
    render(
      <PlacementAssessment
        questions={questions(MAX_PLACEMENT_QUESTION_COUNT + 5)}
        initialResults={[]}
        authenticated={false}
      />
    );

    const assessment = screen.getByTestId("placement-assessment");
    expect(within(assessment).getAllByRole("group")).toHaveLength(INITIAL_PLACEMENT_QUESTION_COUNT);
    expect(screen.getByTestId("placement-question-count")).toHaveTextContent("Showing 7 of 60");

    fireEvent.click(screen.getByTestId("placement-show-more"));
    expect(within(assessment).getAllByRole("group")).toHaveLength(
      INITIAL_PLACEMENT_QUESTION_COUNT + PLACEMENT_QUESTION_BATCH_SIZE
    );
    expect(screen.getByTestId("placement-question-count")).toHaveTextContent("Showing 14 of 60");

    for (let click = 0; click < 7; click += 1) {
      fireEvent.click(screen.getByTestId("placement-show-more"));
    }

    expect(within(assessment).getAllByRole("group")).toHaveLength(MAX_PLACEMENT_QUESTION_COUNT);
    expect(screen.getByTestId("placement-question-count")).toHaveTextContent("Showing 60 of 60");
    expect(screen.queryByTestId("placement-show-more")).toBeNull();
  });
});
