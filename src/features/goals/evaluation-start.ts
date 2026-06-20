import {
  GOAL_EVALUATION_ALGORITHM_VERSION,
  GOAL_EVALUATION_ITEM_POOL_VERSION,
  GOAL_EVALUATION_QUESTION_COUNT,
  validateGoalEvaluationCatalog
} from "./evaluation-catalog";
import { loadPersistedEvaluationCatalog } from "./evaluation-queries";
import { getGoalEvaluationView } from "./evaluation-session-query";
import { classifyEvaluationError, getEvaluationClient } from "./evaluation-service-core";
import type { EvaluationMutationResult } from "./evaluation-service-types";

export async function startGoalEvaluation(submissionId: string): Promise<EvaluationMutationResult> {
  const client = await getEvaluationClient();
  if (client.status !== "ready") return { status: client.status };
  const validated = validateGoalEvaluationCatalog();
  const persisted = await loadPersistedEvaluationCatalog(client.supabase);
  if (persisted.state !== "ready") return { status: persisted.state };
  if (validated.errors.length > 0 || persisted.catalog.length < GOAL_EVALUATION_QUESTION_COUNT) {
    return { status: "pool_invalid" };
  }

  const result = await client.supabase.rpc("start_goal_evaluation", {
    p_submission_id: submissionId,
    p_algorithm_version: GOAL_EVALUATION_ALGORITHM_VERSION,
    p_item_pool_version: GOAL_EVALUATION_ITEM_POOL_VERSION
  });
  if (result.error) return classifyEvaluationError(result.error);
  return { status: "ok", view: await getGoalEvaluationView() };
}

export async function abandonGoalEvaluation(sessionId: string): Promise<EvaluationMutationResult> {
  const client = await getEvaluationClient();
  if (client.status !== "ready") return { status: client.status };
  const result = await client.supabase.rpc("abandon_goal_evaluation", { p_session_id: sessionId });
  if (result.error) return classifyEvaluationError(result.error);
  return { status: "ok", view: await getGoalEvaluationView() };
}
