import { isMissingObjectError, logConfiguredFailure } from "@/lib/supabase/errors";
import { emptyGoalReadModel, loadGoalQueryCore } from "./goal-query-core";
import { toGoalView, toTargetView, type TargetRow } from "./goal-query-rows";
import type { StudyGoalReadModel, StudyGoalTargetView } from "./goal-view-types";

export async function getStudyGoalReadModel(): Promise<StudyGoalReadModel> {
  const core = await loadGoalQueryCore();
  if (core.state !== "ready") return emptyGoalReadModel(core.state, core.authenticated);
  if (core.goals.length === 0) return emptyGoalReadModel("ready", true);

  const currentRevisionNumber = new Map(core.goals.map((goal) => [goal.id, goal.current_revision]));
  const revisionByGoal = new Map(
    core.revisions
      .filter((revision) => revision.revision_number === currentRevisionNumber.get(revision.goal_id))
      .map((revision) => [revision.goal_id, revision])
  );
  const revisionIds = [...revisionByGoal.values()].map((revision) => revision.id);
  const targetsByRevision = new Map<string, StudyGoalTargetView[]>();

  if (revisionIds.length > 0) {
    const targetsResult = await core.supabase
      .from("study_goal_targets")
      .select("id,goal_id,revision_id,target_kind,target_reference_id,skill_id,title_snapshot,order_index,weight,acquisition_contract_id,acquisition_contract_version,source,baseline_acquisition_state")
      .eq("user_id", core.userId)
      .in("revision_id", revisionIds)
      .order("order_index", { ascending: true })
      .limit(500);

    if (targetsResult.error) {
      if (isMissingObjectError(targetsResult.error)) return emptyGoalReadModel("unavailable", true);
      logConfiguredFailure("study-goal-targets", targetsResult.error);
      return emptyGoalReadModel("error", true);
    }

    for (const row of (targetsResult.data ?? []) as TargetRow[]) {
      targetsByRevision.set(row.revision_id, [
        ...(targetsByRevision.get(row.revision_id) ?? []),
        toTargetView(row)
      ]);
    }
  }

  const views = core.goals.flatMap((goal) => {
    const revision = revisionByGoal.get(goal.id);
    return revision ? [toGoalView(goal, revision, targetsByRevision.get(revision.id) ?? [])] : [];
  });

  return {
    state: "ready",
    authenticated: true,
    active: views.filter((goal) => goal.status === "active"),
    history: views.filter((goal) => goal.status !== "active")
  };
}
