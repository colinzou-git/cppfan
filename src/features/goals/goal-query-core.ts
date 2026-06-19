import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError, logConfiguredFailure } from "@/lib/supabase/errors";
import type { StudyGoalReadModel } from "./goal-view-types";
import type { GoalRow, RevisionRow } from "./goal-query-rows";

export type GoalQueryCore =
  | { state: "ready"; supabase: SupabaseClient; userId: string; goals: GoalRow[]; revisions: RevisionRow[] }
  | { state: Exclude<StudyGoalReadModel["state"], "ready">; authenticated: boolean };

export function emptyGoalReadModel(
  state: StudyGoalReadModel["state"],
  authenticated: boolean
): StudyGoalReadModel {
  return { state, authenticated, active: [], history: [] };
}

export async function loadGoalQueryCore(): Promise<GoalQueryCore> {
  const supabase = await createClient();
  if (!supabase) return { state: "unconfigured", authenticated: false };

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return { state: "signed_out", authenticated: false };

  const goalsResult = await supabase
    .from("study_goals")
    .select("id,title,status,current_revision,created_at,updated_at")
    .eq("user_id", auth.user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (goalsResult.error) {
    if (isMissingObjectError(goalsResult.error)) return { state: "unavailable", authenticated: true };
    logConfiguredFailure("study-goals", goalsResult.error);
    return { state: "error", authenticated: true };
  }

  const goals = (goalsResult.data ?? []) as GoalRow[];
  if (goals.length === 0) return { state: "ready", supabase, userId: auth.user.id, goals, revisions: [] };

  const revisionsResult = await supabase
    .from("study_goal_revisions")
    .select("id,goal_id,revision_number,start_local_date,end_local_date,timezone,recommendation_source,recommendation_reason,learner_note")
    .eq("user_id", auth.user.id)
    .in("goal_id", goals.map((goal) => goal.id))
    .order("revision_number", { ascending: false })
    .limit(200);

  if (revisionsResult.error) {
    if (isMissingObjectError(revisionsResult.error)) return { state: "unavailable", authenticated: true };
    logConfiguredFailure("study-goal-revisions", revisionsResult.error);
    return { state: "error", authenticated: true };
  }

  return {
    state: "ready",
    supabase,
    userId: auth.user.id,
    goals,
    revisions: (revisionsResult.data ?? []) as RevisionRow[]
  };
}
