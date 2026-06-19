import { gradeViaRpc } from "@/features/learning-items/attempt-service";
import { GOAL_EVALUATION_QUESTION_COUNT } from "./evaluation-catalog";
import {
  buildGoalEvaluationFindings,
  selectNextGoalEvaluationItem,
  type GoalEvaluationResponse
} from "./evaluation-engine";
import { loadPersistedEvaluationCatalog } from "./evaluation-queries";
import { getGoalEvaluationView } from "./evaluation-session-query";
import { classifyEvaluationError, getEvaluationClient } from "./evaluation-service-core";
import type { EvaluationMutationResult } from "./evaluation-service-types";

export async function submitGoalEvaluationChoice(input: {
  sessionId: string;
  expectedQuestionIndex: number;
  choiceId: string;
}): Promise<EvaluationMutationResult> {
  const client = await getEvaluationClient();
  if (client.status !== "ready") return { status: client.status };
  const view = await getGoalEvaluationView();
  if (
    view.state !== "ready" || view.status !== "active" || !view.currentQuestion ||
    view.sessionId !== input.sessionId || view.questionIndex !== input.expectedQuestionIndex
  ) return { status: "stale" };

  const grade = await gradeViaRpc(view.currentQuestion.itemId, input.choiceId);
  if (grade.status !== "graded") {
    return { status: grade.status === "unavailable" ? "unavailable" : "error" };
  }

  const persisted = await loadPersistedEvaluationCatalog(client.supabase);
  if (persisted.state !== "ready") return { status: persisted.state };
  const current = persisted.catalog.find((item) => item.itemId === view.currentQuestion?.itemId);
  if (!current) return { status: "pool_invalid" };

  const responses: GoalEvaluationResponse[] = [...view.responses, {
    itemId: current.itemId,
    moduleId: current.moduleId,
    primarySkillId: current.primarySkillId,
    difficultyBand: current.difficultyBand,
    diagnosticWeight: current.diagnosticWeight,
    itemType: current.itemType,
    isCorrect: grade.isCorrect
  }];
  const next = selectNextGoalEvaluationItem({ catalog: persisted.catalog, responses });
  if (responses.length < GOAL_EVALUATION_QUESTION_COUNT && !next) return { status: "pool_invalid" };
  const findings = responses.length === GOAL_EVALUATION_QUESTION_COUNT
    ? buildGoalEvaluationFindings(persisted.catalog, responses)
    : [];

  const result = await client.supabase.rpc("submit_goal_evaluation_answer", {
    p_session_id: input.sessionId,
    p_expected_question_index: input.expectedQuestionIndex,
    p_choice_id: input.choiceId,
    p_next_item_id: next?.itemId ?? null,
    p_model_state: { responseCount: responses.length },
    p_findings: findings
  });
  if (result.error) return classifyEvaluationError(result.error);
  return {
    status: "ok",
    view: await getGoalEvaluationView(),
    lastAnswerCorrect: grade.isCorrect
  };
}
