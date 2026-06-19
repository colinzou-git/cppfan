import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";
import type { DailyNewAction } from "./daily-new-model";

export type ExtraAllocationResult =
  | { status: "ok"; allocationId: string; dailyPlanVersion: number; replayed: boolean }
  | { status: "signed_out" | "unconfigured" | "unavailable" | "error" | "stale" | "conflict" | "not_active" };

export async function allocateGoalExtra(input: {
  submissionId: string;
  expectedDailyPlanVersion: number;
  localPlanDate: string;
  timezone: string;
  action: DailyNewAction;
}): Promise<ExtraAllocationResult> {
  const supabase = await createClient();
  if (!supabase) return { status: "unconfigured" };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { status: "signed_out" };

  const result = await supabase.rpc("allocate_goal_extra", {
    p_submission_id: input.submissionId,
    p_expected_daily_plan_version: input.expectedDailyPlanVersion,
    p_local_plan_date: input.localPlanDate,
    p_timezone: input.timezone,
    p_goal_id: input.action.primaryGoalId,
    p_revision_id: input.action.revisionId,
    p_target_id: input.action.primaryTargetId,
    p_action_id: input.action.id,
    p_acquisition_step_id: input.action.acquisitionStepId,
    p_destination_kind: input.action.destinationKind,
    p_destination_id: input.action.destinationId,
    p_algorithm_version: input.action.algorithmVersion,
    p_acquisition_contract_version: input.action.acquisitionContractVersion
  });

  if (result.error) {
    if (isMissingObjectError(result.error)) return { status: "unavailable" };
    const message = result.error.message ?? "";
    if (message.includes("stale_daily_allocation_version") || message.includes("stale_goal_revision")) return { status: "stale" };
    if (message.includes("idempotency_conflict")) return { status: "conflict" };
    if (message.includes("goal_not_active")) return { status: "not_active" };
    return { status: "error" };
  }

  const row = (Array.isArray(result.data) ? result.data[0] : result.data) as {
    result_allocation_id?: unknown;
    result_daily_plan_version?: unknown;
    replayed?: unknown;
  } | null;
  if (
    typeof row?.result_allocation_id !== "string" ||
    typeof row.result_daily_plan_version !== "number" ||
    typeof row.replayed !== "boolean"
  ) return { status: "error" };

  return {
    status: "ok",
    allocationId: row.result_allocation_id,
    dailyPlanVersion: row.result_daily_plan_version,
    replayed: row.replayed
  };
}
