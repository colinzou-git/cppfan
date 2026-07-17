import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SelfEvaluationPanel } from "@/features/code-lab/self-evaluation-panel";
import type { UserContentEvaluationResult } from "@/features/user-content/user-content-evaluation";

afterEach(() => vi.clearAllMocks());

function result(over: Partial<UserContentEvaluationResult>): UserContentEvaluationResult {
  return {
    status: "passed",
    mode: "self_evaluation",
    completionCredited: true,
    objectiveAuthoritative: false,
    reason: "self-assessed complete (weak evidence)",
    nextAction: "Completion recorded — continue to your next review item.",
    ...over
  };
}

describe("SelfEvaluationPanel (#609)", () => {
  it("submits the selected rating + reflection and shows the outcome's next action", async () => {
    const onSubmit = vi.fn(async () => result({}));
    render(<SelfEvaluationPanel onSubmit={onSubmit} />);

    // Default rating is "complete"; add a reflection and submit.
    fireEvent.change(screen.getByPlaceholderText(/what did you learn/i), { target: { value: "learned RAII" } });
    fireEvent.click(screen.getByRole("button", { name: /submit evaluation/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("complete", "learned RAII"));
    expect((await screen.findByTestId("self-evaluation-result")).textContent).toMatch(/completion recorded/i);
  });

  it("a not-yet rating submits and surfaces a non-completion next action", async () => {
    const onSubmit = vi.fn(async () =>
      result({ status: "failed", completionCredited: false, nextAction: "Fix the failing tests/criteria and resubmit." })
    );
    render(<SelfEvaluationPanel onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("radio", { name: /not yet/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit evaluation/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("not_yet", ""));
    expect((await screen.findByTestId("self-evaluation-result")).textContent).toMatch(/resubmit/i);
  });

  it("shows an error when submission throws, without a result", async () => {
    const onSubmit = vi.fn(async () => {
      throw new Error("boom");
    });
    render(<SelfEvaluationPanel onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /submit evaluation/i }));
    expect(await screen.findByText(/could not submit/i)).toBeTruthy();
    expect(screen.queryByTestId("self-evaluation-result")).toBeNull();
  });
});
