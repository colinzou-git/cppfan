import {
  GOAL_EVALUATION_ALGORITHM_VERSION,
  GOAL_EVALUATION_ITEM_POOL_VERSION,
  GOAL_EVALUATION_QUESTION_COUNT,
  validateGoalEvaluationCatalog
} from "./evaluation-catalog";
import { loadPersistedEvaluationCatalog } from "./evaluation-queries";
import { getGoalEvaluationView } from "./evaluation-session-query";
import {
  abandonLocalGoalEvaluation,
  isLocalGoalEvaluationSessionId,
  startLocalGoalEvaluation
} from "./evaluation-local-session";
import { classifyEvaluationError, getEvaluationClient } from "./evaluation-service-core";
import type { EvaluationMutationResult } from "./evaluation-service-types";

export async function startGoalEvaluation(
  submissionId: string,
  context: { requestedGoalDuration: number; timezone: string }
): Promise<EvaluationMutationResult> {
  const validated = validateGoalEvaluationCatalog();
  if (validated.errors.length > 0 || validated.catalog.length < GOAL_EVALUATION_QUESTION_COUNT) {
    return { status: "pool_invalid" };
  }

  const client = await getEvaluationClient();
  if (client.status === "unconfigured") return startLocalGoalEvaluation(false);
  if (client.status !== "ready") return { status: client.status };

  const persisted = await loadPersistedEvaluationCatalog(client.supabase);
  if (persisted.state === "unavailable") return startLocalGoalEvaluation(true);
  if (persisted.state !== "ready") return { status: persisted.state };
  if (persisted.catalog.length < GOAL_EVALUATION_QUESTION_COUNT) {
    return startLocalGoalEvaluation(true);
  }

  const result = await client.supabase.rpc("start_goal_evaluation", {
    p_submission_id: submissionId,
    p_algorithm_version: GOAL_EVALUATION_ALGORITHM_VERSION,
    p_item_pool_version: GOAL_EVALUATION_ITEM_POOL_VERSION,
    p_timezone: context.timezone,
    p_requested_goal_duration: context.requestedGoalDuration
  });
  if (result.error) {
    const classified = classifyEvaluationError(result.error);
    if (classified.status === "unavailable") return startLocalGoalEvaluation(true);
    return classified;
  }
  return { status: "ok", view: await getGoalEvaluationView() };
}

export async function abandonGoalEvaluation(sessionId: string): Promise<EvaluationMutationResult> {
  if (isLocalGoalEvaluationSessionId(sessionId)) return abandonLocalGoalEvaluation();

  const client = await getEvaluationClient();
  if (client.status !== "ready") return { status: client.status };
  const result = await client.supabase.rpc("abandon_goal_evaluation", { p_session_id: sessionId });
  if (result.error) return classifyEvaluationError(result.error);
  return { status: "ok", view: await getGoalEvaluationView() };
}
