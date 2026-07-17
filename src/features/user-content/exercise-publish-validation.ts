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
import { buildFunctionExerciseTranslationUnit } from "./function-exercise-harness";
import type { ExercisePayload } from "./exercise-content-types";
import type { CodeTestCase } from "@/features/code-lab/code-lab-types";

/**
 * Wrap author source (starter/reference) exactly as the learner path will (#607):
 * function mode goes through the generated harness so publication validates the
 * SAME executable shape learners run; every other mode compiles source directly.
 * Returns null when the signature is unsupported — the schema-level validation
 * (validateExerciseForPublication) owns that actionable error.
 */
function wrapAuthorSource(payload: ExercisePayload, source: string): string | null {
  if (payload.mode !== "function") {
    return source;
  }
  const built = buildFunctionExerciseTranslationUnit({
    learnerSource: source,
    functionSignature: payload.functionSignature ?? ""
  });
  return built.ok ? built.source : null;
}

export type ExercisePublishValidation =
  | { status: "ok" }
  | { status: "skipped" }
  | { status: "compile_error"; output: string }
  | { status: "starter_compile_error"; output: string }
  | { status: "starter_should_not_compile" }
  | { status: "failed"; failures: string[] };

/**
 * Validate a supplied starter's compile contract (#488 GAP E). A normal starter
 * must compile; a starter marked `starterIsBroken` (a debugging exercise) must
 * NOT compile. Returns null when there is nothing to enforce or the runner is
 * unconfigured, so publishing still works where no runner exists.
 */
async function validateStarterContract(payload: ExercisePayload): Promise<ExercisePublishValidation | null> {
  const starter = payload.starterCode?.trim();
  if (!starter) {
    return null;
  }
  const wrapped = wrapAuthorSource(payload, starter);
  if (wrapped === null) {
    // Unsupported signature — surfaced by validateExerciseForPublication.
    return null;
  }
  const run = await executeRun(
    buildRunnerInput({ source: wrapped, stdin: "", compilerFlags: [...DEFAULT_COMPILER_FLAGS] })
  );
  if (run.status === "runner_unconfigured") {
    return null;
  }
  const compiled = run.status !== "compile_error";
  if (payload.starterIsBroken) {
    // The declared contract is "expected to fail to compile".
    return compiled ? { status: "starter_should_not_compile" } : null;
  }
  return compiled ? null : { status: "starter_compile_error", output: run.compileOutput };
}

/**
 * Validate a supplied starter (compile contract) and reference solution (must
 * compile and pass all supplied tests). Returns "skipped" when there is nothing
 * to validate or the runner is unconfigured.
 */
export async function validateExercisePublication(payload: ExercisePayload): Promise<ExercisePublishValidation> {
  const starterResult = await validateStarterContract(payload);
  if (starterResult) {
    return starterResult;
  }

  const reference = payload.referenceSolution?.trim();
  if (!reference) {
    return { status: "skipped" };
  }
  const wrappedReference = wrapAuthorSource(payload, reference);
  if (wrappedReference === null) {
    // Unsupported signature — surfaced by validateExerciseForPublication.
    return { status: "skipped" };
  }

  const config = exercisePayloadToCodeLabConfig(payload);
  const cases: CodeTestCase[] = [...config.visibleTests, ...exerciseHiddenTests(payload)];
  // With no tests, still compile the reference once.
  const runCases: CodeTestCase[] = cases.length > 0 ? cases : [{ name: "compile", matcher: "exact" }];

  const failures: string[] = [];
  for (const test of runCases) {
    const run = await executeRun(
      buildRunnerInput({ source: wrappedReference, stdin: test.stdin ?? "", compilerFlags: [...DEFAULT_COMPILER_FLAGS] })
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
