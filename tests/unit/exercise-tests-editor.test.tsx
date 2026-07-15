import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExerciseTestsEditor } from "@/features/user-content/exercise-tests-editor";
import type { ExerciseTest } from "@/features/user-content/exercise-content-types";

const test1 = (name: string): ExerciseTest => ({ name, input: "", expectedOutput: "", hidden: false });

describe("ExerciseTestsEditor (#488)", () => {
  it("adds a blank test", () => {
    const onChange = vi.fn();
    render(<ExerciseTestsEditor tests={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /add test/i }));
    expect(onChange).toHaveBeenCalledWith([{ name: "Test 1", input: "", expectedOutput: "", hidden: false }]);
  });

  it("edits input, expected output, and the hidden flag", () => {
    const onChange = vi.fn();
    render(<ExerciseTestsEditor tests={[test1("t1")]} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Test 1 input"), { target: { value: "ab\n" } });
    expect(onChange).toHaveBeenLastCalledWith([{ name: "t1", input: "ab\n", expectedOutput: "", hidden: false }]);
    fireEvent.change(screen.getByLabelText("Test 1 expected output"), { target: { value: "ba\n" } });
    expect(onChange).toHaveBeenLastCalledWith([{ name: "t1", input: "", expectedOutput: "ba\n", hidden: false }]);
    fireEvent.click(screen.getByLabelText("Test 1 hidden"));
    expect(onChange).toHaveBeenLastCalledWith([{ name: "t1", input: "", expectedOutput: "", hidden: true }]);
  });

  it("removes a test", () => {
    const onChange = vi.fn();
    render(<ExerciseTestsEditor tests={[test1("a"), test1("b")]} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Remove test 1"));
    expect(onChange).toHaveBeenCalledWith([test1("b")]);
  });
});
