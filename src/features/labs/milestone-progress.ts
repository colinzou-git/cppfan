// Server-only persistence for per-learner capstone milestone progress (#130).
// Best effort and never throws: no-ops when Supabase is unconfigured, the learner
// is signed out, or the table is not migrated, so /labs still renders signed-out
// and pre-migration. Progress is the learner's own self-reported state (RLS-own).
import { createClient } from "@/lib/supabase/server";
import { getCapstoneMilestone, getCapstoneProjectIdForMilestone } from "./capstone-tracks";

export type MilestoneStatus = "started" | "completed";

export type MilestoneProgress = {
  milestone_id: string;
  project_id: string;
  status: MilestoneStatus;
  reflection: string | null;
};

const PROGRESS_COLUMNS = "milestone_id,project_id,status,reflection";

/** All milestone progress rows for the signed-in learner (empty when signed out). */
export async function getMilestoneProgressForUser(): Promise<MilestoneProgress[]> {
  const supabase = await createClient();
  if (!supabase) {
    return [];
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("capstone_milestone_progress")
    .select(PROGRESS_COLUMNS)
    .eq("user_id", user.id);

  if (error || !data) {
    return [];
  }
  return data as MilestoneProgress[];
}

/**
 * Upsert the learner's progress for one milestone. Idempotent on
 * (user_id, milestone_id); completing stamps completed_at. Returns whether the
 * write succeeded. No-ops for an unknown milestone id.
 */
export async function setMilestoneProgress(input: {
  milestoneId: string;
  status: MilestoneStatus;
  reflection?: string | null;
}): Promise<boolean> {
  const milestone = getCapstoneMilestone(input.milestoneId);
  if (!milestone) {
    return false;
  }

  const supabase = await createClient();
  if (!supabase) {
    return false;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return false;
  }

  const projectId = getCapstoneProjectIdForMilestone(input.milestoneId) ?? milestone.id;
  const now = new Date().toISOString();

  const { error } = await supabase.from("capstone_milestone_progress").upsert(
    {
      user_id: user.id,
      milestone_id: input.milestoneId,
      project_id: projectId,
      status: input.status,
      verification: milestone.verification,
      reflection: input.reflection ?? null,
      completed_at: input.status === "completed" ? now : null
    },
    { onConflict: "user_id,milestone_id" }
  );

  return !error;
}
