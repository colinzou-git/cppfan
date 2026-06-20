import type { PublicLearningItemChoice } from "@/features/learning-items/learning-item-types";
import type { GoalEvaluationFinding, GoalEvaluationResponse } from "./evaluation-engine";

export type EvaluationStatus = "not_started" | "active" | "completed" | "abandoned";

export type GoalEvaluationQuestion = {
  itemId: string;
  moduleId: string;
  moduleTitle: string;
  prompt: string;
  choices: PublicLearningItemChoice[];
};

export type GoalEvaluationView = {
  state: "ready" | "signed_out" | "unconfigured" | "unavailable" | "error";
  authenticated: boolean;
  sessionId: string | null;
  status: EvaluationStatus;
  questionIndex: number;
  answerCount: number;
  algorithmVersion: string;
  itemPoolVersion: number;
  expiresAt: string | null;
  currentQuestion: GoalEvaluationQuestion | null;
  responses: GoalEvaluationResponse[];
  findings: GoalEvaluationFinding[];
};
