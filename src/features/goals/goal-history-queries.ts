import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError, logConfiguredFailure } from "@/lib/supabase/errors";
import { toGoalView, toTargetView, type GoalRow, type RevisionRow, type TargetRow } from "./goal-query-rows";
import type { StudyGoalReadModel, StudyGoalTargetView, StudyGoalView } from "./goal-view-types";

export type StudyGoalHistoryPage = {
  state: StudyGoalReadModel["state"];
  authenticated: boolean;
  items: StudyGoalView[];
  nextCursor: string | null;
};

export type StudyGoalRevisionTimelineItem = {
  id: string;
  revisionNumber: number;
  startLocalDate: string;
  endLocalDate: string;
  timezone: string;
  recommendationSource: string;
  recommendationReason: string | null;
};

export async function getStudyGoalRevisionTimeline(goalId: string, limit = 20) {
  const supabase = await createClient();
  if (!supabase) return [] as StudyGoalRevisionTimelineItem[];
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [] as StudyGoalRevisionTimelineItem[];
  const result = await supabase.from("study_goal_revisions")
    .select("id,revision_number,start_local_date,end_local_date,timezone,recommendation_source,recommendation_reason")
    .eq("user_id", auth.user.id)
    .eq("goal_id", goalId)
    .order("revision_number", { ascending: false })
    .limit(Math.max(1, Math.min(50, limit)));
  if (result.error) {
    logConfiguredFailure("study-goal-revision-timeline", result.error);
    return [] as StudyGoalRevisionTimelineItem[];
  }
  return (result.data ?? []).map((row) => ({
    id: String(row.id),
    revisionNumber: Number(row.revision_number),
    startLocalDate: String(row.start_local_date),
    endLocalDate: String(row.end_local_date),
    timezone: String(row.timezone),
    recommendationSource: String(row.recommendation_source),
    recommendationReason: row.recommendation_reason ? String(row.recommendation_reason) : null
  }));
}

const emptyPage = (
  state: StudyGoalHistoryPage["state"],
  authenticated: boolean
): StudyGoalHistoryPage => ({ state, authenticated, items: [], nextCursor: null });

export function normalizeGoalHistoryPageSize(value: number) {
  return Math.max(1, Math.min(50, Math.floor(value) || 20));
}

export function parseGoalHistoryCursor(cursor?: string | null) {
  if (!cursor) return 0;
  const value = Number(cursor);
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export async function getStudyGoalHistoryPage({
  cursor,
  pageSize = 20
}: {
  cursor?: string | null;
  pageSize?: number;
} = {}): Promise<StudyGoalHistoryPage> {
  const supabase = await createClient();
  if (!supabase) return emptyPage("unconfigured", false);
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return emptyPage("signed_out", false);

  const size = normalizeGoalHistoryPageSize(pageSize);
  const offset = parseGoalHistoryCursor(cursor);
  const goalsResult = await supabase
    .from("study_goals")
    .select("id,title,status,current_revision,created_at,updated_at")
    .eq("user_id", auth.user.id)
    .neq("status", "active")
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .range(offset, offset + size);

  if (goalsResult.error) {
    if (isMissingObjectError(goalsResult.error)) return emptyPage("unavailable", true);
    logConfiguredFailure("study-goal-history", goalsResult.error);
    return emptyPage("error", true);
  }

  const fetched = (goalsResult.data ?? []) as GoalRow[];
  const hasMore = fetched.length > size;
  const goals = fetched.slice(0, size);
  if (goals.length === 0) return emptyPage("ready", true);

  const revisionsResult = await supabase
    .from("study_goal_revisions")
    .select("id,goal_id,revision_number,start_local_date,end_local_date,timezone,recommendation_source,recommendation_reason,learner_note")
    .eq("user_id", auth.user.id)
    .in("goal_id", goals.map((goal) => goal.id))
    .order("revision_number", { ascending: false })
    .limit(goals.length * 30);
  if (revisionsResult.error) {
    if (isMissingObjectError(revisionsResult.error)) return emptyPage("unavailable", true);
    logConfiguredFailure("study-goal-history-revisions", revisionsResult.error);
    return emptyPage("error", true);
  }

  const revisionByGoal = new Map(
    ((revisionsResult.data ?? []) as RevisionRow[])
      .filter((revision) => revision.revision_number === goals.find((goal) => goal.id === revision.goal_id)?.current_revision)
      .map((revision) => [revision.goal_id, revision])
  );
  const revisionIds = [...revisionByGoal.values()].map((revision) => revision.id);
  const targetsByRevision = new Map<string, StudyGoalTargetView[]>();
  if (revisionIds.length > 0) {
    const targetsResult = await supabase
      .from("study_goal_targets")
      .select("id,goal_id,revision_id,target_kind,target_reference_id,skill_id,title_snapshot,order_index,weight,acquisition_contract_id,acquisition_contract_version,source,baseline_acquisition_state")
      .eq("user_id", auth.user.id)
      .in("revision_id", revisionIds)
      .order("order_index", { ascending: true })
      .limit(size * 20);
    if (targetsResult.error) {
      if (isMissingObjectError(targetsResult.error)) return emptyPage("unavailable", true);
      logConfiguredFailure("study-goal-history-targets", targetsResult.error);
      return emptyPage("error", true);
    }
    for (const row of (targetsResult.data ?? []) as TargetRow[]) {
      targetsByRevision.set(row.revision_id, [...(targetsByRevision.get(row.revision_id) ?? []), toTargetView(row)]);
    }
  }

  return {
    state: "ready",
    authenticated: true,
    items: goals.flatMap((goal) => {
      const revision = revisionByGoal.get(goal.id);
      return revision ? [toGoalView(goal, revision, targetsByRevision.get(revision.id) ?? [])] : [];
    }),
    nextCursor: hasMore ? String(offset + size) : null
  };
}
