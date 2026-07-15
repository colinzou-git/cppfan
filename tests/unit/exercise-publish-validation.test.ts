import { describe, expect, it, vi } from "vitest";

const { executeRun } = vi.hoisted(() => ({ executeRun: vi.fn() }));
vi.mock("@/features/code-lab/code-runner", () => ({
  executeRun,
  buildRunnerInput: (x: unknown) => x
}));
// keep the real compareOutput/defaults

import { validateExercisePublication } from "@/features/user-content/exercise-publish-validation";
import { CURRENT_EXERCISE_SCHEMA_VERSION, type ExercisePayload } from "@/features/user-content/exercise-content-types";

function exercise(overrides: Partial<ExercisePayload> = {}): ExercisePayload {
  return {
    schemaVersion: CURRENT_EXERCISE_SCHEMA_VERSION,
    title: "Reverse",
    prompt: "Reverse.",
    mode: "stdin_program",
    evaluationMode: "automated_tests",
    ...overrides
  };
}

const twoTests = [
  { name: "t1", input: "ab\n", expectedOutput: "ba\n", hidden: false },
  { name: "t2", input: "xy\n", expectedOutput: "yx\n", hidden: true }
];

describe("validateExercisePublication (#488)", () => {
  it("skips when there is no reference solution", async () => {
    const result = await validateExercisePublication(exercise({ tests: twoTests }));
    expect(result.status).toBe("skipped");
    expect(executeRun).not.toHaveBeenCalled();
  });

  it("skips when the runner is unconfigured", async () => {
    executeRun.mockReset().mockResolvedValue({ status: "runner_unconfigured", compileOutput: "", stdout: "", provider: "none", simulated: false });
    const result = await validateExercisePublication(exercise({ referenceSolution: "int main(){}", tests: twoTests }));
    expect(result.status).toBe("skipped");
  });

  it("reports a compile error", async () => {
    executeRun.mockReset().mockResolvedValue({ status: "compile_error", compileOutput: "error: expected ;", stdout: "" });
    const result = await validateExercisePublication(exercise({ referenceSolution: "bad code", tests: twoTests }));
    expect(result.status).toBe("compile_error");
  });

  it("fails when the reference solution fails a test", async () => {
    executeRun
      .mockReset()
      .mockResolvedValueOnce({ status: "success", stdout: "ba\n", compileOutput: "" }) // t1 passes
      .mockResolvedValueOnce({ status: "success", stdout: "WRONG\n", compileOutput: "" }); // t2 fails
    const result = await validateExercisePublication(exercise({ referenceSolution: "ok", tests: twoTests }));
    expect(result.status).toBe("failed");
    if (result.status === "failed") {
      expect(result.failures).toEqual(["t2"]);
    }
  });

  it("passes when the reference solution passes every test", async () => {
    executeRun
      .mockReset()
      .mockResolvedValueOnce({ status: "success", stdout: "ba\n", compileOutput: "" })
      .mockResolvedValueOnce({ status: "success", stdout: "yx\n", compileOutput: "" });
    const result = await validateExercisePublication(exercise({ referenceSolution: "ok", tests: twoTests }));
    expect(result.status).toBe("ok");
  });
});
