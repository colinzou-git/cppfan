/*
 * Server-side compile/test validation for a user interview problem before
 * publish (#490). A judge-backed reference solution must compile and pass every
 * supplied visible + hidden test. Reuses the Code Lab runner; skipped when there
 * is no reference solution or the runner is unconfigured. Server-only (imports
 * the runner). Mirrors exercise/lab publish validation.
 */

import { buildRunnerInput, executeRun } from "@/features/code-lab/code-runner";
import { compareOutput } from "@/features/code-lab/code-lab-service";
import { DEFAULT_COMPILER_FLAGS } from "@/features/code-lab/code-lab-defaults";
import type { InterviewProblemPayload } from "./interview-content-types";
import type { CodeTestCase } from "@/features/code-lab/code-lab-types";

export type InterviewPublishValidation =
  | { status: "ok" }
  | { status: "skipped" }
  | { status: "compile_error"; output: string }
  | { status: "failed"; failures: string[] };

/** Validate a supplied reference solution against every supplied test. */
export async function validateInterviewPublication(payload: InterviewProblemPayload): Promise<InterviewPublishValidation> {
  const reference = payload.referenceSolution?.trim();
  if (!reference) {
    return { status: "skipped" };
  }

  const tests = payload.tests ?? [];
  const cases: CodeTestCase[] =
    tests.length > 0
      ? tests.map((t) => ({ name: t.name, stdin: t.input, expectedStdout: t.expectedOutput, matcher: "exact" as const }))
      : [{ name: "compile", matcher: "exact" }];

  const failures: string[] = [];
  for (const test of cases) {
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
