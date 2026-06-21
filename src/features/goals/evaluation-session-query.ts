import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError, logConfiguredFailure } from "@/lib/supabase/errors";
import { getGoalEvaluationItem } from "./evaluation-catalog";
import type { GoalEvaluationFinding } from "./evaluation-engine";
import type { GoalEvaluationView } from "./evaluation-view";

const empty = (state: GoalEvaluationView["state"], authenticated: boolean): GoalEvaluationView => ({
  state,
  authenticated,
  sessionId: null,
  status: "not_started",
  questionIndex: 1,
  answerCount: 0,
  algorithmVersion: "",
  itemPoolVersion: 0,
  expiresAt: null,
  currentQuestion: null,
  responses: [],
  findings: []
});

const ready = (authenticated: boolean): GoalEvaluationView => ({
  ...empty("ready", authenticated),
  algorithmVersion: "goal-evaluation-v1",
  itemPoolVersion: 1
});

export async function getGoalEvaluationView(): Promise<GoalEvaluationView> {
  const supabase = await createClient();
  if (!supabase) return ready(false);
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return empty("signed_out", false);

  const sessionResult = await supabase
    .from("goal_evaluation_sessions")
    .select("id,status,current_item_id,question_index,answer_count,algorithm_version,item_pool_version,findings,expires_at")
    .eq("user_id", auth.user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (sessionResult.error) {
    if (isMissingObjectError(sessionResult.error)) return ready(true);
    logConfiguredFailure("goal-evaluation-session", sessionResult.error);
    return empty("error", true);
  }
  if (!sessionResult.data) return ready(true);

  const item = sessionResult.data.current_item_id
    ? getGoalEvaluationItem(String(sessionResult.data.current_item_id))
    : null;

  return {
    state: "ready",
    authenticated: true,
    sessionId: String(sessionResult.data.id),
    status: sessionResult.data.status as GoalEvaluationView["status"],
    questionIndex: Number(sessionResult.data.question_index),
    answerCount: Number(sessionResult.data.answer_count),
    algorithmVersion: String(sessionResult.data.algorithm_version),
    itemPoolVersion: Number(sessionResult.data.item_pool_version),
    expiresAt: sessionResult.data.expires_at ? String(sessionResult.data.expires_at) : null,
    currentQuestion: item ? {
      itemId: item.itemId,
      moduleId: item.moduleId,
      moduleTitle: item.moduleTitle,
      prompt: item.prompt,
      choices: item.choices
    } : null,
    responses: [],
    findings: Array.isArray(sessionResult.data.findings)
      ? sessionResult.data.findings as GoalEvaluationFinding[]
      : []
  };
}
