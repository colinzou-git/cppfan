"use server";

import { getEvaluationClient } from "./evaluation-service-core";

export async function recordEvaluationRecommendationsViewedAction(sessionId: string) {
  if (!sessionId) return { status: "invalid" as const };
  const client = await getEvaluationClient();
  if (client.status !== "ready") return { status: client.status };
  const result = await client.supabase.rpc("record_goal_evaluation_recommendations_viewed", {
    p_session_id: sessionId
  });
  return { status: result.error ? "error" as const : "ok" as const };
}
