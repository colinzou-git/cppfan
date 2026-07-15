import { describe, expect, it } from "vitest";
import { buildExercisePayload, fieldsFromExercisePayload } from "@/features/user-content/exercise-editor";
import { parseExercisePayload } from "@/features/user-content/exercise-content-schema";
import { CURRENT_EXERCISE_SCHEMA_VERSION, type ExercisePayload } from "@/features/user-content/exercise-content-types";

describe("exercise editor field mapping (#488)", () => {
  it("defaults an empty payload to a stdin_program / self_evaluation draft", () => {
    const fields = fieldsFromExercisePayload(null);
    expect(fields.mode).toBe("stdin_program");
    expect(fields.evaluationMode).toBe("self_evaluation");
    expect(fields.title).toBe("");
    const payload = buildExercisePayload(fields);
    expect(payload.mode).toBe("stdin_program");
    expect(payload.title).toBe("");
  });

  it("round-trips a group assignment through fields and back (#488)", () => {
    const withGroup: ExercisePayload = {
      schemaVersion: CURRENT_EXERCISE_SCHEMA_VERSION,
      title: "Grouped",
      prompt: "A prompt with enough length.",
      mode: "stdin_program",
      evaluationMode: "self_evaluation",
      difficulty: "beginner",
      groupId: "two-pointers"
    };
    const fields = fieldsFromExercisePayload(withGroup);
    expect(fields.groupId).toBe("two-pointers");
    expect(buildExercisePayload(fields).groupId).toBe("two-pointers");
    // An unset group is omitted, not written as an empty string.
    const ungrouped = fieldsFromExercisePayload({ ...withGroup, groupId: undefined });
    expect(ungrouped.groupId).toBe("");
    expect(buildExercisePayload(ungrouped).groupId).toBeUndefined();
  });

  it("round-trips a program-mode payload through fields and back", () => {
    const original: ExercisePayload = {
      schemaVersion: CURRENT_EXERCISE_SCHEMA_VERSION,
      title: "Reverse a line",
      prompt: "Read a line and print it reversed.",
      mode: "stdin_program",
      evaluationMode: "self_evaluation",
      difficulty: "beginner",
      estimatedMinutes: 20,
      tags: ["strings", "io"],
      starterCode: "int main(){}",
      stdinFormat: "a single line",
      stdoutFormat: "the reversed line"
    };
    const rebuilt = parseExercisePayload(buildExercisePayload(fieldsFromExercisePayload(original)));
    expect(rebuilt.ok).toBe(true);
    if (rebuilt.ok) {
      expect(rebuilt.value.title).toBe("Reverse a line");
      expect(rebuilt.value.tags).toEqual(["strings", "io"]);
      expect(rebuilt.value.estimatedMinutes).toBe(20);
      expect(rebuilt.value.stdinFormat).toBe("a single line");
      expect(rebuilt.value.functionSignature).toBeUndefined();
    }
  });

  it("keeps the function signature and drops stdin/stdout in function mode", () => {
    const fields = fieldsFromExercisePayload({
      schemaVersion: CURRENT_EXERCISE_SCHEMA_VERSION,
      title: "Sum",
      prompt: "Return the sum.",
      mode: "function",
      evaluationMode: "automated_tests",
      functionSignature: "int add(int, int)",
      stdinFormat: "ignored in function mode"
    });
    const payload = buildExercisePayload(fields);
    expect(payload.mode).toBe("function");
    expect(payload.functionSignature).toBe("int add(int, int)");
    expect(payload.stdinFormat).toBeUndefined();
  });
});
