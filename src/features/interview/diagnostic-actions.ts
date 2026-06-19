"use server";

import { saveDiagnosticScores } from "./diagnostic-store";
import type { DiagnosticActionResult } from "./diagnostic-action-types";

export async function saveDiagnostic(
  scores: Record<string, number>,
  submissionId: string
): Promise<DiagnosticActionResult> {
  if (!scores || typeof scores !== "object" || typeof submissionId !== "string" || submissionId.length < 8) {
    return { status: "error" };
  }
  return saveDiagnosticScores(scores, submissionId);
}
