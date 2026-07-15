import { describe, expect, it } from "vitest";
import { parseExercisePayload, validateExerciseForPublication } from "@/features/user-content/exercise-content-schema";
import { CURRENT_EXERCISE_SCHEMA_VERSION, type ExercisePayload } from "@/features/user-content/exercise-content-types";

function base(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { title: "  Reverse a string  ", prompt: "Read a line and print it reversed.", ...overrides };
}

function payload(overrides: Partial<ExercisePayload> = {}): ExercisePayload {
  return {
    schemaVersion: CURRENT_EXERCISE_SCHEMA_VERSION,
    title: "T",
    prompt: "P",
    mode: "stdin_program",
    evaluationMode: "self_evaluation",
    ...overrides
  };
}

describe("parseExercisePayload (#488)", () => {
  it("accepts and normalizes a minimal exercise with defaults", () => {
    const result = parseExercisePayload(base());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe("Reverse a string"); // trimmed
      expect(result.value.mode).toBe("stdin_program"); // default
      expect(result.value.evaluationMode).toBe("self_evaluation"); // default
      expect(result.value.schemaVersion).toBe(CURRENT_EXERCISE_SCHEMA_VERSION);
    }
  });

  it("rejects a payload missing title or prompt", () => {
    expect(parseExercisePayload({ prompt: "p" }).ok).toBe(false);
    expect(parseExercisePayload({ title: "t" }).ok).toBe(false);
    expect(parseExercisePayload("nope").ok).toBe(false);
  });

  it("rejects a future schema version", () => {
    expect(parseExercisePayload(base({ schemaVersion: 99 })).ok).toBe(false);
  });

  it("keeps known modes and bounded metadata, tests, and code fields", () => {
    const result = parseExercisePayload(
      base({
        mode: "function",
        evaluationMode: "automated_tests",
        difficulty: "intermediate",
        estimatedMinutes: 30,
        tags: ["strings", "  ", "io"],
        functionSignature: "std::string reverse_string(std::string)",
        tests: [
          { name: "basic", input: "abc\n", expectedOutput: "cba\n", hidden: false },
          { name: "hidden", input: "xy\n", expectedOutput: "yx\n", hidden: true }
        ]
      })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mode).toBe("function");
      expect(result.value.evaluationMode).toBe("automated_tests");
      expect(result.value.difficulty).toBe("intermediate");
      expect(result.value.tags).toEqual(["strings", "io"]);
      expect(result.value.tests).toHaveLength(2);
      expect(result.value.tests?.[1].hidden).toBe(true);
      expect(result.value.functionSignature).toContain("reverse_string");
    }
  });

  it("parses the intentionally-broken starter flag only when strictly true (#488 GAP E)", () => {
    const on = parseExercisePayload(base({ starterCode: "int main(){ x }", starterIsBroken: true }));
    expect(on.ok && on.value.starterIsBroken).toBe(true);
    const off = parseExercisePayload(base({ starterCode: "int main(){}", starterIsBroken: "yes" }));
    expect(off.ok && off.value.starterIsBroken).toBeUndefined();
    const absent = parseExercisePayload(base({ starterCode: "int main(){}" }));
    expect(absent.ok && absent.value.starterIsBroken).toBeUndefined();
  });

  it("falls back to safe defaults for unknown mode / evaluationMode", () => {
    const result = parseExercisePayload(base({ mode: "wat", evaluationMode: "wat" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mode).toBe("stdin_program");
      expect(result.value.evaluationMode).toBe("self_evaluation");
    }
  });
});

describe("validateExerciseForPublication (#488)", () => {
  it("passes a self-evaluated exercise with no tests", () => {
    expect(validateExerciseForPublication(payload())).toEqual([]);
  });

  it("requires at least one test for automated evaluation", () => {
    expect(validateExerciseForPublication(payload({ evaluationMode: "automated_tests" })).length).toBeGreaterThan(0);
    expect(validateExerciseForPublication(payload({ evaluationMode: "automated_plus_ai" })).length).toBeGreaterThan(0);
    expect(
      validateExerciseForPublication(
        payload({ evaluationMode: "automated_tests", tests: [{ name: "t", input: "", expectedOutput: "", hidden: false }] })
      )
    ).toEqual([]);
  });

  it("requires a signature in function mode", () => {
    expect(validateExerciseForPublication(payload({ mode: "function" })).length).toBeGreaterThan(0);
    expect(validateExerciseForPublication(payload({ mode: "function", functionSignature: "int f()" }))).toEqual([]);
  });
});
