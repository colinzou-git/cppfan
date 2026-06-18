"use server";

import { revalidatePath } from "next/cache";
import { setMilestoneProgress, type MilestoneStatus } from "./milestone-progress";
import type { CapstoneActionResult } from "./capstone-action-types";

/**
 * Set the signed-in learner's status for one capstone milestone (start / complete
 * / reopen, with an optional reflection). Self-reported progress under RLS;
 * suggestion-only — it never auto-declares mastery. `signed_out` lets the UI
 * prompt to sign in instead of failing.
 */
export async function setMilestone(input: {
  milestoneId: string;
  status: MilestoneStatus;
  reflection?: string | null;
}): Promise<CapstoneActionResult> {
  const milestoneId = typeof input?.milestoneId === "string" ? input.milestoneId : "";
  const status: MilestoneStatus = input?.status === "completed" ? "completed" : "started";
  if (!milestoneId) {
    return { status: "error" };
  }

  const outcome = await setMilestoneProgress({
    milestoneId,
    status,
    reflection: typeof input?.reflection === "string" ? input.reflection : null
  });

  if (outcome === "ok") {
    revalidatePath("/labs");
    return { status: "ok" };
  }
  if (outcome === "signed_out") {
    return { status: "signed_out" };
  }
  if (outcome === "unavailable") {
    return { status: "unavailable" };
  }
  return { status: "error" };
}
