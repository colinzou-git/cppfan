import type { GoalEvaluationView } from "./evaluation-view";

export type EvaluationMutationResult =
  | { status: "ok"; view: GoalEvaluationView }
  | { status: "signed_out" | "unconfigured" | "unavailable" | "error" | "stale" | "invalid" | "pool_invalid" };
