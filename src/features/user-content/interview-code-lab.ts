/*
 * Build a Code Lab config from a published user interview problem (#490). Pure
 * and client-safe: no I/O and no answer-bearing data. Hidden tests contribute
 * only a count; the reference solution and hidden test I/O never appear here,
 * consistent with the fixed reveal policy (reference is revealed only after
 * submission, via the session UI). The server-side execution path resolves the
 * full (hidden-inclusive) config separately from the DB.
 */

import type { LearningItemCodeLab } from "@/features/code-lab/code-lab-types";
import type { InterviewProblemPayload } from "./interview-content-types";

/** Learner-safe Code Lab config for a published interview problem (visible tests only). */
export function interviewPayloadToCodeLabConfig(payload: InterviewProblemPayload): LearningItemCodeLab {
  const tests = payload.tests ?? [];
  const visible = tests.filter((t) => !t.hidden);
  const hiddenCount = tests.length - visible.length;

  return {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: payload.statement || undefined,
    starterCode: payload.starterCode ?? "",
    evaluationMode: payload.evaluationMode,
    visibleTests: visible.map((test) => ({
      name: test.name,
      stdin: test.input,
      expectedStdout: test.expectedOutput,
      matcher: "exact" as const
    })),
    ...(hiddenCount > 0 ? { hiddenTestCount: hiddenCount } : {})
  };
}
