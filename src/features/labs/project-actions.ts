"use server";

import { revalidatePath } from "next/cache";
import { markProjectCompleteForUser } from "./project-progress";
import type { ProjectActionResult } from "./project-action-types";

/**
 * Mark a whole Project Labs project complete for the signed-in learner (#439).
 * Self-reported, RLS-owned progress; `signed_out` lets the UI prompt to sign in
 * instead of failing. Project code is compiled as one codebase — this is the
 * manual "I finished the project" signal, distinct from inferred milestones.
 */
export async function markProjectComplete(input: {
  projectId: string;
}): Promise<ProjectActionResult> {
  const projectId = typeof input?.projectId === "string" ? input.projectId : "";
  if (!projectId) {
    return { status: "invalid_project" };
  }

  const outcome = await markProjectCompleteForUser({ projectId });

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
  if (outcome === "invalid_project") {
    return { status: "invalid_project" };
  }
  return { status: "error" };
}
