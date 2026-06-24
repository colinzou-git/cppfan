// Server-only per-learner write-code exercise progress (#128). Best effort and
// never throws: no-ops signed-out / unconfigured / pre-migration so /exercises
// still renders. Self-reported state under RLS, separate from FSRS; completion
// records code_passed evidence but never auto-declares mastery.
import { createClient } from "@/lib/supabase/server";
import { recordSkillEvents } from "@/features/events/event-service";
import { getExerciseById } from "./exercise-catalog";
import { writeCodeEvents, type ExerciseStatus } from "./exercise-evidence";

export type ExerciseProgress = {
  exercise_id: string;
  status: ExerciseStatus;
  reflection: string | null;
};

export type ExerciseWriteOutcome = "ok" | "signed_out" | "invalid" | "error";

const COLUMNS = "exercise_id,status,reflection";

/** All exercise progress rows for the signed-in learner (empty when signed out). */
export async function getExerciseProgressForUser(): Promise<ExerciseProgress[]> {
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
    .from("exercise_progress")
    .select(COLUMNS)
    .eq("user_id", user.id);
  if (error || !data) {
    return [];
  }
  return data as ExerciseProgress[];
}

/**
 * Upsert the learner's progress for one exercise and record its write-code
 * evidence (code_attempted on start, code_passed on completion, per practiced
 * skill). Idempotent on (user_id, exercise_id).
 */
export async function setExerciseProgress(input: {
  exerciseId: string;
  status: ExerciseStatus;
  reflection?: string | null;
  /**
   * Record write-code skill events for this write (#440). Defaults to true for
   * explicit learner actions; pass false when auto-completing from a passing
   * Code Lab test, which already records deterministic attempt evidence.
   */
  recordEvents?: boolean;
}): Promise<ExerciseWriteOutcome> {
  if (!getExerciseById(input.exerciseId)) {
    return "invalid";
  }
  const shouldRecordEvents = input.recordEvents ?? true;

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
  // Omit reflection when not provided so a conflict update preserves any existing
  // learner reflection (e.g. auto-completion from a passing Code Lab test). On
  // first insert the column falls back to its default.
  const row: Record<string, unknown> = {
    user_id: user.id,
    exercise_id: input.exerciseId,
    status: input.status,
    completed_at: input.status === "completed" ? now : null,
    updated_at: now
  };
  if (input.reflection !== undefined) {
    row.reflection = input.reflection;
  }
  const { error } = await supabase.from("exercise_progress").upsert(row, {
    onConflict: "user_id,exercise_id"
  });
  if (error) {
    return "error";
  }

  // Best-effort mastery evidence (separate from FSRS). Skipped for auto-completion
  // from Code Lab tests, which already record deterministic attempt evidence.
  if (shouldRecordEvents) {
    await recordSkillEvents(writeCodeEvents(input.exerciseId, input.status));
  }
  return "ok";
}
