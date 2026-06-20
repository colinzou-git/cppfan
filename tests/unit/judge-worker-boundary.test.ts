import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildJudgeRequest, createJudgeClient } from "@/features/interview/judge-client";
import { DEFAULT_JUDGE_LIMITS, type JudgeSubmission, type TestOutcome } from "@/features/interview/judge-contract";
import {
  JUDGE_SANDBOX_POLICY,
  WORKER_CAPABILITIES,
  buildSandboxRunManifest,
  createJudgeQueue,
  redactedLearnerResult,
  resultFromOutcomes,
  securityRegressionCases,
  taskRequiresExecution,
  validateWorkerRequest
} from "../../services/interview-judge/sandbox-policy";
import type { JudgeWorkerRequest, JudgeWorkerTest } from "../../services/interview-judge/protocol";

const submission: JudgeSubmission = {
  submissionId: "00000000-0000-4000-8000-000000000178",
  problemId: "iv.sliding.longest-window-under-budget",
  problemVersion: 1,
  compiler: "gcc",
  standard: "c++20",
  sourceHash: "sha256:abc",
  sourceBytes: 1024
};

const visible: JudgeWorkerTest = {
  id: "visible.sample_1",
  name: "sample_1",
  hidden: false,
  category: "sample",
  fixtureHash: "0123456789abcdef"
};

const hidden: JudgeWorkerTest = {
  id: "hidden.edge_1",
  name: "edge_1",
  hidden: true,
  category: "edge",
  fixtureHash: "fedcba9876543210"
};

function request(overrides: Partial<JudgeWorkerRequest> = {}): JudgeWorkerRequest {
  return {
    submission,
    taskKind: "compile_and_run",
    tests: [visible, hidden],
    limits: DEFAULT_JUDGE_LIMITS,
    ...overrides
  };
}

describe("judge worker boundary (#178)", () => {
  it("keeps execution out of the Next.js app adapter", () => {
    const source = readFileSync("src/features/interview/judge-client.ts", "utf8");
    expect(source).not.toMatch(/child_process|spawn|exec|docker|clang|g\+\+/);
  });

  it("ships a reproducible rootless GCC/Clang worker image", () => {
    const dockerfile = readFileSync("services/interview-judge/Dockerfile", "utf8");
    expect(dockerfile).toMatch(/FROM ubuntu:24\.04/);
    expect(dockerfile).toMatch(/clang/);
    expect(dockerfile).toMatch(/g\+\+/);
    expect(dockerfile).toMatch(/USER 65532:65532/);
  });

  it("supports GCC/Clang, C++17/C++20, compile-only, and compile+run tasks", () => {
    expect(WORKER_CAPABILITIES.compilers).toEqual(["gcc", "clang"]);
    expect(WORKER_CAPABILITIES.standards).toEqual(["c++17", "c++20"]);
    expect(WORKER_CAPABILITIES.taskKinds).toEqual(["compile_only", "compile_and_run"]);
    expect(taskRequiresExecution("compile_only")).toBe(false);
    expect(taskRequiresExecution("compile_and_run")).toBe(true);
  });

  it("declares isolation, resource limits, no network, non-root, and cleanup", () => {
    const manifest = buildSandboxRunManifest(request());
    expect(JUDGE_SANDBOX_POLICY.isolation).toEqual({
      runtimeBoundary: "separate_worker_service",
      network: "none",
      rootFilesystem: "read_only",
      writableWorkspace: "ephemeral_workspace",
      user: "non_root",
      syscallIsolation: "seccomp_or_microvm",
      cleanup: "always"
    });
    expect(manifest.args).toContain("--network=none");
    expect(manifest.args).toContain("--read-only");
    expect(manifest.args).toContain("--tmpfs=/tmp:rw,nosuid,nodev,noexec");
    expect(manifest.args).toContain("type=bind,source=<temporary workspace>,target=/workspace");
    expect(manifest.args).toContain("--workdir");
    expect(manifest.args).toContain("/workspace");
    expect(manifest.args).toContain("--user=65532:65532");
    expect(manifest.args).toContain("--cap-drop=ALL");
    expect(manifest.args).toContain("--security-opt=no-new-privileges");
    expect(manifest.pidsLimit).toBe(DEFAULT_JUDGE_LIMITS.maxProcesses);
    expect(manifest.timeoutMs).toBe(DEFAULT_JUDGE_LIMITS.wallMs);
    expect(manifest.memoryMb).toBe(DEFAULT_JUDGE_LIMITS.memoryMb);
    expect(manifest.cpuSeconds).toBe(2);
    expect(manifest.fileSizeBytes).toBe(DEFAULT_JUDGE_LIMITS.maxFileKb * 1024);
    expect(manifest.outputKb).toBe(DEFAULT_JUDGE_LIMITS.outputKb);
    expect(manifest.cleanup).toBe("rm");
  });

  it("rejects unsupported compilers, standards, oversized sources, too many tests, and unhashed fixtures", () => {
    expect(validateWorkerRequest(request()).ok).toBe(true);
    expect(validateWorkerRequest(request({ submission: { ...submission, compiler: "zig" as never } }))).toEqual({
      ok: false,
      reason: "unsupported_compiler"
    });
    expect(validateWorkerRequest(request({ submission: { ...submission, standard: "c++23" as never } }))).toEqual({
      ok: false,
      reason: "unsupported_standard"
    });
    expect(
      validateWorkerRequest(
        request({
          submission: { ...submission, sourceBytes: DEFAULT_JUDGE_LIMITS.maxSourceBytes + 1 }
        })
      )
    ).toEqual({
      ok: false,
      reason: "source_size_limit"
    });
    expect(
      validateWorkerRequest(
        request({
          tests: Array.from({ length: DEFAULT_JUDGE_LIMITS.maxTests + 1 }, (_, i) => ({
            ...visible,
            id: `t${i}`
          }))
        })
      )
    ).toEqual({
      ok: false,
      reason: "test_count_limit"
    });
    expect(validateWorkerRequest(request({ tests: [{ ...visible, fixtureHash: "" }] }))).toEqual({
      ok: false,
      reason: "missing_fixture_hash"
    });
  });

  it("lets the web client enqueue only bounded worker requests", async () => {
    const enqueued: JudgeWorkerRequest[] = [];
    const client = createJudgeClient({
      async enqueue(workerRequest) {
        enqueued.push(workerRequest);
        return { status: "queued", submissionId: workerRequest.submission.submissionId };
      }
    });

    await expect(
      client.enqueue({
        submission,
        taskKind: "compile_only",
        visibleTests: [visible],
        hiddenTests: [hidden]
      })
    ).resolves.toEqual({
      status: "queued",
      submissionId: submission.submissionId
    });
    expect(enqueued[0]?.taskKind).toBe("compile_only");

    await expect(
      client.enqueue({
        submission: { ...submission, sourceBytes: DEFAULT_JUDGE_LIMITS.maxSourceBytes + 1 },
        taskKind: "compile_and_run",
        visibleTests: [visible],
        hiddenTests: [hidden]
      })
    ).resolves.toEqual({ status: "rejected", reason: "submission_limits_exceeded" });
  });

  it("keeps hidden test names and fixtures out of learner-facing results", () => {
    const outcomes: TestOutcome[] = [
      { name: "sample_1", hidden: false, passed: false },
      { name: "edge_1", hidden: true, passed: false }
    ];
    const result = resultFromOutcomes(submission.submissionId, "wrong_answer", true, outcomes, 20, 12);
    const view = redactedLearnerResult(result, outcomes);
    expect(view.failedVisibleTests).toEqual(["sample_1"]);
    expect(view.failedHiddenCount).toBe(1);
    expect(JSON.stringify(view)).not.toContain("edge_1");
    expect(JSON.stringify(view)).not.toContain(hidden.fixtureHash);
  });

  it("provides idempotent queue records, cancellation, and worker-loss failure mapping", () => {
    const queue = createJudgeQueue(() => 1000);
    const first = queue.enqueue(request(), "learner-a");
    const replay = queue.enqueue(request(), "learner-a");
    expect(first.status).toBe("queued");
    expect(replay.status).toBe("duplicate");
    expect(first.record?.submissionId).toBe(replay.record?.submissionId);

    expect(queue.cancel(submission.submissionId)).toBe(true);
    expect(queue.get(submission.submissionId)?.state).toBe("canceled");
    expect(
      queue.complete(
        submission.submissionId,
        resultFromOutcomes(submission.submissionId, "accepted", true, [
          { name: "sample_1", hidden: false, passed: true }
        ])
      )
    ).toBe(false);

    const lostId = "00000000-0000-4000-8000-000000000179";
    queue.enqueue(request({ submission: { ...submission, submissionId: lostId } }), "learner-b");
    const lost = queue.markWorkerLost(lostId);
    expect(lost?.status).toBe("infrastructure_error");
    expect(queue.get(lostId)?.state).toBe("completed");
  });

  it("enforces per-user and global queue, rate, and concurrency limits", () => {
    let now = 1_000;
    const queue = createJudgeQueue(() => now, {
      perUserSubmissionsPerMinute: 2,
      globalSubmissionsPerMinute: 3,
      perUserQueued: 2,
      perUserRunning: 1,
      globalRunning: 2
    });
    const withId = (suffix: number) =>
      request({
        submission: {
          ...submission,
          submissionId: `00000000-0000-4000-8000-${String(suffix).padStart(12, "0")}`
        }
      });

    expect(queue.enqueue(withId(1), "learner-a").status).toBe("queued");
    expect(queue.enqueue(withId(2), "learner-a").status).toBe("queued");
    expect(queue.enqueue(withId(3), "learner-a")).toMatchObject({
      status: "rejected",
      reason: "per_user_queue_limit"
    });
    expect(queue.start(withId(1).submission.submissionId).status).toBe("running");
    expect(queue.start(withId(2).submission.submissionId)).toMatchObject({
      status: "rejected",
      reason: "per_user_concurrency_limit"
    });
    expect(queue.enqueue(withId(3), "learner-b").status).toBe("queued");
    expect(queue.start(withId(3).submission.submissionId).status).toBe("running");
    expect(queue.enqueue(withId(4), "learner-c")).toMatchObject({
      status: "rejected",
      reason: "global_rate_limit"
    });

    now += 60_001;
    expect(queue.enqueue(withId(4), "learner-c").status).toBe("queued");
    expect(queue.start(withId(4).submission.submissionId)).toMatchObject({
      status: "rejected",
      reason: "global_concurrency_limit"
    });
  });

  it("tracks every required security and reliability regression category", () => {
    expect(new Set(securityRegressionCases())).toEqual(
      new Set([
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
      ])
    );
  });

  it("builds a bounded request without raw hidden fixture values", () => {
    const built = buildJudgeRequest({
      submission,
      taskKind: "compile_and_run",
      visibleTests: [visible],
      hiddenTests: [hidden]
    });
    expect("error" in built).toBe(false);
    expect(JSON.stringify(built)).not.toContain("expected");
    expect(JSON.stringify(built)).not.toContain("stdin");
  });
});
