"use server";

import { saveDiagnosticScores } from "./diagnostic-store";
import type { DiagnosticActionResult } from "./diagnostic-action-types";

/**
 * Persist the learner's baseline diagnostic scores (#175/#182) so the heat map
 * survives a refresh and can anchor diagnostic-vs-current readiness. Self-reported
 * evidence under RLS; `signed_out` lets the UI keep the local heat map and prompt
 * to sign in to save.
 */
export async function saveDiagnostic(scores: Record<string, number>): Promise<DiagnosticActionResult> {
  if (!scores || typeof scores !== "object") {
    return { status: "error" };
  }
  const outcome = await saveDiagnosticScores(scores);
  if (outcome === "ok") {
    return { status: "ok" };
  }
  if (outcome === "signed_out") {
    return { status: "signed_out" };
  }
  return { status: "error" };
}
