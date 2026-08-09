"use server";

import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";
import { getLabForOwner } from "@/features/user-content/user-content-queries";
import { labMilestoneViews } from "@/features/user-content/lab-code-lab";
import {
  contentIdFromUserItemId,
  isUserLearningItemId,
  userSkillId
} from "@/features/user-content/user-content-id";
import { validateLabCumulativeAgainstPayload } from "./lab-cumulative-validation";
import { persistUserLabVersionCompletion } from "./user-lab-progress";

export type CompleteUserLabResult =
  | { status: "completed" }
  | { status: "already_completed" }
  | { status: "missing_milestone_evidence"; milestoneIds: string[] }
  | { status: "regressed"; milestoneIds: string[] }
  | { status: "stale_definition" }
  | { status: "validation_unavailable"; message: string }
  | { status: "invalid_definition"; message: string }
  | { status: "signed_out"; message: string }
  | { status: "save_error"; message: string };

export async function completeUserLab(input: {
  itemId: string;
  expectedContentVersionId: string;
  source: string;
}): Promise<CompleteUserLabResult> {
  if (
    !input?.itemId ||
    !isUserLearningItemId(input.itemId) ||
    !input.expectedContentVersionId ||
    typeof input.source !== "string" ||
    !input.source.trim()
  ) {
    return {
      status: "invalid_definition",
      message: "Current source and a published lab version are required."
    };
  }
  const contentId = contentIdFromUserItemId(input.itemId);
  if (!contentId) {
    return {
      status: "invalid_definition",
      message: "The lab definition is invalid."
    };
  }

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

  const detail = await getLabForOwner(contentId);
  if (!detail?.publishedPayload || !detail.publishedVersionId) {
    return {
      status: "validation_unavailable",
      message: "This lab is no longer available."
    };
  }
  if (detail.publishedVersionId !== input.expectedContentVersionId) {
    return { status: "stale_definition" };
  }

  const requiredIds = labMilestoneViews(detail.publishedPayload)
    .filter((milestone) => milestone.required)
    .map((milestone) => milestone.milestoneId);
  const { data: evidence, error: evidenceError } = await supabase
    .from("user_lab_milestone_progress")
    .select("milestone_id,code_snapshot_hash")
    .eq("user_id", user.id)
    .eq("learning_item_id", input.itemId)
    .eq("content_version_id", detail.publishedVersionId)
    .eq("status", "passed")
    .not("code_snapshot_hash", "is", null);
  if (evidenceError) {
    return {
      status: "save_error",
      message: isMissingObjectError(evidenceError)
        ? "Milestone evidence needs the latest database migration."
        : "Saved milestone evidence could not be checked."
    };
  }
  const savedIds = new Set(
    (evidence ?? [])
      .filter((row) => /^[0-9a-f]{64}$/.test(row.code_snapshot_hash ?? ""))
      .map((row) => row.milestone_id)
  );
  const missing = requiredIds.filter((id) => !savedIds.has(id));
  if (missing.length > 0) {
    return { status: "missing_milestone_evidence", milestoneIds: missing };
  }

  const validation = await validateLabCumulativeAgainstPayload({
    payload: detail.publishedPayload,
    source: input.source,
    itemId: input.itemId,
    contentVersionId: detail.publishedVersionId
  });
  if (validation.status === "regressed") {
    return {
      status: "regressed",
      milestoneIds: validation.regressedMilestoneIds
    };
  }
  if (validation.status === "unavailable") {
    return { status: "validation_unavailable", message: validation.message };
  }
  if (validation.status === "invalid_definition") {
    return { status: "invalid_definition", message: validation.message };
  }
  if (validation.status !== "ok") {
    return { status: "stale_definition" };
  }

  const afterValidation = await getLabForOwner(contentId);
  if (afterValidation?.publishedVersionId !== detail.publishedVersionId) {
    return { status: "stale_definition" };
  }

  return persistUserLabVersionCompletion({
    itemId: input.itemId,
    contentVersionId: detail.publishedVersionId,
    skillId: userSkillId(contentId),
    metadata: { evaluationMode: "automated_tests", validatedMilestoneIds: requiredIds }
  });
}
