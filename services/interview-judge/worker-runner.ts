import {
  DEFAULT_JUDGE_LIMITS,
  type JudgeCompiler,
  type JudgeLimits,
  type JudgeResult,
  type JudgeStatus,
  type TestOutcome
} from "@/features/interview/judge-contract";
import { infrastructureFailureResult, resultFromOutcomes, validateWorkerRequest } from "./sandbox-policy";
import type { JudgeWorkerRequest } from "./protocol";

export type JudgeFixture = {
  testId: string;
  stdin: string;
  expectedStdout: string;
};

export type WorkerCommandKind = "compile" | "run";

export type WorkerProcessCommand = {
  kind: WorkerCommandKind;
  argv: string[];
  stdin?: string;
  timeoutMs: number;
  outputLimitBytes: number;
  memoryMb: number;
  pidsLimit: number;
};

export type WorkerProcessResult = {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut?: boolean;
  memoryExceeded?: boolean;
  signal?: string | null;
  runtimeMs?: number | null;
  memoryMb?: number | null;
};

export type WorkerProcessExecutor = (command: WorkerProcessCommand) => Promise<WorkerProcessResult>;

export function compilerBinary(compiler: JudgeCompiler): "g++" | "clang++" {
  return compiler === "gcc" ? "g++" : "clang++";
}

function stdFlag(standard: "c++17" | "c++20"): "-std=c++17" | "-std=c++20" {
  return standard === "c++17" ? "-std=c++17" : "-std=c++20";
}

function commandLimits(limits: JudgeLimits = DEFAULT_JUDGE_LIMITS) {
  return {
    timeoutMs: limits.wallMs,
    outputLimitBytes: limits.outputKb * 1024,
    memoryMb: limits.memoryMb,
    pidsLimit: limits.maxProcesses
  };
}

export function buildCompileCommand(request: JudgeWorkerRequest): WorkerProcessCommand {
  return {
    kind: "compile",
    argv: [
      compilerBinary(request.submission.compiler),
      stdFlag(request.submission.standard),
      "-O2",
      "-pipe",
      "-Wall",
      "-Wextra",
      "/workspace/submission.cpp",
      "-o",
      "/workspace/submission"
    ],
    ...commandLimits(request.limits)
  };
}

export function buildRunCommand(request: JudgeWorkerRequest, fixture: JudgeFixture): WorkerProcessCommand {
  return {
    kind: "run",
    argv: ["/workspace/submission"],
    stdin: fixture.stdin,
    ...commandLimits(request.limits)
  };
}

function normalizeOutput(value: string): string {
  return value.replace(/\r\n/g, "\n").trimEnd();
}

function statusFromProcess(result: WorkerProcessResult): JudgeStatus | null {
  if (result.timedOut) return "timeout";
  if (result.memoryExceeded) return "memory_limit";
  if (result.exitCode !== 0) return "runtime_error";
  return null;
}

function maxMetric(values: (number | null | undefined)[]): number | null {
  const measured = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return measured.length > 0 ? Math.max(...measured) : null;
}

export type RunJudgeInput = {
  request: JudgeWorkerRequest;
  fixtures: JudgeFixture[];
  executor: WorkerProcessExecutor;
};

export async function runJudgeRequest({ request, fixtures, executor }: RunJudgeInput): Promise<JudgeResult> {
  const validation = validateWorkerRequest(request);
  if (!validation.ok) {
    return infrastructureFailureResult(request.submission.submissionId);
  }

  const fixtureById = new Map(fixtures.map((fixture) => [fixture.testId, fixture]));
  if (request.taskKind === "compile_and_run" && request.tests.some((test) => !fixtureById.has(test.id))) {
    return infrastructureFailureResult(request.submission.submissionId);
  }

  const compile = await executor(buildCompileCommand(request));
  if (compile.timedOut) {
    return resultFromOutcomes(request.submission.submissionId, "timeout", false, [], compile.runtimeMs ?? null, compile.memoryMb ?? null);
  }
  if (compile.memoryExceeded) {
    return resultFromOutcomes(request.submission.submissionId, "memory_limit", false, [], compile.runtimeMs ?? null, compile.memoryMb ?? null);
  }
  if (compile.exitCode !== 0) {
    return resultFromOutcomes(request.submission.submissionId, "compile_error", false, [], compile.runtimeMs ?? null, compile.memoryMb ?? null);
  }

  if (request.taskKind === "compile_only") {
    return resultFromOutcomes(request.submission.submissionId, "accepted", true, [], compile.runtimeMs ?? null, compile.memoryMb ?? null);
  }

  const outcomes: TestOutcome[] = [];
  const runtimeSamples: (number | null | undefined)[] = [compile.runtimeMs];
  const memorySamples: (number | null | undefined)[] = [compile.memoryMb];

  for (const test of request.tests) {
    const fixture = fixtureById.get(test.id);
    if (!fixture) {
      return infrastructureFailureResult(request.submission.submissionId);
    }

    const run = await executor(buildRunCommand(request, fixture));
    runtimeSamples.push(run.runtimeMs);
    memorySamples.push(run.memoryMb);
    const processStatus = statusFromProcess(run);
    if (processStatus) {
      outcomes.push({ name: test.name, hidden: test.hidden, passed: false });
      return resultFromOutcomes(
        request.submission.submissionId,
        processStatus,
        true,
        outcomes,
        maxMetric(runtimeSamples),
        maxMetric(memorySamples)
      );
    }

    outcomes.push({
      name: test.name,
      hidden: test.hidden,
      passed: normalizeOutput(run.stdout) === normalizeOutput(fixture.expectedStdout)
    });
  }

  const status = outcomes.every((outcome) => outcome.passed) ? "accepted" : "wrong_answer";
  return resultFromOutcomes(request.submission.submissionId, status, true, outcomes, maxMetric(runtimeSamples), maxMetric(memorySamples));
}
