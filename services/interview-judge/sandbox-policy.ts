import {
  DEFAULT_JUDGE_LIMITS,
  learnerFacingResult,
  summarizeOutcomes,
  type JudgeLimits,
  type JudgeResult,
  type JudgeStatus,
  type TestOutcome
} from "@/features/interview/judge-contract";
import type { JudgeQueueRecord, JudgeTaskKind, JudgeWorkerCapabilities, JudgeWorkerRequest } from "./protocol";

export const WORKER_CAPABILITIES: JudgeWorkerCapabilities = {
  compilers: ["gcc", "clang"],
  standards: ["c++17", "c++20"],
  taskKinds: ["compile_only", "compile_and_run"]
};

export type JudgeIsolationProfile = {
  runtimeBoundary: "separate_worker_service";
  network: "none";
  rootFilesystem: "read_only";
  writableWorkspace: "ephemeral_workspace";
  user: "non_root";
  syscallIsolation: "seccomp_or_microvm";
  cleanup: "always";
};

export type JudgeRateLimitPolicy = {
  perUserSubmissionsPerMinute: number;
  globalSubmissionsPerMinute: number;
  perUserQueued: number;
  perUserRunning: number;
  globalRunning: number;
};

export type JudgeSandboxPolicy = {
  capabilities: JudgeWorkerCapabilities;
  defaultLimits: JudgeLimits;
  maxSourceBytes: number;
  maxTests: number;
  isolation: JudgeIsolationProfile;
  rateLimits: JudgeRateLimitPolicy;
};

export const JUDGE_SANDBOX_POLICY: JudgeSandboxPolicy = {
  capabilities: WORKER_CAPABILITIES,
  defaultLimits: DEFAULT_JUDGE_LIMITS,
  maxSourceBytes: DEFAULT_JUDGE_LIMITS.maxSourceBytes,
  maxTests: DEFAULT_JUDGE_LIMITS.maxTests,
  isolation: {
    runtimeBoundary: "separate_worker_service",
    network: "none",
    rootFilesystem: "read_only",
    writableWorkspace: "ephemeral_workspace",
    user: "non_root",
    syscallIsolation: "seccomp_or_microvm",
    cleanup: "always"
  },
  rateLimits: {
    perUserSubmissionsPerMinute: 20,
    globalSubmissionsPerMinute: 240,
    perUserQueued: 5,
    perUserRunning: 1,
    globalRunning: 16
  }
};

export type SandboxRunManifest = {
  image: string;
  workspacePath: string;
  containerWorkspace: string;
  args: string[];
  timeoutMs: number;
  memoryMb: number;
  pidsLimit: number;
  cpuSeconds: number;
  fileSizeBytes: number;
  outputKb: number;
  cleanup: "rm";
};

export function buildSandboxRunManifest(
  request: JudgeWorkerRequest,
  image = "cppfan/interview-judge:local",
  workspacePath = "<temporary workspace>",
  containerWorkspace = "/workspace"
): SandboxRunManifest {
  return {
    image,
    workspacePath,
    containerWorkspace,
    args: [
      "run",
      "--rm",
      "--network=none",
      "--read-only",
      "--tmpfs=/tmp:rw,nosuid,nodev,noexec",
      "--mount",
      `type=bind,source=${workspacePath},target=${containerWorkspace}`,
      "--workdir",
      containerWorkspace,
      "--user=65532:65532",
      "--cap-drop=ALL",
      "--security-opt=no-new-privileges",
      "--pids-limit",
      String(request.limits.maxProcesses),
      "--ulimit",
      `cpu=${Math.max(1, Math.ceil(request.limits.cpuMs / 1000))}:${Math.max(1, Math.ceil(request.limits.cpuMs / 1000))}`,
      "--ulimit",
      `fsize=${request.limits.maxFileKb * 1024}:${request.limits.maxFileKb * 1024}`,
      "--memory",
      `${request.limits.memoryMb}m`,
      image
    ],
    timeoutMs: request.limits.wallMs,
    memoryMb: request.limits.memoryMb,
    pidsLimit: request.limits.maxProcesses,
    cpuSeconds: Math.max(1, Math.ceil(request.limits.cpuMs / 1000)),
    fileSizeBytes: request.limits.maxFileKb * 1024,
    outputKb: request.limits.outputKb,
    cleanup: "rm"
  };
}

export function validateWorkerRequest(request: JudgeWorkerRequest): { ok: true } | { ok: false; reason: string } {
  if (!WORKER_CAPABILITIES.compilers.includes(request.submission.compiler)) {
    return { ok: false, reason: "unsupported_compiler" };
  }
  if (!WORKER_CAPABILITIES.standards.includes(request.submission.standard)) {
    return { ok: false, reason: "unsupported_standard" };
  }
  if (!WORKER_CAPABILITIES.taskKinds.includes(request.taskKind)) {
    return { ok: false, reason: "unsupported_task_kind" };
  }
  if (request.submission.sourceBytes <= 0 || request.submission.sourceBytes > JUDGE_SANDBOX_POLICY.maxSourceBytes) {
    return { ok: false, reason: "source_size_limit" };
  }
  if (request.tests.length > JUDGE_SANDBOX_POLICY.maxTests) {
    return { ok: false, reason: "test_count_limit" };
  }
  if (request.tests.some((test) => !test.fixtureHash || test.fixtureHash.length < 16)) {
    return { ok: false, reason: "missing_fixture_hash" };
  }
  return { ok: true };
}

export function resultFromOutcomes(
  submissionId: string,
  status: JudgeStatus,
  compiled: boolean,
  outcomes: TestOutcome[],
  runtimeMs: number | null = null,
  memoryMb: number | null = null
): JudgeResult {
  const summary = summarizeOutcomes(outcomes);
  return {
    submissionId,
    status,
    compiled,
    visible: summary.visible,
    hidden: summary.hidden,
    runtimeMs,
    memoryMb
  };
}

export function redactedLearnerResult(result: JudgeResult, outcomes: TestOutcome[]) {
  return learnerFacingResult(result, outcomes);
}

export function infrastructureFailureResult(submissionId: string): JudgeResult {
  return {
    submissionId,
    status: "infrastructure_error",
    compiled: false,
    visible: { passed: 0, total: 0 },
    hidden: { passed: 0, total: 0 },
    runtimeMs: null,
    memoryMb: null
  };
}

export function createJudgeQueue(
  nowMs = () => Date.now(),
  rateLimits: JudgeRateLimitPolicy = JUDGE_SANDBOX_POLICY.rateLimits
) {
  const records = new Map<string, JudgeQueueRecord>();
  const acceptedEnqueues: { ownerId: string; atMs: number }[] = [];

  function activeCount(ownerId: string | null, state: "queued" | "running"): number {
    return [...records.values()].filter(
      (record) => record.state === state && (ownerId === null || record.ownerId === ownerId)
    ).length;
  }

  function recentEnqueues(ownerId: string | null, now: number): number {
    const cutoff = now - 60_000;
    return acceptedEnqueues.filter((entry) => entry.atMs > cutoff && (ownerId === null || entry.ownerId === ownerId))
      .length;
  }

  return {
    enqueue(
      request: JudgeWorkerRequest,
      ownerId: string
    ): { status: "queued" | "duplicate" | "rejected"; record?: JudgeQueueRecord; reason?: string } {
      const validation = validateWorkerRequest(request);
      if (!validation.ok) {
        return { status: "rejected", reason: validation.reason };
      }

      const existing = records.get(request.submission.submissionId);
      if (existing) {
        return { status: "duplicate", record: existing };
      }

      const now = nowMs();
      if (!ownerId) return { status: "rejected", reason: "missing_owner" };
      if (activeCount(ownerId, "queued") >= rateLimits.perUserQueued) {
        return { status: "rejected", reason: "per_user_queue_limit" };
      }
      if (recentEnqueues(ownerId, now) >= rateLimits.perUserSubmissionsPerMinute) {
        return { status: "rejected", reason: "per_user_rate_limit" };
      }
      if (recentEnqueues(null, now) >= rateLimits.globalSubmissionsPerMinute) {
        return { status: "rejected", reason: "global_rate_limit" };
      }
      const record: JudgeQueueRecord = {
        submissionId: request.submission.submissionId,
        ownerId,
        request,
        state: "queued",
        enqueuedAtMs: now,
        updatedAtMs: now,
        result: null
      };
      records.set(record.submissionId, record);
      acceptedEnqueues.push({ ownerId, atMs: now });
      return { status: "queued", record };
    },

    start(submissionId: string): { status: "running" | "rejected"; reason?: string } {
      const record = records.get(submissionId);
      if (!record || record.state !== "queued") return { status: "rejected", reason: "not_queued" };
      if (activeCount(record.ownerId, "running") >= rateLimits.perUserRunning) {
        return { status: "rejected", reason: "per_user_concurrency_limit" };
      }
      if (activeCount(null, "running") >= rateLimits.globalRunning) {
        return { status: "rejected", reason: "global_concurrency_limit" };
      }
      record.state = "running";
      record.updatedAtMs = nowMs();
      return { status: "running" };
    },

    cancel(submissionId: string): boolean {
      const record = records.get(submissionId);
      if (!record || record.state === "completed") return false;
      record.state = "canceled";
      record.updatedAtMs = nowMs();
      return true;
    },

    markWorkerLost(submissionId: string): JudgeResult | null {
      const record = records.get(submissionId);
      if (!record || record.state === "completed") return null;
      const result = infrastructureFailureResult(submissionId);
      record.state = "completed";
      record.result = result;
      record.updatedAtMs = nowMs();
      return result;
    },

    complete(submissionId: string, result: JudgeResult): boolean {
      const record = records.get(submissionId);
      if (!record || record.state === "canceled") return false;
      record.state = "completed";
      record.result = result;
      record.updatedAtMs = nowMs();
      return true;
    },

    get(submissionId: string): JudgeQueueRecord | null {
      return records.get(submissionId) ?? null;
    }
  };
}

export function securityRegressionCases(): string[] {
  return [
    "infinite_loop",
    "fork_process_attempt",
    "excessive_output",
    "memory_exhaustion",
    "filesystem_escape",
    "network_attempt",
    "signal_or_crash",
    "queue_cancellation",
    "worker_loss",
    "duplicate_submission_retry",
    "hidden_test_non_disclosure",
    "cross_user_result_isolation",
    "concurrency_limit"
  ];
}

export function taskRequiresExecution(taskKind: JudgeTaskKind): boolean {
  return taskKind === "compile_and_run";
}
