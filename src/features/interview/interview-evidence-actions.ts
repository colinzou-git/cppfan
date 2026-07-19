"use server";

import {
  recordInterviewEvidence,
  type EvidenceSelfReportInput
} from "./interview-evidence-store";
import { resolveInterviewProblemRef } from "./interview-problem-resolver";
import type { EvidenceActionResult } from "./interview-evidence-action-types";

/**
 * Log one self-reported interview outcome against the exact resolved definition
 * (#180/#661). The client reports only learner observations; group/version
 * identity is derived server-side from the native catalog or the owner's
 * published user problem. Self-reported evidence under RLS, separate from FSRS.
 */
export async function logInterviewEvidence(
  input: EvidenceSelfReportInput
): Promise<EvidenceActionResult> {
  if (!input || typeof input.problemId !== "string" || input.problemId.length === 0) {
    return { status: "error" };
  }

  const resolved = await resolveInterviewProblemRef(input.problemId);
  if (!resolved) {
    return { status: "unavailable" };
  }

  const expectedContentVersionId =
    typeof input.expectedContentVersionId === "string" ? input.expectedContentVersionId : null;

  if (expectedContentVersionId !== resolved.contentVersionId) {
    return { status: "stale" };
  }

  const outcome = await recordInterviewEvidence({
    problemId: input.problemId,
    pattern: resolved.problem.group,
    contentVersionId: resolved.contentVersionId,
    problemVersion: resolved.problem.version,
    unseen: input.unseen,
    mode: input.mode,
    correct: input.correct,
    hintsUsed: input.hintsUsed,
    context: input.context,
    followUpResult: input.followUpResult,
    timeToApproachSeconds: input.timeToApproachSeconds,
    timeToImplementationSeconds: input.timeToImplementationSeconds
  });

  if (outcome === "ok") return { status: "ok" };
  if (outcome === "signed_out") return { status: "signed_out" };
  return { status: "error" };
}
