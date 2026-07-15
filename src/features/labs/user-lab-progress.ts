"use server";

/*
 * Persist completion of a user-created project lab (#489). When a learner passes
 * every required milestone, the lab is marked complete in the shared
 * project_lab_progress table (keyed by the user.item learning-item id) and a
 * completion_submitted skill event is recorded against the lab's owner skill, so
 * the lab participates in the mastery/FSRS learning loop like native work.
 * Owner-scoped RLS on project_lab_progress keeps the row private.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";
import { recordSkillEvents, type RecordSkillEventInput } from "@/features/events/event-service";
import { contentIdFromUserItemId, isUserLearningItemId, userSkillId } from "@/features/user-content/user-content-id";
import type { ProjectActionResult } from "./project-action-types";

export async function markUserLabComplete(input: { itemId: string }): Promise<ProjectActionResult> {
  const itemId = typeof input?.itemId === "string" ? input.itemId : "";
  if (!itemId || !isUserLearningItemId(itemId)) {
    return { status: "invalid_project" };
  }
  const contentId = contentIdFromUserItemId(itemId);
  if (!contentId) {
    return { status: "invalid_project" };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { status: "signed_out" };
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "signed_out" };
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("project_lab_progress").upsert(
    {
      user_id: user.id,
      project_id: itemId,
      status: "completed",
      completed_at: now,
      updated_at: now
    },
    { onConflict: "user_id,project_id" }
  );
  if (error) {
    if (isMissingObjectError(error)) {
      return { status: "unavailable" };
    }
    console.error(`[user-lab-progress] write failed (code=${error.code ?? "none"})`);
    return { status: "error" };
  }

  const events: RecordSkillEventInput[] = [
    {
      eventType: "completion_submitted",
      skillId: userSkillId(contentId),
      metadata: { project_id: itemId, source: "user_lab", scope: "project" }
    }
  ];
  await recordSkillEvents(events);

  revalidatePath("/labs");
  return { status: "ok" };
}
