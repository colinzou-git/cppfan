import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError, logConfiguredFailure } from "@/lib/supabase/errors";
import { getGoalEvaluationItem } from "./evaluation-catalog";
import type { GoalEvaluationFinding, GoalEvaluationResponse } from "./evaluation-engine";
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
  currentQuestion: null,
  responses: [],
  findings: []
});

export async function getGoalEvaluationView(): Promise<GoalEvaluationView> {
  const supabase = await createClient();
  if (!supabase) return empty("unconfigured", false);
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return empty("signed_out", false);

  const sessionResult = await supabase
    .from("goal_evaluation_sessions")
    .select("id,status,current_item_id,question_index,answer_count,algorithm_version,item_pool_version,findings")
    .eq("user_id", auth.user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (sessionResult.error) {
    if (isMissingObjectError(sessionResult.error)) return empty("unavailable", true);
    logConfiguredFailure("goal-evaluation-session", sessionResult.error);
    return empty("error", true);
  }
  if (!sessionResult.data) return empty("ready", true);

  const responseResult = await supabase
    .from("goal_evaluation_responses")
    .select("learning_item_id,module_id,primary_skill_id,difficulty_band,diagnostic_weight,item_type,is_correct")
    .eq("session_id", sessionResult.data.id)
    .order("sequence_no", { ascending: true })
    .limit(30);
  if (responseResult.error) {
    if (isMissingObjectError(responseResult.error)) return empty("unavailable", true);
    logConfiguredFailure("goal-evaluation-responses", responseResult.error);
    return empty("error", true);
  }

  const responses: GoalEvaluationResponse[] = (responseResult.data ?? []).map((row) => ({
    itemId: String(row.learning_item_id),
    moduleId: String(row.module_id),
    primarySkillId: String(row.primary_skill_id),
    difficultyBand: Number(row.difficulty_band),
    diagnosticWeight: Number(row.diagnostic_weight),
    itemType: String(row.item_type),
    isCorrect: Boolean(row.is_correct)
  }));
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
    currentQuestion: item ? {
      itemId: item.itemId,
      moduleId: item.moduleId,
      moduleTitle: item.moduleTitle,
      prompt: item.prompt,
      choices: item.choices
    } : null,
    responses,
    findings: Array.isArray(sessionResult.data.findings)
      ? sessionResult.data.findings as GoalEvaluationFinding[]
      : []
  };
}
