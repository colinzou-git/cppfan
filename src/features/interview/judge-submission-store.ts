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
import type { JudgeTaskKind, JudgeWorkerTest } from "../../../services/interview-judge/protocol";
import type { JudgeFixture } from "../../../services/interview-judge/worker-runner";
import type { SessionMode } from "./session-machine";
import type { JudgeDefinitionSource } from "./interview-judge-definition";

export type JudgeSubmissionStatus = "queued" | "running" | "canceled" | JudgeResult["status"];

export type JudgeSubmissionContext = {
  mode: SessionMode;
  interviewSessionId?: string | null;
  sourceVersion?: number;
  assistanceUsed?: boolean;
  priorSolutionExposed?: boolean;
  /** Immutable published version the definition was resolved at; null for native. */
  contentVersionId?: string | null;
  definitionSource?: JudgeDefinitionSource;
};

/**
 * Worker-only execution payload persisted to the private
 * interview_judge_execution_payloads table. Raw source + fixtures never appear in
 * the learner-readable submissions row or in any learner-facing response.
 */
export type JudgeSubmissionExecutionPayload = {
  sourceText: string;
  workerTests: JudgeWorkerTest[];
  fixtures: JudgeFixture[];
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
  content_version_id: string | null;
  definition_source: JudgeDefinitionSource;
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

function coerceUuid(value: unknown): string | null {
  return typeof value === "string" && UUID_RE.test(value) ? value : null;
}

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
    content_version_id: coerceUuid(input.context.contentVersionId),
    definition_source: input.context.definitionSource === "user" ? "user" : "native",
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

function executionToRpcPayload(execution: JudgeSubmissionExecutionPayload) {
  return {
    source_text: execution.sourceText,
    worker_tests: execution.workerTests,
    fixtures: execution.fixtures
  };
}

/**
 * Map the client's session identifier to the durable interview_sessions.id that
 * interview_judge_submissions.interview_session_id references. The client knows
 * only session_id; there is one session row per user, so the id/session_id of that
 * row is matched. Returns null (unlinked) when nothing matches — never a value
 * that would violate the FK.
 */
async function resolveInterviewSessionRowId(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  userId: string,
  clientSessionId: string | null
): Promise<string | null> {
  if (!clientSessionId) {
    return null;
  }
  const { data } = await supabase
    .from("interview_sessions")
    .select("id,session_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) {
    return null;
  }
  return data.id === clientSessionId || data.session_id === clientSessionId ? data.id : null;
}

export async function saveQueuedJudgeSubmission(
  input: JudgeSubmissionDraft,
  execution?: JudgeSubmissionExecutionPayload
): Promise<JudgeSubmissionWriteOutcome> {
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

  // The client only knows its own session_id, but interview_session_id is a FK to
  // interview_sessions.id. Resolve it server-side (there is one session row per
  // user) so a valid link is stored — and drop the link rather than fail the FK
  // when no matching row exists yet.
  const row = judgeSubmissionToRow(input);
  row.interview_session_id = await resolveInterviewSessionRowId(
    supabase,
    user.id,
    input.context.interviewSessionId ?? null
  );

  // The RPC inserts the learner-readable row AND the private worker execution
  // payload atomically. The raw source/fixtures go only through p_execution into
  // the service-role-only interview_judge_execution_payloads table.
  const { data, error } = await supabase.rpc("enqueue_interview_judge_submission", {
    p_submission: row,
    p_execution: execution ? executionToRpcPayload(execution) : null
  });
  if (!error && data === "queued") {
    return { status: "ok", submissionId };
  }
  if (!error && data === "duplicate") {
    return { status: "duplicate", submissionId };
  }

  return { status: "error", reason: error?.message ?? String(data ?? "enqueue_failed") };
}
