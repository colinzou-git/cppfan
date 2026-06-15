"use server";

import { recordInterviewEvidence, type EvidenceInput } from "./interview-evidence-store";
import type { EvidenceActionResult } from "./interview-evidence-action-types";

/**
 * Log one self-reported interview practice outcome (#180) so the readiness report
 * can reflect recent recovery and transfer to unseen problems. Self-reported
 * evidence under RLS, separate from FSRS; `signed_out` prompts the learner to sign
 * in to keep their evidence.
 */
export async function logInterviewEvidence(input: EvidenceInput): Promise<EvidenceActionResult> {
  if (!input || typeof input.pattern !== "string" || typeof input.problemId !== "string") {
    return { status: "error" };
  }
  const outcome = await recordInterviewEvidence(input);
  if (outcome === "ok") {
    return { status: "ok" };
  }
  if (outcome === "signed_out") {
    return { status: "signed_out" };
  }
  return { status: "error" };
}
