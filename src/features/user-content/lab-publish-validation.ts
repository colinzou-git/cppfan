/*
 * Server-side compile/test validation for a user lab before publish (#489).
 * When a reference solution is supplied it must compile and pass every supplied
 * test across the single-task completion contract or all milestones (the final
 * codebase must satisfy the cumulative tests). Reuses the Code Lab runner; when
 * the runner is not configured (CI/local) validation is skipped so publishing
 * still works. Server-only (imports the runner). Mirrors exercise-publish-validation.
 */

import { buildRunnerInput, executeRun } from "@/features/code-lab/code-runner";
import { compareOutput } from "@/features/code-lab/code-lab-service";
import { DEFAULT_COMPILER_FLAGS } from "@/features/code-lab/code-lab-defaults";
import type { ExerciseTest, LabPayload } from "./lab-content-types";
import type { CodeTestCase } from "@/features/code-lab/code-lab-types";

export type LabPublishValidation =
  | { status: "ok" }
  | { status: "skipped" }
  | { status: "compile_error"; output: string }
  | { status: "failed"; failures: string[] };

/** Every supplied test across the lab (single-task completion or all milestones). */
export function allLabTests(payload: LabPayload): ExerciseTest[] {
  if (payload.mode === "milestones") {
    return (payload.milestones ?? []).flatMap((m) => m.tests ?? []);
  }
  return payload.completion?.tests ?? [];
}

/**
 * Validate a supplied reference solution against every lab test. Returns
 * "skipped" when there is no reference solution or the runner is unconfigured.
 */
export async function validateLabPublication(payload: LabPayload): Promise<LabPublishValidation> {
  const reference = payload.referenceSolution?.trim();
  if (!reference) {
    return { status: "skipped" };
  }

  const tests = allLabTests(payload);
  const cases: CodeTestCase[] =
    tests.length > 0
      ? tests.map((t) => ({ name: t.name, stdin: t.input, expectedStdout: t.expectedOutput, matcher: "exact" as const }))
      : [{ name: "compile", matcher: "exact" }];

  const files = (payload.fixtures ?? []).map((f) => ({ name: f.filename, content: f.content }));
  const failures: string[] = [];
  for (const test of cases) {
    const run = await executeRun(
      buildRunnerInput({ source: reference, stdin: test.stdin ?? "", compilerFlags: [...DEFAULT_COMPILER_FLAGS], files })
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
