/*
 * Server-side compile/test validation for a user exercise before publish (#488).
 * When a reference solution is supplied it must compile and pass all supplied
 * visible + hidden tests. Reuses the Code Lab runner; when the runner is not
 * configured (CI/local) validation is skipped so publishing still works — the
 * requirement only bites where a runner exists. Server-only (imports the runner).
 */

import { buildRunnerInput, executeRun } from "@/features/code-lab/code-runner";
import { compareOutput } from "@/features/code-lab/code-lab-service";
import { DEFAULT_COMPILER_FLAGS } from "@/features/code-lab/code-lab-defaults";
import { exerciseHiddenTests } from "@/features/code-lab/user-exercise-code-lab";
import { exercisePayloadToCodeLabConfig } from "./exercise-code-lab";
import type { ExercisePayload } from "./exercise-content-types";
import type { CodeTestCase } from "@/features/code-lab/code-lab-types";

export type ExercisePublishValidation =
  | { status: "ok" }
  | { status: "skipped" }
  | { status: "compile_error"; output: string }
  | { status: "failed"; failures: string[] };

/**
 * Validate a supplied reference solution against the exercise's tests. Returns
 * "skipped" when there is no reference solution or the runner is unconfigured.
 */
export async function validateExercisePublication(payload: ExercisePayload): Promise<ExercisePublishValidation> {
  const reference = payload.referenceSolution?.trim();
  if (!reference) {
    return { status: "skipped" };
  }

  const config = exercisePayloadToCodeLabConfig(payload);
  const cases: CodeTestCase[] = [...config.visibleTests, ...exerciseHiddenTests(payload)];
  // With no tests, still compile the reference once.
  const runCases: CodeTestCase[] = cases.length > 0 ? cases : [{ name: "compile", matcher: "exact" }];

  const failures: string[] = [];
  for (const test of runCases) {
    const run = await executeRun(
      buildRunnerInput({ source: reference, stdin: test.stdin ?? "", compilerFlags: [...DEFAULT_COMPILER_FLAGS] })
    );
    if (run.status === "runner_unconfigured") {
      return { status: "skipped" };
    }
    if (run.status === "compile_error") {
      return { status: "compile_error", output: run.compileOutput };
    }
    if (test.expectedStdout !== undefined) {
      const passed = run.status === "success" && compareOutput(run.stdout, test.expectedStdout, test.matcher);
      if (!passed) {
        failures.push(test.name);
      }
    }
  }

  return failures.length > 0 ? { status: "failed", failures } : { status: "ok" };
}
