// Server-side durable submission persistence for the isolated judge (#178).
// Stores metadata and structured results only: no source text and no hidden
// fixture inputs/expected outputs. Learner C++ still executes only in the
// separate worker boundary under services/interview-judge/.
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_JUDGE_LIMITS,
  isSubmissionWithinLimits,
  type JudgeResult,
  type JudgeSubmission
} from "./judge-contract";
import type { JudgeTaskKind } from "../../../services/interview-judge/protocol";
import type { SessionMode } from "./session-machine";

export type JudgeSubmissionStatus = "queued" | "running" | "canceled" | JudgeResult["status"];

export type JudgeSubmissionContext = {
  mode: SessionMode;
  interviewSessionId?: string | null;
  sourceVersion?: number;
  assistanceUsed?: boolean;
  priorSolutionExposed?: boolean;
};

export type JudgeSubmissionDraft = {
  submission: JudgeSubmission;
  taskKind: JudgeTaskKind;
  visibleTestCount: number;
  hiddenTestCount: number;
  context: JudgeSubmissionContext;
};

export type JudgeSubmissionRow = {
  submission_id: string;
  interview_session_id: string | null;
  problem_id: string;
  problem_version: number;
  mode: SessionMode;
  task_kind: JudgeTaskKind;
  compiler: JudgeSubmission["compiler"];
  standard: JudgeSubmission["standard"];
  source_hash: string;
  source_bytes: number;
  source_version: number;
  assistance_used: boolean;
  prior_solution_exposed: boolean;
  status: JudgeSubmissionStatus;
  compiled: boolean;
  visible_passed: number;
  visible_total: number;
  hidden_passed: number;
  hidden_total: number;
  runtime_ms: number | null;
  memory_mb: number | null;
};

export type JudgeResultPatch = Pick<
  JudgeSubmissionRow,
  | "status"
  | "compiled"
  | "visible_passed"
  | "visible_total"
  | "hidden_passed"
  | "hidden_total"
  | "runtime_ms"
  | "memory_mb"
>;

export type JudgeSubmissionWriteOutcome =
  | { status: "ok"; submissionId: string }
  | { status: "duplicate"; submissionId: string }
  | { status: "signed_out" }
  | { status: "invalid"; reason: string }
  | { status: "error"; reason?: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function nonNegativeInteger(value: number): number {
  return Math.max(0, Math.trunc(Number.isFinite(value) ? value : 0));
}

function positiveInteger(value: number, fallback: number): number {
  const parsed = Math.trunc(Number.isFinite(value) ? value : fallback);
  return parsed > 0 ? parsed : fallback;
}

export function validateJudgeSubmissionDraft(
  input: JudgeSubmissionDraft
): { ok: true } | { ok: false; reason: string } {
  const testCount = input.visibleTestCount + input.hiddenTestCount;
  if (!UUID_RE.test(input.submission.submissionId)) {
    return { ok: false, reason: "invalid_submission_id" };
  }
  if (input.submission.sourceHash.length < 32 || input.submission.sourceHash.length > 128) {
    return { ok: false, reason: "invalid_source_hash" };
  }
  if (!isSubmissionWithinLimits(input.submission, testCount, DEFAULT_JUDGE_LIMITS)) {
    return { ok: false, reason: "submission_limits_exceeded" };
  }
  return { ok: true };
}

export function judgeSubmissionToRow(input: JudgeSubmissionDraft): JudgeSubmissionRow {
  return {
    submission_id: input.submission.submissionId,
    interview_session_id: input.context.interviewSessionId ?? null,
    problem_id: input.submission.problemId,
    problem_version: positiveInteger(input.submission.problemVersion, 1),
    mode: input.context.mode,
    task_kind: input.taskKind,
    compiler: input.submission.compiler,
    standard: input.submission.standard,
    source_hash: input.submission.sourceHash.slice(0, 128),
    source_bytes: nonNegativeInteger(input.submission.sourceBytes),
    source_version: positiveInteger(input.context.sourceVersion ?? 1, 1),
    assistance_used: Boolean(input.context.assistanceUsed),
    prior_solution_exposed: Boolean(input.context.priorSolutionExposed),
    status: "queued",
    compiled: false,
    visible_passed: 0,
    visible_total: nonNegativeInteger(input.visibleTestCount),
    hidden_passed: 0,
    hidden_total: nonNegativeInteger(input.hiddenTestCount),
    runtime_ms: null,
    memory_mb: null
  };
}

export function judgeResultToPatch(result: JudgeResult): JudgeResultPatch {
  return {
    status: result.status,
    compiled: result.compiled,
    visible_passed: nonNegativeInteger(result.visible.passed),
    visible_total: nonNegativeInteger(result.visible.total),
    hidden_passed: nonNegativeInteger(result.hidden.passed),
    hidden_total: nonNegativeInteger(result.hidden.total),
    runtime_ms: result.runtimeMs === null ? null : nonNegativeInteger(result.runtimeMs),
    memory_mb: result.memoryMb === null ? null : nonNegativeInteger(result.memoryMb)
  };
}

export async function saveQueuedJudgeSubmission(input: JudgeSubmissionDraft): Promise<JudgeSubmissionWriteOutcome> {
  const validation = validateJudgeSubmissionDraft(input);
  if (!validation.ok) {
    return { status: "invalid", reason: validation.reason };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { status: "signed_out" };
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "signed_out" };
  }

  const submissionId = input.submission.submissionId;
  const existing = await supabase
    .from("interview_judge_submissions")
    .select("submission_id")
    .eq("submission_id", submissionId)
    .maybeSingle();
  if (existing.data) {
    return { status: "duplicate", submissionId };
  }

  const { data, error } = await supabase.rpc("enqueue_interview_judge_submission", {
    p_submission: judgeSubmissionToRow(input)
  });
  if (!error && data === "queued") {
    return { status: "ok", submissionId };
  }
  if (!error && data === "duplicate") {
    return { status: "duplicate", submissionId };
  }

  return { status: "error", reason: error?.message ?? String(data ?? "enqueue_failed") };
}
