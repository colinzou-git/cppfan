/*
 * Build a Code Lab config from a published user exercise (#488). Pure and
 * client-safe: no I/O and no answer-bearing data. Hidden tests contribute only a
 * count; the reference solution and hidden test I/O never appear here. The
 * server-side execution path resolves the full (hidden-inclusive) config
 * separately from the DB.
 */

import type { LearningItemCodeLab } from "@/features/code-lab/code-lab-types";
import { functionExerciseStarter } from "./function-exercise-harness";
import type { ExercisePayload } from "./exercise-content-types";

/** Learner-safe Code Lab config for a published exercise (visible tests only). */
export function exercisePayloadToCodeLabConfig(payload: ExercisePayload): LearningItemCodeLab {
  const tests = payload.tests ?? [];
  const visible = tests.filter((t) => !t.hidden);
  const hiddenCount = tests.length - visible.length;
  const isFunction = payload.mode === "function";
  // Function mode: the harness prints a trailing newline, so grade trimmed; a
  // learner without a starter begins from a function stub, not a blank program.
  const matcher = isFunction ? ("trimmed" as const) : ("exact" as const);
  const starterCode =
    payload.starterCode && payload.starterCode.trim().length > 0
      ? payload.starterCode
      : isFunction && payload.functionSignature
        ? functionExerciseStarter(payload.functionSignature)
        : (payload.starterCode ?? "");

  return {
    enabled: true,
    language: "cpp",
    mode: isFunction ? "function" : "stdin",
    prompt: payload.prompt || undefined,
    starterCode,
    evaluationMode: payload.evaluationMode,
    ...(isFunction && payload.functionSignature ? { functionSignature: payload.functionSignature } : {}),
    visibleTests: visible.map((test) => ({
      name: test.name,
      stdin: test.input,
      expectedStdout: test.expectedOutput,
      matcher
    })),
    ...(hiddenCount > 0 ? { hiddenTestCount: hiddenCount } : {})
  };
}
