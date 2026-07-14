import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AiProposalPanel, describeOperation } from "@/features/user-content/ai-proposal-panel";

const PROMPT = /common-mistakes/i;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("describeOperation (#487)", () => {
  it("summarizes operations for the accept list", () => {
    expect(describeOperation({ type: "replace_field", field: "title", value: "x" })).toContain("title");
    expect(describeOperation({ type: "add_choice", text: "A", isCorrect: true })).toContain("correct");
    expect(describeOperation({ type: "set_tags", value: ["a", "b"] })).toContain("a, b");
  });
});

describe("AiProposalPanel (#487)", () => {
  it("prompts to save first when there is no content id", async () => {
    const onApply = vi.fn();
    render(<AiProposalPanel onApply={onApply} />);
    fireEvent.change(screen.getByPlaceholderText(PROMPT), { target: { value: "help" } });
    fireEvent.click(screen.getByRole("button", { name: /ask ai/i }));
    expect(await screen.findByText(/Save a draft first/i)).toBeTruthy();
    expect(onApply).not.toHaveBeenCalled();
  });

  it("fetches a proposal, lists ops, and applies only the accepted ones", async () => {
    const proposal = {
      summary: "some changes",
      operations: [
        { id: "op-0", type: "replace_field", field: "title", value: "New" },
        { id: "op-1", type: "append_section", section: "summary", value: "x" }
      ]
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ proposal }) }));
    const onApply = vi.fn();
    render(<AiProposalPanel contentId="c1" onApply={onApply} />);

    fireEvent.change(screen.getByPlaceholderText(PROMPT), { target: { value: "improve it" } });
    fireEvent.click(screen.getByRole("button", { name: /ask ai/i }));

    await screen.findByText(/Replace title/i);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]); // reject the append_section op
    fireEvent.click(screen.getByRole("button", { name: /apply selected/i }));

    await waitFor(() => expect(onApply).toHaveBeenCalled());
    const ops = onApply.mock.calls[0][0];
    expect(ops).toHaveLength(1);
    expect(ops[0].id).toBe("op-0");
  });

  it("shows an error when the endpoint rejects the request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 422, json: async () => ({}) }));
    render(<AiProposalPanel contentId="c1" onApply={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(PROMPT), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: /ask ai/i }));
    expect(await screen.findByText(/did not return usable changes/i)).toBeTruthy();
  });
});
