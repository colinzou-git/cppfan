import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ParsonsEditor, normalizeParsonsOrder } from "@/features/user-content/parsons-editor";
import type { LessonParsonsBlock } from "@/features/user-content/user-content-types";

function block(text: string, isDistractor = false): LessonParsonsBlock {
  return { text, correctOrder: 0, isDistractor };
}

describe("normalizeParsonsOrder (#487)", () => {
  it("numbers solution blocks 1..n in order and zeroes distractors", () => {
    const result = normalizeParsonsOrder([block("a"), block("d", true), block("b"), block("c")]);
    expect(result.map((b) => b.correctOrder)).toEqual([1, 0, 2, 3]);
  });
});

describe("ParsonsEditor (#487)", () => {
  it("adds a block and re-normalizes order", () => {
    const onChange = vi.fn();
    render(<ParsonsEditor blocks={[block("a")]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /add block/i }));
    expect(onChange).toHaveBeenCalledWith([
      { text: "a", correctOrder: 1, isDistractor: false },
      { text: "", correctOrder: 2, isDistractor: false }
    ]);
  });

  it("marks a distractor, dropping it from the solution numbering", () => {
    const onChange = vi.fn();
    render(<ParsonsEditor blocks={[block("a"), block("b")]} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Block 1 is a distractor"));
    expect(onChange).toHaveBeenCalledWith([
      { text: "a", correctOrder: 0, isDistractor: true },
      { text: "b", correctOrder: 1, isDistractor: false }
    ]);
  });

  it("moves a block down and renumbers", () => {
    const onChange = vi.fn();
    render(<ParsonsEditor blocks={[block("a"), block("b")]} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Move block 1 down"));
    expect(onChange).toHaveBeenCalledWith([
      { text: "b", correctOrder: 1, isDistractor: false },
      { text: "a", correctOrder: 2, isDistractor: false }
    ]);
  });

  it("disables move-up on the first block and move-down on the last", () => {
    render(<ParsonsEditor blocks={[block("a"), block("b")]} onChange={vi.fn()} />);
    expect((screen.getByLabelText("Move block 1 up") as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByLabelText("Move block 2 down") as HTMLButtonElement).disabled).toBe(true);
  });
});
