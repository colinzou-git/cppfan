import { describe, expect, it } from "vitest";
import { exercisePayloadToCodeLabConfig } from "@/features/user-content/exercise-code-lab";
import { CURRENT_EXERCISE_SCHEMA_VERSION, type ExercisePayload } from "@/features/user-content/exercise-content-types";

function payload(overrides: Partial<ExercisePayload> = {}): ExercisePayload {
  return {
    schemaVersion: CURRENT_EXERCISE_SCHEMA_VERSION,
    title: "Reverse",
    prompt: "Reverse a line.",
    mode: "stdin_program",
    evaluationMode: "automated_tests",
    ...overrides
  };
}

describe("exercisePayloadToCodeLabConfig (#488)", () => {
  it("maps stdin_program to stdin mode and carries the prompt + starter", () => {
    const config = exercisePayloadToCodeLabConfig(payload({ starterCode: "int main(){}" }));
    expect(config.enabled).toBe(true);
    expect(config.language).toBe("cpp");
    expect(config.mode).toBe("stdin");
    expect(config.prompt).toBe("Reverse a line.");
    expect(config.starterCode).toBe("int main(){}");
    // #609: the author-selected evaluation mode is carried into the config.
    expect(config.evaluationMode).toBe("automated_tests");
  });

  it("maps function mode", () => {
    expect(exercisePayloadToCodeLabConfig(payload({ mode: "function" })).mode).toBe("function");
  });

  it("exposes only visible tests (exact matcher) and a hidden count — no hidden I/O", () => {
    const config = exercisePayloadToCodeLabConfig(
      payload({
        tests: [
          { name: "visible", input: "ab\n", expectedOutput: "ba\n", hidden: false },
          { name: "hidden", input: "SECRET_IN", expectedOutput: "SECRET_OUT", hidden: true }
        ]
      })
    );
    expect(config.visibleTests).toHaveLength(1);
    expect(config.visibleTests[0]).toEqual({ name: "visible", stdin: "ab\n", expectedStdout: "ba\n", matcher: "exact" });
    expect(config.hiddenTestCount).toBe(1);
    const serialized = JSON.stringify(config);
    expect(serialized).not.toContain("SECRET_IN");
    expect(serialized).not.toContain("SECRET_OUT");
  });

  it("omits hiddenTestCount when there are no hidden tests", () => {
    const config = exercisePayloadToCodeLabConfig(payload({ tests: [{ name: "v", input: "", expectedOutput: "", hidden: false }] }));
    expect(config.hiddenTestCount).toBeUndefined();
  });
});
