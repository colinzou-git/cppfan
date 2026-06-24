// Server-only persistence for per-learner Project Labs completion (#439).
// Best effort and never throws: no-ops when Supabase is unconfigured, the learner
// is signed out, or the table is not migrated, so /labs still renders signed-out
// and pre-migration. Progress is the learner's own self-reported state (RLS-own).
import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";
import { getProjectLabById } from "./project-labs";
import { recordSkillEvents, type RecordSkillEventInput } from "@/features/events/event-service";

export type ProjectProgressStatus = "not_started" | "in_progress" | "completed";

export type ProjectProgress = {
  project_id: string;
  status: ProjectProgressStatus;
  completed_at: string | null;
};

export type ProjectWriteOutcome =
  | "ok"
  | "signed_out"
  | "invalid_project"
  | "unavailable"
  | "error";

const PROGRESS_COLUMNS = "project_id,status,completed_at";

/** All project progress rows for the signed-in learner (empty when signed out). */
export async function getProjectProgressForUser(): Promise<ProjectProgress[]> {
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
    .from("project_lab_progress")
    .select(PROGRESS_COLUMNS)
    .eq("user_id", user.id);

  if (error || !data) {
    return [];
  }
  return data as ProjectProgress[];
}

/**
 * Mark a whole project complete for the signed-in learner. Idempotent on
 * (user_id, project_id). `signed_out` covers both unconfigured (demo) and
 * signed-out so the UI can prompt to sign in; `invalid_project` is an unknown id.
 */
export async function markProjectCompleteForUser(input: {
  projectId: string;
}): Promise<ProjectWriteOutcome> {
  const project = getProjectLabById(input.projectId);
  if (!project) {
    return "invalid_project";
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

  const now = new Date().toISOString();
  const { error } = await supabase.from("project_lab_progress").upsert(
    {
      user_id: user.id,
      project_id: project.id,
      status: "completed",
      completed_at: now,
      updated_at: now
    },
    { onConflict: "user_id,project_id" }
  );

  if (error) {
    if (isMissingObjectError(error)) {
      return "unavailable";
    }
    console.error(`[project-progress] write failed (code=${error.code ?? "none"})`);
    return "error";
  }

  const events: RecordSkillEventInput[] = [
    {
      eventType: "completion_submitted",
      metadata: { project_id: project.id, source: "project_lab", scope: "project" }
    }
  ];
  await recordSkillEvents(events);
  return "ok";
}
