import { getGoalEvaluationView } from "./evaluation-session-query";
import { classifyEvaluationError, getEvaluationClient } from "./evaluation-service-core";
import type { EvaluationMutationResult } from "./evaluation-service-types";

export async function submitGoalEvaluationChoice(input: {
  sessionId: string;
  expectedQuestionIndex: number;
  submissionId: string;
  choiceId: string;
}): Promise<EvaluationMutationResult> {
  const client = await getEvaluationClient();
  if (client.status !== "ready") return { status: client.status };
  const view = await getGoalEvaluationView();
  if (
    view.state !== "ready" || view.status !== "active" || !view.currentQuestion ||
    view.sessionId !== input.sessionId || view.questionIndex !== input.expectedQuestionIndex
  ) return { status: "stale" };

  const result = await client.supabase.rpc("submit_goal_evaluation_answer", {
    p_session_id: input.sessionId,
    p_expected_question_index: input.expectedQuestionIndex,
    p_submission_id: input.submissionId,
    p_choice_id: input.choiceId
  });
  if (result.error) return classifyEvaluationError(result.error);
  return {
    status: "ok",
    view: await getGoalEvaluationView()
  };
}
