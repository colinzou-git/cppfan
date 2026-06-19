import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GoalEvaluation } from "@/features/goals/goal-evaluation";
import type { GoalEvaluationView } from "@/features/goals/evaluation-view";

const submitGoalEvaluationAction = vi.fn();

vi.mock("@/features/goals/evaluation-actions", () => ({
  abandonGoalEvaluationAction: vi.fn(),
  startGoalEvaluationAction: vi.fn(),
  submitGoalEvaluationAction: (...args: unknown[]) => submitGoalEvaluationAction(...args)
}));

function activeView(overrides: Partial<GoalEvaluationView> = {}): GoalEvaluationView {
  return {
    state: "ready",
    authenticated: true,
    sessionId: "session-1",
    status: "active",
    questionIndex: 8,
    answerCount: 7,
    algorithmVersion: "goal-evaluation-v1",
    itemPoolVersion: 1,
    currentQuestion: {
      itemId: "item-8",
      moduleId: "program-basics",
      moduleTitle: "Program basics",
      prompt: "Which function starts a standard C++ program?",
      choices: [
        { id: "choice-main", learning_item_id: "item-8", content: "main", order_index: 1 },
        { id: "choice-start", learning_item_id: "item-8", content: "start", order_index: 2 }
      ]
    },
    responses: [],
    findings: [],
    ...overrides
  };
}

describe("GoalEvaluation", () => {
  it("does not reveal correctness feedback while the 30-question run is active", async () => {
    submitGoalEvaluationAction.mockResolvedValue({
      status: "ok",
      lastAnswerCorrect: false,
      view: activeView({
        questionIndex: 9,
        answerCount: 8,
        currentQuestion: {
          itemId: "item-9",
          moduleId: "control-flow",
          moduleTitle: "Control flow",
          prompt: "What does break do in a loop?",
          choices: [
            { id: "choice-exit", learning_item_id: "item-9", content: "Exits the loop", order_index: 1 },
            { id: "choice-skip", learning_item_id: "item-9", content: "Skips one expression", order_index: 2 }
          ]
        }
      })
    });

    render(<GoalEvaluation initialView={activeView()} />);

    fireEvent.click(screen.getByLabelText("start"));
    fireEvent.click(screen.getByRole("button", { name: /submit and choose next/i }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Response recorded. Next question selected.");
    });
    expect(screen.queryByText(/incorrect|correct|prerequisite|contrast/i)).not.toBeInTheDocument();
  });
});
