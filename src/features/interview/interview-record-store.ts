import { createClient } from "@/lib/supabase/server";
import type { ProblemExposure, ProblemExposureKind } from "./problem-policy";

export type RecordOutcome = { ok: true } | { ok: false; error: string };

async function signedInClient() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ? { supabase, userId: data.user.id } : null;
}

function outcome(error: { code?: string; message: string } | null): RecordOutcome {
  if (!error || error.code === "23505") return { ok: true };
  return { ok: false, error: error.message };
}

export async function recordProblemExposure(input: {
  problemId: string;
  problemVersion: number;
  kind: ProblemExposureKind;
  sourceRef: string;
  occurredAt?: string;
}): Promise<RecordOutcome> {
  const auth = await signedInClient();
  if (!auth) return { ok: false, error: "Sign in to record interview exposure." };
  const { error } = await auth.supabase.from("interview_problem_exposures").insert({
    user_id: auth.userId,
    problem_id: input.problemId,
    problem_version: input.problemVersion,
    exposure_kind: input.kind,
    source_ref: input.sourceRef,
    occurred_at: input.occurredAt ?? new Date().toISOString()
  });
  return outcome(error);
}

export async function getProblemExposures(limit = 500): Promise<ProblemExposure[]> {
  const auth = await signedInClient();
  if (!auth) return [];
  const { data, error } = await auth.supabase
    .from("interview_problem_exposures")
    .select("problem_id,problem_version,exposure_kind,occurred_at")
    .eq("user_id", auth.userId)
    .order("occurred_at", { ascending: false })
    .limit(Math.min(1000, Math.max(1, limit)));
  if (error || !data) return [];
  return data.map((row) => ({
    problemId: String(row.problem_id),
    problemVersion: Number(row.problem_version),
    kind: row.exposure_kind as ProblemExposureKind,
    occurredAt: String(row.occurred_at)
  }));
}

export async function recordFollowUpResult(input: {
  sessionId: string;
  followUpId: string;
  followUpVersion: number;
  parentProblemId: string;
  parentProblemVersion: number;
  reasoningCorrect: boolean;
  implementationStatus: "not_started" | "in_progress" | "completed" | "time_expired";
  explainedBeforeEdit: boolean;
  credit: "none" | "partial" | "full";
  verificationClass?: "learner_attested" | "trusted_server_reconciled";
}): Promise<RecordOutcome> {
  const auth = await signedInClient();
  if (!auth) return { ok: false, error: "Sign in to record a follow-up result." };
  const { error } = await auth.supabase.from("interview_follow_up_results").insert({
    user_id: auth.userId,
    session_id: input.sessionId,
    follow_up_id: input.followUpId,
    follow_up_version: input.followUpVersion,
    parent_problem_id: input.parentProblemId,
    parent_problem_version: input.parentProblemVersion,
    reasoning_correct: input.reasoningCorrect,
    implementation_status: input.implementationStatus,
    explained_before_edit: input.explainedBeforeEdit,
    credit: input.credit,
    verification_class: input.verificationClass ?? "learner_attested"
  });
  return outcome(error);
}

export async function recordMockRun(input: {
  submissionId: string;
  packId: string;
  packVersion: number;
  startedAt: string;
  completedAt: string | null;
  runStatus: "started" | "completed" | "abandoned";
  unseenAtStart: boolean;
  resultSummary?: Record<string, unknown>;
  verificationClass?: "learner_attested" | "trusted_server_reconciled";
}): Promise<RecordOutcome> {
  const auth = await signedInClient();
  if (!auth) return { ok: false, error: "Sign in to record a mock run." };
  const { error } = await auth.supabase.from("interview_mock_runs").insert({
    user_id: auth.userId,
    submission_id: input.submissionId,
    pack_id: input.packId,
    pack_version: input.packVersion,
    started_at: input.startedAt,
    completed_at: input.completedAt,
    run_status: input.runStatus,
    unseen_at_start: input.unseenAtStart,
    verification_class: input.verificationClass ?? "learner_attested",
    result_summary: input.resultSummary ?? {}
  });
  return outcome(error);
}
