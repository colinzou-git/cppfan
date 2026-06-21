import { getGoalEvaluationView } from "./evaluation-session-query";
import {
  isLocalGoalEvaluationSessionId,
  submitLocalGoalEvaluationChoice
} from "./evaluation-local-session";
import { classifyEvaluationError, getEvaluationClient } from "./evaluation-service-core";
import type { EvaluationMutationResult } from "./evaluation-service-types";

export async function submitGoalEvaluationChoice(input: {
  sessionId: string;
  expectedQuestionIndex: number;
  submissionId: string;
  choiceId: string;
}): Promise<EvaluationMutationResult> {
  if (isLocalGoalEvaluationSessionId(input.sessionId)) {
    return submitLocalGoalEvaluationChoice({
      sessionId: input.sessionId,
      expectedQuestionIndex: input.expectedQuestionIndex,
      choiceId: input.choiceId
    });
  }

  const client = await getEvaluationClient();
  if (client.status !== "ready") return { status: client.status };

  // Let the trusted RPC validate freshness and replay duplicate submission IDs.
  // A pre-read can race with a duplicated browser/server-action request and
  // falsely report "stale" after the first request already advanced the session.
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
