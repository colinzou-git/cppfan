"use server";

import { saveDiagnosticScores } from "./diagnostic-store";
import type { DiagnosticActionResult } from "./diagnostic-action-types";

export async function saveDiagnostic(
  scores: Record<string, number>,
  submissionId?: string
): Promise<DiagnosticActionResult> {
  if (!scores || typeof scores !== "object") {
    return { status: "error" };
  }
  const id = submissionId && submissionId.length >= 8 ? submissionId : `legacy-${Date.now()}`;
  return saveDiagnosticScores(scores, id);
}
