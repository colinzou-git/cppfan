import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExerciseAiProposalPanel } from "@/features/user-content/exercise-ai-proposal-panel";

const PROMPT = /edge-case tests/i;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ExerciseAiProposalPanel (#488)", () => {
  it("prompts to save first when there is no content id", async () => {
    const onApply = vi.fn();
    render(<ExerciseAiProposalPanel onApply={onApply} />);
    fireEvent.change(screen.getByPlaceholderText(PROMPT), { target: { value: "help" } });
    fireEvent.click(screen.getByRole("button", { name: /ask ai/i }));
    expect(await screen.findByText(/save the exercise first/i)).toBeTruthy();
    expect(onApply).not.toHaveBeenCalled();
  });

  it("fetches a proposal, lists ops, and applies only the accepted ones", async () => {
    const proposal = {
      summary: "some changes",
      operations: [
        { id: "op-0", type: "replace_field", field: "prompt", value: "New prompt" },
        { id: "op-1", type: "add_test", name: "edge", input: "", expectedOutput: "", hidden: true }
      ]
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ proposal }) }));
    const onApply = vi.fn();
    render(<ExerciseAiProposalPanel contentId="e1" onApply={onApply} />);

    fireEvent.change(screen.getByPlaceholderText(PROMPT), { target: { value: "improve it" } });
    fireEvent.click(screen.getByRole("button", { name: /ask ai/i }));

    await screen.findByText(/Replace prompt/i);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]); // reject the add_test op
    fireEvent.click(screen.getByRole("button", { name: /apply selected/i }));

    await waitFor(() => expect(onApply).toHaveBeenCalled());
    const ops = onApply.mock.calls[0][0];
    expect(ops).toHaveLength(1);
    expect(ops[0].id).toBe("op-0");
  });

  it("shows an error when the endpoint rejects the request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 422, json: async () => ({}) }));
    render(<ExerciseAiProposalPanel contentId="e1" onApply={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(PROMPT), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: /ask ai/i }));
    expect(await screen.findByText(/did not return usable changes/i)).toBeTruthy();
  });
});
