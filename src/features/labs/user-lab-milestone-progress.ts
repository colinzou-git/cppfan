"use server";

import { createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";
import { getLabForOwner } from "@/features/user-content/user-content-queries";
import { labMilestoneViews } from "@/features/user-content/lab-code-lab";
import {
  contentIdFromUserItemId,
  isUserLearningItemId
} from "@/features/user-content/user-content-id";
import { CODE_LAB_STALE_NOTE } from "@/features/code-lab/code-lab-item-resolver";

export type UserLabMilestoneProgress = {
  milestoneId: string;
  milestoneIndex: number | null;
  codeSnapshotHash: string;
  passedAt: string;
};

export type RecordLabMilestonePassResult =
  | { status: "saved"; progress: UserLabMilestoneProgress }
  | { status: "stale_definition"; message: string }
  | { status: "invalid_milestone"; message: string }
  | { status: "signed_out"; message: string }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

export async function recordLabMilestonePass(input: {
  itemId: string;
  expectedContentVersionId: string;
  milestoneId: string;
  milestoneIndex: number;
  source: string;
}): Promise<RecordLabMilestonePassResult> {
  if (
    !input?.itemId ||
    !isUserLearningItemId(input.itemId) ||
    !input.expectedContentVersionId ||
    !input.milestoneId ||
    !Number.isInteger(input.milestoneIndex) ||
    input.milestoneIndex < 0 ||
    typeof input.source !== "string" ||
    !input.source.trim()
  ) {
    return {
      status: "invalid_milestone",
      message: "A valid milestone, published version, and passing source are required."
    };
  }
  const contentId = contentIdFromUserItemId(input.itemId);
  if (!contentId) {
    return {
      status: "invalid_milestone",
      message: "The milestone definition is invalid."
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { status: "signed_out", message: "Sign in to save milestone progress." };
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "signed_out", message: "Sign in to save milestone progress." };
  }

  const detail = await getLabForOwner(contentId);
  if (!detail?.publishedPayload || !detail.publishedVersionId) {
    return { status: "unavailable", message: "This lab is no longer available." };
  }
  if (detail.publishedVersionId !== input.expectedContentVersionId) {
    return { status: "stale_definition", message: CODE_LAB_STALE_NOTE };
  }

  const milestones = labMilestoneViews(detail.publishedPayload);
  const expected = milestones[input.milestoneIndex];
  if (!expected || expected.milestoneId !== input.milestoneId) {
    return {
      status: "invalid_milestone",
      message: "The milestone definition changed. Reload the lab."
    };
  }

  const codeSnapshotHash = createHash("sha256").update(input.source, "utf8").digest("hex");
  const passedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("user_lab_milestone_progress")
    .upsert(
      {
        user_id: user.id,
        learning_item_id: input.itemId,
        content_version_id: detail.publishedVersionId,
        milestone_id: expected.milestoneId,
        milestone_index: expected.index,
        status: "passed",
        evaluation_method: "automated_tests",
        code_snapshot_hash: codeSnapshotHash,
        passed_at: passedAt
      },
      {
        onConflict: "user_id,learning_item_id,content_version_id,milestone_id"
      }
    )
    .select("milestone_id,milestone_index,code_snapshot_hash,passed_at")
    .single();

  if (error || !data) {
    if (error && !isMissingObjectError(error)) {
      console.error(`[user-lab] milestone progress write failed (code=${error.code ?? "none"})`);
    }
    return {
      status: isMissingObjectError(error) ? "unavailable" : "error",
      message: "Milestone progress could not be saved. Retry this passing result."
    };
  }

  return {
    status: "saved",
    progress: {
      milestoneId: data.milestone_id,
      milestoneIndex: data.milestone_index,
      codeSnapshotHash: data.code_snapshot_hash,
      passedAt: data.passed_at
    }
  };
}

export async function getPassedLabMilestones(
  itemId: string,
  contentVersionId?: string | null
): Promise<UserLabMilestoneProgress[]> {
  if (!itemId || !isUserLearningItemId(itemId)) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("user_lab_milestone_progress")
    .select("milestone_id,milestone_index,code_snapshot_hash,passed_at")
    .eq("user_id", user.id)
    .eq("learning_item_id", itemId)
    .eq("status", "passed")
    .not("code_snapshot_hash", "is", null);
  query = contentVersionId
    ? query.eq("content_version_id", contentVersionId)
    : query.is("content_version_id", null);

  const { data, error } = await query;
  if (error || !data) {
    if (error && !isMissingObjectError(error)) {
      console.error(`[user-lab] milestone progress read failed (code=${error.code ?? "none"})`);
    }
    return [];
  }
  return (
    data as Array<{
      milestone_id: string;
      milestone_index: number | null;
      code_snapshot_hash: string | null;
      passed_at: string;
    }>
  )
    .filter(
      (
        row
      ): row is {
        milestone_id: string;
        milestone_index: number | null;
        code_snapshot_hash: string;
        passed_at: string;
      } => /^[0-9a-f]{64}$/.test(row.code_snapshot_hash ?? "")
    )
    .map((row) => ({
      milestoneId: row.milestone_id,
      milestoneIndex: row.milestone_index,
      codeSnapshotHash: row.code_snapshot_hash,
      passedAt: row.passed_at
    }));
}
