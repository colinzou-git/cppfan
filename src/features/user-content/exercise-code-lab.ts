/*
 * Build a Code Lab config from a published user exercise (#488). Pure and
 * client-safe: no I/O and no answer-bearing data. Hidden tests contribute only a
 * count; the reference solution and hidden test I/O never appear here. The
 * server-side execution path resolves the full (hidden-inclusive) config
 * separately from the DB.
 */

import type { LearningItemCodeLab } from "@/features/code-lab/code-lab-types";
import type { ExercisePayload } from "./exercise-content-types";

/** Learner-safe Code Lab config for a published exercise (visible tests only). */
export function exercisePayloadToCodeLabConfig(payload: ExercisePayload): LearningItemCodeLab {
  const tests = payload.tests ?? [];
  const visible = tests.filter((t) => !t.hidden);
  const hiddenCount = tests.length - visible.length;

  return {
    enabled: true,
    language: "cpp",
    mode: payload.mode === "function" ? "function" : "stdin",
    prompt: payload.prompt || undefined,
    starterCode: payload.starterCode ?? "",
    visibleTests: visible.map((test) => ({
      name: test.name,
      stdin: test.input,
      expectedStdout: test.expectedOutput,
      matcher: "exact" as const
    })),
    ...(hiddenCount > 0 ? { hiddenTestCount: hiddenCount } : {})
  };
}
