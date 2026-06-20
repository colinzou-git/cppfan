import { describe, expect, it } from "vitest";
import { learnerFacingResult, type JudgeSubmission } from "@/features/interview/judge-contract";
import {
  buildCompileCommand,
  compilerBinary,
  runJudgeRequest,
  type JudgeFixture,
  type WorkerProcessCommand,
  type WorkerProcessResult
} from "../../services/interview-judge/worker-runner";
import type { JudgeWorkerRequest, JudgeWorkerTest } from "../../services/interview-judge/protocol";

const submission: JudgeSubmission = {
  submissionId: "00000000-0000-4000-8000-000000000278",
  problemId: "iv.prefix.balance-returns-to-zero",
  problemVersion: 1,
  compiler: "gcc",
  standard: "c++20",
  sourceHash: "sha256:runner",
  sourceBytes: 2048
};

const visible: JudgeWorkerTest = {
  id: "visible.sample",
  name: "sample",
  hidden: false,
  category: "sample",
  fixtureHash: "0123456789abcdef"
};

const hidden: JudgeWorkerTest = {
  id: "hidden.overflow",
  name: "overflow-with-secret-shape",
  hidden: true,
  category: "overflow",
  fixtureHash: "fedcba9876543210"
};

const fixtures: JudgeFixture[] = [
  { testId: visible.id, stdin: "visible input\n", expectedStdout: "ok\n" },
  { testId: hidden.id, stdin: "SECRET hidden input\n", expectedStdout: "hidden ok\n" }
];

function request(overrides: Partial<JudgeWorkerRequest> = {}): JudgeWorkerRequest {
  return {
    submission,
    taskKind: "compile_and_run",
    tests: [visible, hidden],
    limits: {
      cpuMs: 2000,
      wallMs: 5000,
      memoryMb: 256,
      maxProcesses: 8,
      maxFileKb: 1024,
      outputKb: 64,
      maxSourceBytes: 64 * 1024,
      maxTests: 20
    },
    ...overrides
  };
}

function ok(stdout = "ok\n"): WorkerProcessResult {
  return { exitCode: 0, stdout, stderr: "", runtimeMs: 12, memoryMb: 32 };
}

function executorFor(outputs: Record<string, WorkerProcessResult>) {
  const commands: WorkerProcessCommand[] = [];
  return {
    commands,
    async executor(command: WorkerProcessCommand): Promise<WorkerProcessResult> {
      commands.push(command);
      if (command.kind === "compile") return outputs.compile ?? ok("");
      return outputs[command.stdin ?? ""] ?? ok("");
    }
  };
}

describe("worker runner command contract (#178)", () => {
  it("builds compiler commands for GCC/Clang and C++17/C++20", () => {
    expect(compilerBinary("gcc")).toBe("g++");
    expect(compilerBinary("clang")).toBe("clang++");

    const gcc = buildCompileCommand(request());
    expect(gcc.argv).toContain("g++");
    expect(gcc.argv).toContain("-std=c++20");

    const clang = buildCompileCommand(request({ submission: { ...submission, compiler: "clang", standard: "c++17" } }));
    expect(clang.argv).toContain("clang++");
    expect(clang.argv).toContain("-std=c++17");
  });

  it("accepts compile-only submissions without running tests", async () => {
    const { commands, executor } = executorFor({ compile: ok("") });
    const result = await runJudgeRequest({
      request: request({ taskKind: "compile_only", tests: [] }),
      fixtures: [],
      executor
    });

    expect(result.status).toBe("accepted");
    expect(result.compiled).toBe(true);
    expect(result.visible.total).toBe(0);
    expect(commands.map((command) => command.kind)).toEqual(["compile"]);
  });

  it("runs visible and hidden tests and summarizes counts only", async () => {
    const { executor } = executorFor({
      compile: ok(""),
      "visible input\n": ok("ok\n"),
      "SECRET hidden input\n": ok("hidden ok\n")
    });

    const result = await runJudgeRequest({ request: request(), fixtures, executor });
    expect(result.status).toBe("accepted");
    expect(result.visible).toEqual({ passed: 1, total: 1 });
    expect(result.hidden).toEqual({ passed: 1, total: 1 });
    expect(JSON.stringify(result)).not.toContain("SECRET");
    expect(JSON.stringify(result)).not.toContain(hidden.name);
  });

  it("reports wrong_answer while learner-facing output redacts hidden names and fixtures", async () => {
    const { executor } = executorFor({
      compile: ok(""),
      "visible input\n": ok("ok\n"),
      "SECRET hidden input\n": ok("not hidden ok\n")
    });

    const result = await runJudgeRequest({ request: request(), fixtures, executor });
    expect(result.status).toBe("wrong_answer");
    expect(result.hidden).toEqual({ passed: 0, total: 1 });

    const learner = learnerFacingResult(result, [
      { name: visible.name, hidden: false, passed: true },
      { name: hidden.name, hidden: true, passed: false }
    ]);
    expect(learner.failedHiddenCount).toBe(1);
    expect(JSON.stringify(learner)).not.toContain(hidden.name);
    expect(JSON.stringify(learner)).not.toContain("SECRET");
  });

  it("maps compile, runtime, timeout, and memory failures to structured statuses", async () => {
    await expect(
      runJudgeRequest({
        request: request(),
        fixtures,
        executor: executorFor({ compile: { exitCode: 1, stdout: "", stderr: "compiler says no" } }).executor
      })
    ).resolves.toMatchObject({ status: "compile_error", compiled: false });

    await expect(
      runJudgeRequest({
        request: request(),
        fixtures,
        executor: executorFor({
          compile: ok(""),
          "visible input\n": { exitCode: 1, stdout: "", stderr: "crash" }
        }).executor
      })
    ).resolves.toMatchObject({ status: "runtime_error", compiled: true });

    await expect(
      runJudgeRequest({
        request: request(),
        fixtures,
        executor: executorFor({
          compile: ok(""),
          "visible input\n": { exitCode: null, stdout: "", stderr: "", timedOut: true }
        }).executor
      })
    ).resolves.toMatchObject({ status: "timeout", compiled: true });

    await expect(
      runJudgeRequest({
        request: request(),
        fixtures,
        executor: executorFor({
          compile: ok(""),
          "visible input\n": { exitCode: null, stdout: "", stderr: "", memoryExceeded: true }
        }).executor
      })
    ).resolves.toMatchObject({ status: "memory_limit", compiled: true });
  });

  it("treats missing server-held fixtures as infrastructure failure", async () => {
    const { executor } = executorFor({ compile: ok("") });
    const result = await runJudgeRequest({ request: request(), fixtures: [fixtures[0]], executor });
    expect(result.status).toBe("infrastructure_error");
  });
});
