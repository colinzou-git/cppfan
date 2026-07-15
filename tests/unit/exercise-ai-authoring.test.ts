import { describe, expect, it } from "vitest";
import {
  applyAcceptedExerciseOperations,
  describeExerciseOperation,
  parseExerciseAuthoringProposal
} from "@/features/user-content/exercise-ai-authoring";
import { CURRENT_EXERCISE_SCHEMA_VERSION, type ExercisePayload } from "@/features/user-content/exercise-content-types";

function exercise(overrides: Partial<ExercisePayload> = {}): ExercisePayload {
  return {
    schemaVersion: CURRENT_EXERCISE_SCHEMA_VERSION,
    title: "T",
    prompt: "P",
    mode: "stdin_program",
    evaluationMode: "self_evaluation",
    ...overrides
  };
}

describe("parseExerciseAuthoringProposal (#488)", () => {
  it("parses fenced JSON, ids ops, and rejects unknown fields/types", () => {
    const text =
      "Sure:\n```json\n" +
      JSON.stringify({
        summary: "improve it",
        operations: [
          { type: "replace_field", field: "prompt", value: "Reverse the input." },
          { type: "replace_field", field: "unknownField", value: "x" },
          { type: "set_difficulty", value: "advanced" },
          { type: "set_tags", value: ["strings", "  ", "io"] },
          { type: "add_test", name: "basic", input: "ab\n", expectedOutput: "ba\n", hidden: false },
          { type: "bogus" }
        ]
      }) +
      "\n```";
    const parsed = parseExerciseAuthoringProposal(text);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      // unknownField + bogus are dropped
      expect(parsed.value.operations).toHaveLength(4);
      expect(parsed.value.operations[0].id).toBe("op-0");
    }
  });

  it("fails when there is no usable operation", () => {
    expect(parseExerciseAuthoringProposal(JSON.stringify({ operations: [{ type: "nope" }] })).ok).toBe(false);
    expect(parseExerciseAuthoringProposal(42).ok).toBe(false);
  });
});

describe("applyAcceptedExerciseOperations (#488)", () => {
  it("applies each accepted op immutably", () => {
    const before = exercise();
    const next = applyAcceptedExerciseOperations(before, [
      { type: "replace_field", field: "prompt", value: "New prompt" },
      { type: "replace_field", field: "referenceSolution", value: "int main(){}" },
      { type: "set_difficulty", value: "intermediate" },
      { type: "set_tags", value: ["a", "b"] },
      { type: "add_test", name: "t1", input: "1\n", expectedOutput: "1\n", hidden: true }
    ]);
    expect(next.prompt).toBe("New prompt");
    expect(next.referenceSolution).toBe("int main(){}");
    expect(next.difficulty).toBe("intermediate");
    expect(next.tags).toEqual(["a", "b"]);
    expect(next.tests).toHaveLength(1);
    expect(next.tests?.[0].hidden).toBe(true);
    // original untouched
    expect(before.prompt).toBe("P");
    expect(before.tests).toBeUndefined();
  });

  it("applies only the accepted subset", () => {
    const parsed = parseExerciseAuthoringProposal(
      JSON.stringify({
        summary: "s",
        operations: [
          { type: "replace_field", field: "title", value: "Accepted" },
          { type: "replace_field", field: "prompt", value: "Rejected" }
        ]
      })
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      const accepted = parsed.value.operations.filter((o) => o.id === "op-0");
      const next = applyAcceptedExerciseOperations(exercise(), accepted);
      expect(next.title).toBe("Accepted");
      expect(next.prompt).toBe("P");
    }
  });
});

describe("describeExerciseOperation (#488)", () => {
  it("summarizes operations", () => {
    expect(describeExerciseOperation({ type: "replace_field", field: "prompt", value: "x" })).toContain("prompt");
    expect(describeExerciseOperation({ type: "add_test", name: "edge", input: "", expectedOutput: "", hidden: true })).toContain("hidden");
    expect(describeExerciseOperation({ type: "set_tags", value: ["a", "b"] })).toContain("a, b");
  });
});
