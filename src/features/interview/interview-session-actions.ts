"use server";

import { saveCurrentSession } from "./interview-session-store";
import type { SessionState } from "./session-machine";
import type { InterviewSessionActionResult } from "./interview-session-action-types";

/**
 * Persist the learner's current interview session state (#177) so progress
 * survives a refresh. Self-reported practice state under RLS; `signed_out` lets
 * the runner keep working locally and prompt to sign in to save.
 */
export async function saveSession(state: SessionState): Promise<InterviewSessionActionResult> {
  if (!state || typeof state.problemId !== "string" || !state.problemId) {
    return { status: "error" };
  }
  const outcome = await saveCurrentSession(state);
  if (outcome === "ok") {
    return { status: "ok" };
  }
  if (outcome === "signed_out") {
    return { status: "signed_out" };
  }
  return { status: "error" };
}
