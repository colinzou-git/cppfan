/*
 * Worker-boundary adapter for DB-sourced (dynamic) judge submissions (#608).
 *
 * The Next.js app enqueues a submission and persists a PRIVATE execution payload
 * (raw source + worker tests + fixtures) via `interview_judge_execution_payloads`.
 * The isolated worker — not the app — reads that payload and turns it into the
 * `JudgeWorkerRequest` + fixtures that `runJudgeRequest` already understands.
 *
 * This adapter is that conversion. It is pure and executor-injected so it can be
 * unit-tested without Docker (inject a fake `WorkerProcessExecutor`); real
 * execution is done by handing `buildStoredJudgeExecution().source/request` to
 * `runLocalDockerJudge`. Nothing here imports a compiler or Docker, and nothing
 * here runs inside the Next.js process — that boundary is what keeps learner code
 * execution out of the web app.
 */

import { createHash } from "node:crypto";
import {
  DEFAULT_JUDGE_LIMITS,
  type CppStandard,
  type JudgeCompiler,
  type JudgeLimits,
  type JudgeResult
} from "@/features/interview/judge-contract";
import type { JudgeTaskKind, JudgeWorkerRequest, JudgeWorkerTest } from "./protocol";
import { runJudgeRequest, type JudgeFixture, type WorkerProcessExecutor } from "./worker-runner";

/**
 * A judge execution as read back from persistence: the learner-readable
 * submission row joined to its private execution payload. Raw source + fixtures
 * exist ONLY here, on the worker side.
 */
export type StoredJudgeExecutionRecord = {
  submissionId: string;
  problemId: string;
  problemVersion: number;
  compiler: JudgeCompiler;
  standard: CppStandard;
  taskKind: JudgeTaskKind;
  sourceText: string;
  workerTests: JudgeWorkerTest[];
  fixtures: JudgeFixture[];
  /** Defaults to DEFAULT_JUDGE_LIMITS when the worker does not override them. */
  limits?: JudgeLimits;
};

export type BuiltStoredJudgeExecution = {
  request: JudgeWorkerRequest;
  /** Learner source to materialize in the sandbox workspace (never re-persisted). */
  source: string;
  fixtures: JudgeFixture[];
};

function sourceHash(source: string): string {
  return createHash("sha256").update(source, "utf8").digest("hex");
}

/**
 * Convert a stored payload into the worker request + fixtures. The source hash is
 * recomputed from the stored source so the request is self-consistent even if the
 * caller passes only the payload.
 */
export function buildStoredJudgeExecution(record: StoredJudgeExecutionRecord): BuiltStoredJudgeExecution {
  const source = record.sourceText;
  const request: JudgeWorkerRequest = {
    submission: {
      submissionId: record.submissionId,
      problemId: record.problemId,
      problemVersion: record.problemVersion,
      compiler: record.compiler,
      standard: record.standard,
      sourceHash: sourceHash(source),
      sourceBytes: Buffer.byteLength(source, "utf8")
    },
    taskKind: record.taskKind,
    tests: record.workerTests,
    limits: record.limits ?? DEFAULT_JUDGE_LIMITS
  };
  return { request, source, fixtures: record.fixtures };
}

/**
 * Run a stored judge execution with an injected process executor. Tests inject a
 * fake executor (no Docker); the deployed worker injects the Docker executor (via
 * `runLocalDockerJudge`, which consumes the same request/source/fixtures).
 */
export async function runStoredJudgeExecution(input: {
  record: StoredJudgeExecutionRecord;
  executor: WorkerProcessExecutor;
}): Promise<JudgeResult> {
  const { request, fixtures } = buildStoredJudgeExecution(input.record);
  return runJudgeRequest({ request, fixtures, executor: input.executor });
}
