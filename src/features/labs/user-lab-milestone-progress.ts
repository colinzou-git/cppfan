"use server";

/*
 * Durable per-milestone progress for user-created labs (#610). Best-effort and
 * RLS-owned like the other lab progress stores: every path returns quietly (null
 * / false / []) when Supabase is unconfigured, the learner is signed out, or the
 * table is not migrated yet, so the lab still works in-session-only. user_id is
 * stamped from the session; the client never supplies it. Progress is keyed by
 * the stable milestone id + immutable content version, so an old-version pass is
 * never reinterpreted as current.
 */

import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";
import { isUserLearningItemId } from "@/features/user-content/user-content-id";

export type LabMilestonePassInput = {
  itemId: string;
  contentVersionId?: string | null;
  milestoneId: string;
  milestoneIndex?: number | null;
  evaluationMethod?: string;
  codeSnapshotHash?: string | null;
};

/** Record a durable milestone pass. Returns false (never throws) on any failure. */
export async function recordLabMilestonePass(input: LabMilestonePassInput): Promise<boolean> {
  if (!input?.itemId || !isUserLearningItemId(input.itemId) || !input.milestoneId) {
    return false;
  }
  const supabase = await createClient();
  if (!supabase) return false;
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from("user_lab_milestone_progress").upsert(
    {
      user_id: user.id,
      learning_item_id: input.itemId,
      content_version_id: input.contentVersionId ?? null,
      milestone_id: input.milestoneId,
      milestone_index: input.milestoneIndex ?? null,
      status: "passed",
      evaluation_method: input.evaluationMethod ?? "automated_tests",
      code_snapshot_hash: input.codeSnapshotHash ?? null,
      passed_at: new Date().toISOString()
    },
    { onConflict: "user_id,learning_item_id,content_version_id,milestone_id" }
  );
  if (error) {
    if (!isMissingObjectError(error)) {
      console.error(`[user-lab] milestone progress write failed (code=${error.code ?? "none"})`);
    }
    return false;
  }
  return true;
}

/**
 * Stable milestone ids the learner has durably passed for THIS content version
 * (#610/#612). Returns [] signed-out / unconfigured / pre-migration, so hydration
 * simply falls back to in-session progress.
 */
export async function getPassedLabMilestones(itemId: string, contentVersionId?: string | null): Promise<string[]> {
  if (!itemId || !isUserLearningItemId(itemId)) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("user_lab_milestone_progress")
    .select("milestone_id")
    .eq("user_id", user.id)
    .eq("learning_item_id", itemId)
    .eq("status", "passed");
  query = contentVersionId ? query.eq("content_version_id", contentVersionId) : query.is("content_version_id", null);

  const { data, error } = await query;
  if (error || !data) {
    if (error && !isMissingObjectError(error)) {
      console.error(`[user-lab] milestone progress read failed (code=${error.code ?? "none"})`);
    }
    return [];
  }
  return [...new Set((data as Array<{ milestone_id: string }>).map((r) => r.milestone_id))];
}
