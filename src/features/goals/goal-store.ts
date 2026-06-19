import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";
import { validateStudyGoalRevision, type StudyGoalRevisionInput } from "./goal-contract";

export type GoalMutationResult =
  | { status: "ok"; goalId: string; revisionNumber: number; replayed: boolean }
  | { status: "invalid"; errors: string[] }
  | { status: "signed_out" | "unconfigured" | "unavailable" | "error" | "stale" | "conflict" | "not_active" };

type RpcResult = {
  data: unknown;
  error: { code?: string | null; message?: string | null } | null;
};

export function classifyGoalMutationRpc(result: RpcResult): GoalMutationResult {
  if (result.error) {
    if (isMissingObjectError(result.error)) return { status: "unavailable" };
    const message = result.error.message ?? "";
    if (message.includes("stale_goal_revision")) return { status: "stale" };
    if (message.includes("idempotency_conflict")) return { status: "conflict" };
    if (message.includes("goal_not_active")) return { status: "not_active" };
    return { status: "error" };
  }

  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  const typed = row as {
    result_goal_id?: unknown;
    result_revision_number?: unknown;
    replayed?: unknown;
  } | null;
  if (
    typeof typed?.result_goal_id !== "string" ||
    typeof typed.result_revision_number !== "number" ||
    typeof typed.replayed !== "boolean"
  ) {
    return { status: "error" };
  }
  return {
    status: "ok",
    goalId: typed.result_goal_id,
    revisionNumber: typed.result_revision_number,
    replayed: typed.replayed
  };
}

function toRpcTargets(input: StudyGoalRevisionInput) {
  return input.targets.map((target) => ({
    targetKind: target.targetKind,
    referenceId: target.referenceId,
    titleSnapshot: target.titleSnapshot,
    acquisitionContractId: target.acquisitionContractId,
    acquisitionContractVersion: target.acquisitionContractVersion,
    source: target.source,
    orderIndex: target.orderIndex,
    weight: target.weight ?? 1
  }));
}

async function clientForMutation() {
  const supabase = await createClient();
  if (!supabase) return { status: "unconfigured" as const };
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { status: "signed_out" as const };
  return { status: "ready" as const, supabase };
}

export async function createStudyGoal(
  submissionId: string,
  input: StudyGoalRevisionInput,
  algorithmVersion = "study-goals-v1"
): Promise<GoalMutationResult> {
  const errors = validateStudyGoalRevision(input);
  if (errors.length > 0) return { status: "invalid", errors };
  const client = await clientForMutation();
  if (client.status !== "ready") return { status: client.status };

  const result = await client.supabase.rpc("create_study_goal", {
    p_submission_id: submissionId,
    p_title: input.title.trim(),
    p_start_local_date: input.startLocalDate,
    p_end_local_date: input.endLocalDate,
    p_timezone: input.timezone,
    p_algorithm_version: algorithmVersion,
    p_recommendation_source: input.recommendationSource,
    p_recommendation_reason: input.recommendationReason ?? null,
    p_learner_note: input.learnerNote ?? null,
    p_targets: toRpcTargets(input)
  });
  return classifyGoalMutationRpc(result);
}

export async function reviseStudyGoal(
  goalId: string,
  expectedRevision: number,
  submissionId: string,
  input: StudyGoalRevisionInput,
  algorithmVersion = "study-goals-v1"
): Promise<GoalMutationResult> {
  const errors = validateStudyGoalRevision(input);
  if (errors.length > 0) return { status: "invalid", errors };
  const client = await clientForMutation();
  if (client.status !== "ready") return { status: client.status };

  const result = await client.supabase.rpc("revise_study_goal", {
    p_goal_id: goalId,
    p_expected_revision: expectedRevision,
    p_submission_id: submissionId,
    p_title: input.title.trim(),
    p_start_local_date: input.startLocalDate,
    p_end_local_date: input.endLocalDate,
    p_timezone: input.timezone,
    p_algorithm_version: algorithmVersion,
    p_recommendation_source: input.recommendationSource,
    p_recommendation_reason: input.recommendationReason ?? null,
    p_learner_note: input.learnerNote ?? null,
    p_targets: toRpcTargets(input)
  });
  return classifyGoalMutationRpc(result);
}

export async function cancelStudyGoal(
  goalId: string,
  expectedRevision: number,
  submissionId: string,
  reason?: string
): Promise<GoalMutationResult> {
  const client = await clientForMutation();
  if (client.status !== "ready") return { status: client.status };
  const result = await client.supabase.rpc("cancel_study_goal", {
    p_goal_id: goalId,
    p_expected_revision: expectedRevision,
    p_submission_id: submissionId,
    p_reason: reason ?? null
  });
  return classifyGoalMutationRpc(result);
}
