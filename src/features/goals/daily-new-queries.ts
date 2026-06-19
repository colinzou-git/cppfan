import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError, logConfiguredFailure } from "@/lib/supabase/errors";
import { nextLocalMidnight } from "@/lib/time/local-day";
import { getProfileForUser } from "@/features/profile/profile-queries";
import { buildDailyNewPlan } from "./daily-new-builder";
import type { DailyNewPlan } from "./daily-new-model";
import { getStudyGoalReadModel } from "./goal-queries";

const QUALIFYING_EVENTS = new Set([
  "lesson_started",
  "concept_seen",
  "quiz_correct",
  "review_completed",
  "code_passed",
  "worked_example_viewed",
  "completion_submitted",
  "parsons_checked"
]);

function emptyPlan(state: DailyNewPlan["state"], authenticated: boolean, activeGoalCount = 0): DailyNewPlan {
  return { state, authenticated, activeGoalCount, dailyCap: 0, actions: [], extraAction: null };
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
  const [profile, evidenceResult, dueReviewResult] = await Promise.all([
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
      .limit(500)
  ]);

  const readError = evidenceResult.error ?? dueReviewResult.error;
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

  return buildDailyNewPlan({
    goals: goals.active,
    evidencedItemIds,
    dailyCap: profile?.daily_new_skills_goal ?? 0
  });
}
