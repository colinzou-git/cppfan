import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingObjectError, logConfiguredFailure } from "@/lib/supabase/errors";
import { getGoalEvaluationCatalog } from "./evaluation-catalog";
import type { GoalEvaluationDiagnosticItem } from "./evaluation-catalog";

export const EVALUATION_QUERY_LIMIT = 30;

export async function loadPersistedEvaluationCatalog(
  supabase: SupabaseClient
): Promise<{ state: "ready"; catalog: GoalEvaluationDiagnosticItem[] } | { state: "unavailable" | "error" }> {
  const result = await supabase
    .from("goal_evaluation_items")
    .select("learning_item_id")
    .eq("goal_evaluation_eligible", true)
    .is("retired_at", null)
    .limit(500);

  if (result.error) {
    if (isMissingObjectError(result.error)) return { state: "unavailable" };
    logConfiguredFailure("goal-evaluation-catalog", result.error);
    return { state: "error" };
  }

  const persistedIds = new Set((result.data ?? []).map((row) => String(row.learning_item_id)));
  return {
    state: "ready",
    catalog: getGoalEvaluationCatalog().filter((item) => persistedIds.has(item.itemId))
  };
}
