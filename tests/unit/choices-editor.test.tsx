import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChoicesEditor } from "@/features/user-content/choices-editor";
import type { LessonChoice } from "@/features/user-content/user-content-types";

describe("ChoicesEditor (#487)", () => {
  it("adds a blank choice", () => {
    const onChange = vi.fn();
    render(<ChoicesEditor choices={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /add choice/i }));
    expect(onChange).toHaveBeenCalledWith([{ text: "", isCorrect: false }]);
  });

  it("edits text and toggles correctness immutably", () => {
    const onChange = vi.fn();
    const choices: LessonChoice[] = [
      { text: "A", isCorrect: false },
      { text: "B", isCorrect: false }
    ];
    render(<ChoicesEditor choices={choices} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Choice 1 text"), { target: { value: "Alpha" } });
    expect(onChange).toHaveBeenLastCalledWith([
      { text: "Alpha", isCorrect: false },
      { text: "B", isCorrect: false }
    ]);

    fireEvent.click(screen.getByLabelText("Choice 2 is correct"));
    expect(onChange).toHaveBeenLastCalledWith([
      { text: "A", isCorrect: false },
      { text: "B", isCorrect: true }
    ]);
  });

  it("removes a choice", () => {
    const onChange = vi.fn();
    const choices: LessonChoice[] = [
      { text: "A", isCorrect: true },
      { text: "B", isCorrect: false }
    ];
    render(<ChoicesEditor choices={choices} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Remove choice 1"));
    expect(onChange).toHaveBeenCalledWith([{ text: "B", isCorrect: false }]);
  });

  it("caps at the maximum number of choices", () => {
    const choices: LessonChoice[] = Array.from({ length: 12 }, (_, i) => ({ text: `c${i}`, isCorrect: false }));
    render(<ChoicesEditor choices={choices} onChange={vi.fn()} />);
    expect((screen.getByRole("button", { name: /add choice/i }) as HTMLButtonElement).disabled).toBe(true);
  });
});
