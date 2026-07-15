import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExercisePreview } from "@/features/user-content/exercise-preview";
import { CURRENT_EXERCISE_SCHEMA_VERSION, type ExercisePayload } from "@/features/user-content/exercise-content-types";

function payload(overrides: Partial<ExercisePayload> = {}): ExercisePayload {
  return {
    schemaVersion: CURRENT_EXERCISE_SCHEMA_VERSION,
    title: "Reverse a line",
    prompt: "Read a line and print it reversed.",
    mode: "stdin_program",
    evaluationMode: "automated_tests",
    ...overrides
  };
}

describe("ExercisePreview (#488)", () => {
  it("renders the title with the User-Created badge", () => {
    render(<ExercisePreview payload={payload()} status="draft" />);
    expect(screen.getByRole("heading", { name: /reverse a line/i })).toBeTruthy();
    expect(screen.getByText("User-Created")).toBeTruthy();
  });

  it("shows visible tests but not hidden test expected output, and gates the reference solution", () => {
    render(
      <ExercisePreview
        payload={payload({
          referenceSolution: "SECRET_SOLUTION_CODE",
          tests: [
            { name: "visible one", input: "ab\n", expectedOutput: "ba\n", hidden: false },
            { name: "hidden one", input: "SECRET_IN", expectedOutput: "SECRET_OUT", hidden: true }
          ]
        })}
        status="published"
      />
    );
    expect(screen.getByText(/visible one/i)).toBeTruthy();
    // hidden test content must not leak into the learner-facing markup
    expect(screen.queryByText(/SECRET_IN/)).toBeNull();
    expect(screen.queryByText(/SECRET_OUT/)).toBeNull();
    expect(screen.getByText(/1 hidden test/i)).toBeTruthy();
    // reference solution is behind an author-only disclosure (summary present)
    expect(screen.getByText(/author preview/i)).toBeTruthy();
  });

  it("shows the function signature in function mode", () => {
    render(<ExercisePreview payload={payload({ mode: "function", functionSignature: "int add(int,int)" })} status="draft" />);
    expect(screen.getByText(/function signature/i)).toBeTruthy();
    expect(screen.getByText(/int add\(int,int\)/)).toBeTruthy();
  });
});
