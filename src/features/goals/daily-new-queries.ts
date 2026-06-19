import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError, logConfiguredFailure } from "@/lib/supabase/errors";
import { localDateKey, nextLocalMidnight } from "@/lib/time/local-day";
import { getProfileForUser } from "@/features/profile/profile-queries";
import { buildDailyNewPlan } from "./daily-new-builder";
import type { DailyNewPlan } from "./daily-new-model";
import { getStudyGoalReadModel } from "./goal-queries";

const QUALIFYING_EVENTS = new Set([
  "lesson_started", "concept_seen", "quiz_correct", "review_completed",
  "code_passed", "worked_example_viewed", "completion_submitted", "parsons_checked"
]);

function emptyPlan(state: DailyNewPlan["state"], authenticated: boolean, activeGoalCount = 0): DailyNewPlan {
  return {
    state,
    authenticated,
    activeGoalCount,
    dailyCap: 0,
    localPlanDate: "",
    timezone: "UTC",
    dailyPlanVersion: 0,
    actions: [],
    allocatedExtraActions: [],
    eligibleActions: [],
    extraAction: null
  };
}

export async function getDailyNewPlan(now: Date = new Date()): Promise<DailyNewPlan> {
  const goals = await getStudyGoalReadModel();
  if (goals.state !== "ready") return emptyPlan(goals.state, goals.authenticated);
  if (!goals.authenticated) return emptyPlan("signed_out", false);

  const supabase = await createClient();
  if (!supabase) return emptyPlan("unconfigured", false, goals.active.length);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return emptyPlan("signed_out", false, goals.active.length);

  const timezone = goals.active[0]?.timezone ?? "UTC";
  const localPlanDate = localDateKey(now, timezone);
  const [profile, evidenceResult, dueReviewResult, allocationResult] = await Promise.all([
    getProfileForUser(auth.user.id),
    supabase
      .from("skill_events")
      .select("learning_item_id,event_type")
      .eq("user_id", auth.user.id)
      .not("learning_item_id", "is", null)
      .order("event_time", { ascending: false })
      .limit(2000),
    supabase
      .from("review_cards")
      .select("learning_item_id")
      .eq("user_id", auth.user.id)
      .lt("due_at", nextLocalMidnight(now, timezone).toISOString())
      .limit(500),
    supabase
      .from("study_goal_daily_allocations")
      .select("action_id,destination_id,daily_plan_version,status")
      .eq("user_id", auth.user.id)
      .eq("local_plan_date", localPlanDate)
      .eq("timezone", timezone)
      .eq("source", "learn_extra")
      .order("allocated_at", { ascending: true })
      .limit(100)
  ]);

  const readError = evidenceResult.error ?? dueReviewResult.error ?? allocationResult.error;
  if (readError) {
    if (isMissingObjectError(readError)) return emptyPlan("unavailable", true, goals.active.length);
    logConfiguredFailure("daily-new-evidence", readError);
    return emptyPlan("error", true, goals.active.length);
  }

  const evidencedItemIds = new Set(
    (evidenceResult.data ?? [])
      .filter((row) => typeof row.learning_item_id === "string" && QUALIFYING_EVENTS.has(String(row.event_type)))
      .map((row) => String(row.learning_item_id))
  );
  for (const row of dueReviewResult.data ?? []) {
    if (typeof row.learning_item_id === "string") evidencedItemIds.add(row.learning_item_id);
  }

  const base = buildDailyNewPlan({
    goals: goals.active,
    evidencedItemIds,
    dailyCap: profile?.daily_new_skills_goal ?? 0
  });
  const allocationRows = (allocationResult.data ?? []).filter((row) => row.status === "allocated");
  const allocatedIds = new Set(allocationRows.map((row) => String(row.action_id)));
  const allocatedExtraActions = allocationRows.flatMap((row) => {
    const action = base.eligibleActions.find((candidate) => candidate.id === String(row.action_id));
    return action ? [{ ...action, source: "learn_extra" as const }] : [];
  });
  const plannedIds = new Set(base.actions.map((action) => action.id));
  const extraAction = base.eligibleActions.find((action) => !plannedIds.has(action.id) && !allocatedIds.has(action.id)) ?? null;
  const dailyPlanVersion = (allocationResult.data ?? []).reduce(
    (maximum, row) => Math.max(maximum, Number(row.daily_plan_version) || 0),
    0
  );

  return {
    ...base,
    localPlanDate,
    timezone,
    dailyPlanVersion,
    actions: base.actions.filter((action) => !allocatedIds.has(action.id)),
    allocatedExtraActions,
    extraAction: extraAction ? { ...extraAction, source: "learn_extra" } : null
  };
}
