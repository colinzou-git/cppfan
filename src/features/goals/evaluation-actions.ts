"use server";

import { abandonGoalEvaluation, startGoalEvaluation } from "./evaluation-start";
import { submitGoalEvaluationChoice } from "./evaluation-submit";

export async function startGoalEvaluationAction() {
  return startGoalEvaluation(crypto.randomUUID());
}

export async function submitGoalEvaluationAction(input: {
  sessionId: string;
  expectedQuestionIndex: number;
  submissionId: string;
  choiceId: string;
}) {
  if (!input?.sessionId || !input.submissionId || !input.choiceId || !Number.isInteger(input.expectedQuestionIndex)) {
    return { status: "invalid" as const };
  }
  return submitGoalEvaluationChoice(input);
}

export async function abandonGoalEvaluationAction(sessionId: string) {
  if (!sessionId) return { status: "invalid" as const };
  return abandonGoalEvaluation(sessionId);
}
