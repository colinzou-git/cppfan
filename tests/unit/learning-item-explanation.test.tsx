import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LearningItemView } from "@/features/learning-items/learning-item-view";
import type { LearningItem, LearningItemWithDetails } from "@/features/learning-items/learning-item-types";

// AnswerForm calls the submitAnswer server action; replace it so the component
// test stays in jsdom and we control the graded result.
const submitAnswer = vi.fn();
vi.mock("@/features/learning-items/attempt-actions", () => ({
  submitAnswer: (...args: unknown[]) => submitAnswer(...args)
}));

const EXPLANATION = "SECRET-ANSWER: the default access in a struct is public.";

function item(overrides: Partial<LearningItem> = {}): LearningItem {
  return {
    id: "item-1",
    type: "multiple_choice",
    title: "Default access",
    prompt: "What is the default access level in a struct?",
    explanation: EXPLANATION,
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 1,
    is_active: true,
    ...overrides
  };
}

function data(overrides: Partial<LearningItem> = {}, withChoices = true): LearningItemWithDetails {
  return {
    item: item(overrides),
    skills: [],
    choices: withChoices
      ? [
          { id: "c1", learning_item_id: "item-1", content: "Public", order_index: 10 },
          { id: "c2", learning_item_id: "item-1", content: "Private", order_index: 20 }
        ]
      : []
  };
}

describe("learning item explanation gating (#145)", () => {
  beforeEach(() => {
    submitAnswer.mockReset();
  });

  it("shows a lesson's explanation immediately (it is lesson content)", () => {
    render(<LearningItemView data={data({ type: "lesson" }, false)} />);
    expect(screen.getByText(EXPLANATION)).toBeTruthy();
  });

  it("hides a graded multiple-choice explanation until after grading, then reveals it", async () => {
    submitAnswer.mockResolvedValue({
      status: "graded",
      isCorrect: true,
      correctChoiceId: "c1",
      persisted: false
    });

    render(<LearningItemView data={data({ type: "multiple_choice" })} />);

    // Not leaked before submission.
    expect(screen.queryByText(EXPLANATION)).toBeNull();

    fireEvent.click(screen.getByText("Public"));
    fireEvent.click(screen.getByTestId("answer-submit"));

    await waitFor(() => expect(screen.getByText(EXPLANATION)).toBeTruthy());

    // Hidden again after retry resets the disclosure state.
    fireEvent.click(screen.getByTestId("answer-retry"));
    expect(screen.queryByText(EXPLANATION)).toBeNull();
  });

  it("hides a graded item's explanation behind an explicit reveal when it has no choices", () => {
    render(<LearningItemView data={data({ type: "code_reading" }, false)} />);

    expect(screen.queryByText(EXPLANATION)).toBeNull();
    fireEvent.click(screen.getByTestId("reveal-explanation-button"));
    expect(screen.getByText(EXPLANATION)).toBeTruthy();
  });
});
