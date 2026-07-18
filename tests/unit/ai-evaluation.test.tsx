import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { aiVerdictFromFeedback } from "@/features/code-lab/formal-evaluation-verdict";
import { AiEvaluationPanel } from "@/features/code-lab/ai-evaluation-panel";
import type { UserContentEvaluationResult } from "@/features/user-content/user-content-evaluation";

afterEach(() => vi.clearAllMocks());

describe("aiVerdictFromFeedback (#609)", () => {
  it("maps an unavailable/invalid provider result to not-available (never a pass)", () => {
    expect(aiVerdictFromFeedback({ status: "unavailable" })).toEqual({ available: false, verdict: "unknown" });
    expect(aiVerdictFromFeedback({ status: "invalid" })).toEqual({ available: false, verdict: "unknown" });
    expect(aiVerdictFromFeedback(null)).toEqual({ available: false, verdict: "unknown" });
  });

  it("passes clean feedback and asks for revision when error tags are present", () => {
    expect(aiVerdictFromFeedback({ status: "ok", errorTags: [] })).toEqual({ available: true, verdict: "pass" });
    expect(aiVerdictFromFeedback({ status: "ok", errorTags: ["cpp.loop.off_by_one"] })).toEqual({
      available: true,
      verdict: "revise"
    });
  });
});

function result(over: Partial<UserContentEvaluationResult>): UserContentEvaluationResult {
  return {
    status: "passed",
    mode: "ai_evaluation",
    completionCredited: true,
    objectiveAuthoritative: false,
    reason: "AI rubric pass (weak evidence)",
    nextAction: "Completion recorded — continue to your next review item.",
    ...over
  };
}

describe("AiEvaluationPanel (#609)", () => {
  it("submits and shows the credited outcome", async () => {
    const onSubmit = vi.fn(async () => result({}));
    render(<AiEvaluationPanel mode="ai_evaluation" onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /submit for evaluation/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect((await screen.findByTestId("ai-evaluation-result")).textContent).toMatch(/completion recorded/i);
  });

  it("surfaces a retryable unavailable outcome without crediting completion", async () => {
    const onSubmit = vi.fn(async () =>
      result({ status: "unavailable", completionCredited: false, nextAction: "Evaluation is temporarily unavailable — your work is saved; try again." })
    );
    render(<AiEvaluationPanel mode="automated_plus_ai" onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /submit for evaluation/i }));
    expect((await screen.findByTestId("ai-evaluation-result")).textContent).toMatch(/temporarily unavailable/i);
  });
});
