"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";
import { getLabForOwner } from "@/features/user-content/user-content-queries";
import {
  contentIdFromUserItemId,
  isUserLearningItemId,
  userSkillId
} from "@/features/user-content/user-content-id";
import type { ProjectActionResult } from "./project-action-types";

export type PersistUserLabCompletionResult =
  | { status: "completed" }
  | { status: "already_completed" }
  | { status: "signed_out"; message: string }
  | { status: "save_error"; message: string };

/**
 * Lower-level completion persistence for already-authoritative evaluation
 * paths. Automated milestone labs call completeUserLab instead.
 */
export async function persistUserLabVersionCompletion(input: {
  itemId: string;
  contentVersionId: string;
  skillId: string;
  metadata?: Record<string, unknown>;
}): Promise<PersistUserLabCompletionResult> {
  const supabase = await createClient();
  if (!supabase) {
    return { status: "signed_out", message: "Sign in to save lab completion." };
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "signed_out", message: "Sign in to save lab completion." };
  }

  const { data, error } = await supabase.rpc("complete_user_lab_version", {
    p_project_id: input.itemId,
    p_content_version_id: input.contentVersionId,
    p_skill_id: input.skillId,
    p_metadata: input.metadata ?? {}
  });
  if (error) {
    if (!isMissingObjectError(error)) {
      console.error(`[user-lab-progress] completion RPC failed (code=${error.code ?? "none"})`);
    }
    return {
      status: "save_error",
      message: isMissingObjectError(error)
        ? "Lab completion needs the latest database migration."
        : "Lab completion could not be saved. Retry completion."
    };
  }
  if (data === "completed" || data === "already_completed") {
    revalidatePath("/labs");
    return { status: data };
  }
  return {
    status: "save_error",
    message: "Lab completion returned an unexpected result."
  };
}

/**
 * Completion path for formal self/AI evaluation modes. These modes intentionally
 * use their own authoritative evaluator and must not be forced through automated
 * milestone cumulative tests.
 */
export async function markUserLabComplete(input: {
  itemId: string;
  contentVersionId?: string | null;
  evaluationMode?: string;
}): Promise<ProjectActionResult> {
  const itemId = typeof input?.itemId === "string" ? input.itemId : "";
  if (!itemId || !isUserLearningItemId(itemId)) {
    return { status: "invalid_project" };
  }
  const contentId = contentIdFromUserItemId(itemId);
  if (!contentId) return { status: "invalid_project" };
  const detail = await getLabForOwner(contentId);
  const currentVersion = detail?.publishedVersionId;
  if (!detail?.publishedPayload || !currentVersion) {
    return { status: "unavailable" };
  }
  if (input.contentVersionId && input.contentVersionId !== currentVersion) {
    return { status: "unavailable" };
  }

  const result = await persistUserLabVersionCompletion({
    itemId,
    contentVersionId: currentVersion,
    skillId: userSkillId(contentId),
    metadata: { evaluationMode: input.evaluationMode ?? null }
  });
  if (result.status === "completed" || result.status === "already_completed") {
    return { status: "ok" };
  }
  if (result.status === "signed_out") return { status: "signed_out" };
  return { status: "error" };
}
