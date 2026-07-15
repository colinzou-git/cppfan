import { describe, expect, it } from "vitest";
import { exerciseHiddenTests } from "@/features/code-lab/user-exercise-code-lab";
import { CURRENT_EXERCISE_SCHEMA_VERSION, type ExercisePayload } from "@/features/user-content/exercise-content-types";

function payload(tests: ExercisePayload["tests"]): ExercisePayload {
  return {
    schemaVersion: CURRENT_EXERCISE_SCHEMA_VERSION,
    title: "Reverse",
    prompt: "Reverse a line.",
    mode: "stdin_program",
    evaluationMode: "automated_tests",
    tests
  };
}

describe("exerciseHiddenTests (#488)", () => {
  it("maps only hidden tests to server-side CodeTestCases", () => {
    const hidden = exerciseHiddenTests(
      payload([
        { name: "visible", input: "ab\n", expectedOutput: "ba\n", hidden: false },
        { name: "hidden", input: "xy\n", expectedOutput: "yx\n", hidden: true }
      ])
    );
    expect(hidden).toEqual([{ name: "hidden", stdin: "xy\n", expectedStdout: "yx\n", matcher: "exact" }]);
  });

  it("returns [] when there are no tests", () => {
    expect(exerciseHiddenTests(payload(undefined))).toEqual([]);
  });
});
