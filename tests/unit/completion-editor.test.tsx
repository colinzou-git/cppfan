import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CompletionEditor, normalizeCompletionPositions } from "@/features/user-content/completion-editor";
import type { LessonCompletionBlank } from "@/features/user-content/user-content-types";

const blank = (answer: string): LessonCompletionBlank => ({ position: 0, answer });

describe("normalizeCompletionPositions (#487)", () => {
  it("numbers blanks 1..n by order", () => {
    expect(normalizeCompletionPositions([blank("a"), blank("b"), blank("c")]).map((b) => b.position)).toEqual([1, 2, 3]);
  });
});

describe("CompletionEditor (#487)", () => {
  it("adds a blank with the next position", () => {
    const onChange = vi.fn();
    render(<CompletionEditor blanks={[blank("a")]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /add answer/i }));
    expect(onChange).toHaveBeenCalledWith([
      { position: 1, answer: "a" },
      { position: 2, answer: "" }
    ]);
  });

  it("edits an answer", () => {
    const onChange = vi.fn();
    render(<CompletionEditor blanks={[blank("a"), blank("b")]} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Blank 2 answer"), { target: { value: "beta" } });
    expect(onChange).toHaveBeenCalledWith([
      { position: 1, answer: "a" },
      { position: 2, answer: "beta" }
    ]);
  });

  it("removes a blank and renumbers", () => {
    const onChange = vi.fn();
    render(<CompletionEditor blanks={[blank("a"), blank("b"), blank("c")]} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Remove blank 1"));
    expect(onChange).toHaveBeenCalledWith([
      { position: 1, answer: "b" },
      { position: 2, answer: "c" }
    ]);
  });

  it("caps at the maximum number of blanks", () => {
    const blanks = Array.from({ length: 20 }, (_, i) => blank(`a${i}`));
    render(<CompletionEditor blanks={blanks} onChange={vi.fn()} />);
    expect((screen.getByRole("button", { name: /add answer/i }) as HTMLButtonElement).disabled).toBe(true);
  });
});
