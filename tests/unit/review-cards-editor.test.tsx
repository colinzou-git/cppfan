import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReviewCardsEditor } from "@/features/user-content/review-cards-editor";
import type { LessonReviewCard } from "@/features/user-content/user-content-types";

const card = (prompt: string): LessonReviewCard => ({ prompt, choices: [] });

describe("ReviewCardsEditor (#487)", () => {
  it("adds a blank review card", () => {
    const onChange = vi.fn();
    render(<ReviewCardsEditor cards={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /add question/i }));
    expect(onChange).toHaveBeenCalledWith([{ prompt: "", choices: [] }]);
  });

  it("edits a card prompt and explanation", () => {
    const onChange = vi.fn();
    render(<ReviewCardsEditor cards={[card("Q1")]} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Question 1 prompt"), { target: { value: "What is a pointer?" } });
    expect(onChange).toHaveBeenLastCalledWith([{ prompt: "What is a pointer?", choices: [] }]);
    fireEvent.change(screen.getByLabelText("Question 1 explanation"), { target: { value: "Holds an address." } });
    expect(onChange).toHaveBeenLastCalledWith([{ prompt: "Q1", choices: [], explanation: "Holds an address." }]);
  });

  it("edits a card's nested choices via the shared choices editor", () => {
    const onChange = vi.fn();
    render(<ReviewCardsEditor cards={[card("Q1")]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /add choice/i }));
    expect(onChange).toHaveBeenLastCalledWith([{ prompt: "Q1", choices: [{ text: "", isCorrect: false }] }]);
  });

  it("removes a card", () => {
    const onChange = vi.fn();
    render(<ReviewCardsEditor cards={[card("Q1"), card("Q2")]} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Remove question 1"));
    expect(onChange).toHaveBeenCalledWith([{ prompt: "Q2", choices: [] }]);
  });
});
