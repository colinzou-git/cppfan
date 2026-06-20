"use client";

import { useEffect } from "react";
import { recordEvaluationRecommendationsViewedAction } from "./evaluation-telemetry-actions";

export function EvaluationRecommendationTelemetry({ sessionId }: { sessionId: string }) {
  useEffect(() => {
    void recordEvaluationRecommendationsViewedAction(sessionId);
  }, [sessionId]);
  return null;
}
