// Server-only persistence for per-learner capstone milestone progress (#130).
// Best effort and never throws: no-ops when Supabase is unconfigured, the learner
// is signed out, or the table is not migrated, so /labs still renders signed-out
// and pre-migration. Progress is the learner's own self-reported state (RLS-own).
import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";
import { getCapstoneMilestone, getCapstoneProjectIdForMilestone } from "./capstone-tracks";
import { recordSkillEvents, type RecordSkillEventInput } from "@/features/events/event-service";
import type { CapstoneMilestone } from "./capstone-tracks";

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

/** Typed outcome so the UI can distinguish "sign in to save" from a real error. */
export type MilestoneWriteOutcome = "ok" | "signed_out" | "invalid" | "unavailable" | "error";

type SupabaseWriteError = { code?: string | null } | null | undefined;

const RETRYABLE_UPSERT_CODES = new Set([
  "42P10", // onConflict target missing/stale in PostgREST schema cache.
  "PGRST204" // column metadata stale; retry with the minimal progress row.
]);

export function isRetryableMilestoneUpsertError(error: SupabaseWriteError): boolean {
  return Boolean(error) && RETRYABLE_UPSERT_CODES.has(error?.code ?? "");
}

async function recordMilestoneEvidence(input: {
  milestone: CapstoneMilestone;
  milestoneId: string;
  projectId: string;
  status: MilestoneStatus;
  reflection?: string | null;
}) {
  const metadata = {
    milestone_id: input.milestoneId,
    project_id: input.projectId,
    verification: input.milestone.verification,
    required: input.milestone.required
  };
  const events: RecordSkillEventInput[] = [
    {
      eventType:
        input.status === "completed" ? "capstone_milestone_completed" : "capstone_milestone_started",
      metadata
    }
  ];

  if (input.status === "completed") {
    for (const skillId of input.milestone.practicedSkillIds) {
      events.push({
        eventType: "code_passed",
        skillId,
        metadata: { ...metadata, source: "capstone_milestone" }
      });
    }
  }

  if ((input.reflection ?? "").trim()) {
    events.push({ eventType: "capstone_reflection_submitted", metadata });
  }

  await recordSkillEvents(events);
}

/**
 * Upsert the learner's progress for one milestone. Idempotent on
 * (user_id, milestone_id); completing stamps completed_at. `signed_out` covers
 * both unconfigured (demo) and signed-out so the UI can prompt to sign in;
 * `invalid` is an unknown milestone id.
 */
export async function setMilestoneProgress(input: {
  milestoneId: string;
  status: MilestoneStatus;
  reflection?: string | null;
}): Promise<MilestoneWriteOutcome> {
  const milestone = getCapstoneMilestone(input.milestoneId);
  if (!milestone) {
    return "invalid";
  }

  const supabase = await createClient();
  if (!supabase) {
    return "signed_out";
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return "signed_out";
  }

  const projectId = getCapstoneProjectIdForMilestone(input.milestoneId) ?? milestone.id;
  const now = new Date().toISOString();

  const baseRow = {
    user_id: user.id,
    milestone_id: input.milestoneId,
    project_id: projectId,
    status: input.status,
    reflection: input.reflection ?? null,
    completed_at: input.status === "completed" ? now : null
  };

  const { error } = await supabase.from("capstone_milestone_progress").upsert(
    {
      ...baseRow,
      verification: milestone.verification
    },
    { onConflict: "user_id,milestone_id" }
  );

  if (!error) {
    await recordMilestoneEvidence({ milestone, milestoneId: input.milestoneId, projectId, status: input.status, reflection: input.reflection });
    return "ok";
  }
  if (isMissingObjectError(error)) {
    return "unavailable";
  }
  if (!isRetryableMilestoneUpsertError(error)) {
    console.error(`[capstone-progress] write failed (code=${error.code ?? "none"})`);
    return "error";
  }

  const patch = {
    project_id: projectId,
    status: input.status,
    reflection: input.reflection ?? null,
    completed_at: input.status === "completed" ? now : null
  };
  const updated = await supabase
    .from("capstone_milestone_progress")
    .update(patch)
    .eq("user_id", user.id)
    .eq("milestone_id", input.milestoneId)
    .select("milestone_id");

  if (updated.error) {
    if (isMissingObjectError(updated.error)) {
      return "unavailable";
    }
    console.error(`[capstone-progress] fallback update failed (code=${updated.error.code ?? "none"})`);
    return "error";
  }
  if ((updated.data ?? []).length > 0) {
    await recordMilestoneEvidence({ milestone, milestoneId: input.milestoneId, projectId, status: input.status, reflection: input.reflection });
    return "ok";
  }

  const inserted = await supabase.from("capstone_milestone_progress").insert(baseRow);
  if (!inserted.error) {
    await recordMilestoneEvidence({ milestone, milestoneId: input.milestoneId, projectId, status: input.status, reflection: input.reflection });
    return "ok";
  }
  if (isMissingObjectError(inserted.error)) {
    return "unavailable";
  }
  console.error(`[capstone-progress] fallback insert failed (code=${inserted.error.code ?? "none"})`);
  return "error";
}
