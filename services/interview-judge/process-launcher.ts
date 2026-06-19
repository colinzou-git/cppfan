import { spawn, type SpawnOptionsWithoutStdio } from "node:child_process";
import type { Writable } from "node:stream";
import type { DockerInvocation, DockerLauncher } from "./docker-executor";
import type { WorkerProcessResult } from "./worker-runner";

export type JudgeProcess = {
  stdout: NodeJS.ReadableStream | null;
  stderr: NodeJS.ReadableStream | null;
  stdin: Writable | null;
  kill(signal?: NodeJS.Signals): boolean;
  on(event: "close", listener: (code: number | null, signal: NodeJS.Signals | null) => void): JudgeProcess;
  on(event: "error", listener: (error: Error) => void): JudgeProcess;
};

export type JudgeProcessSpawner = (
  command: string,
  args: string[],
  options: SpawnOptionsWithoutStdio
) => JudgeProcess;

export type DockerCliLauncherOptions = {
  command?: string;
  spawnProcess?: JudgeProcessSpawner;
  nowMs?: () => number;
  killSignal?: NodeJS.Signals;
};

type OutputCapture = {
  append(chunk: string | Buffer): void;
  text(): string;
};

function createBoundedCapture(limit: () => number, consume: (bytes: number) => void, onExceeded: () => void): OutputCapture {
  const chunks: Buffer[] = [];

  return {
    append(chunk) {
      if (limit() <= 0) {
        onExceeded();
        return;
      }

      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      const allowed = Math.min(bytes.byteLength, limit());
      if (allowed > 0) {
        chunks.push(bytes.subarray(0, allowed));
        consume(allowed);
      }
      if (allowed < bytes.byteLength) {
        onExceeded();
      }
    },
    text() {
      return Buffer.concat(chunks).toString("utf8");
    }
  };
}

function isLikelyMemoryLimit(exitCode: number | null, signal: string | null, stderr: string): boolean {
  if (exitCode === 137 || signal === "SIGKILL") {
    return /out of memory|oom|memory/i.test(stderr);
  }
  return /container killed due to memory usage|out of memory|oom-killed/i.test(stderr);
}

export function createDockerCliLauncher(options: DockerCliLauncherOptions = {}): DockerLauncher {
  const command = options.command ?? "docker";
  const spawnProcess = options.spawnProcess ?? spawn;
  const nowMs = options.nowMs ?? Date.now;
  const killSignal = options.killSignal ?? "SIGKILL";

  return (invocation: DockerInvocation) =>
    new Promise<WorkerProcessResult>((resolve) => {
      const startMs = nowMs();
      let settled = false;
      let timedOut = false;
      let outputExceeded = false;
      let usedOutputBytes = 0;
      let processRef: JudgeProcess | null = null;

      const remainingOutputBytes = () => invocation.outputLimitBytes - usedOutputBytes;
      const markOutputExceeded = () => {
        if (outputExceeded) return;
        outputExceeded = true;
        processRef?.kill(killSignal);
      };

      const stdout = createBoundedCapture(remainingOutputBytes, (bytes) => {
        usedOutputBytes += bytes;
      }, markOutputExceeded);
      const stderr = createBoundedCapture(remainingOutputBytes, (bytes) => {
        usedOutputBytes += bytes;
      }, markOutputExceeded);

      const finish = (partial: Omit<WorkerProcessResult, "stdout" | "stderr" | "runtimeMs">) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const stderrText = stderr.text();
        resolve({
          ...partial,
          stdout: stdout.text(),
          stderr: stderrText,
          timedOut,
          outputExceeded,
          memoryExceeded:
            partial.memoryExceeded ?? (!timedOut && isLikelyMemoryLimit(partial.exitCode, partial.signal ?? null, stderrText)),
          runtimeMs: Math.max(0, nowMs() - startMs)
        });
      };

      const timer = setTimeout(() => {
        timedOut = true;
        processRef?.kill(killSignal);
      }, invocation.timeoutMs);

      try {
        processRef = spawnProcess(command, invocation.args, { stdio: "pipe" });
      } catch (error) {
        stderr.append(error instanceof Error ? error.message : String(error));
        finish({ exitCode: null, signal: null });
        return;
      }

      processRef.stdout?.on("data", (chunk: string | Buffer) => stdout.append(chunk));
      processRef.stderr?.on("data", (chunk: string | Buffer) => stderr.append(chunk));
      processRef.on("error", (error) => {
        stderr.append(error.message);
        finish({ exitCode: null, signal: null });
      });
      processRef.on("close", (exitCode, signal) => {
        finish({ exitCode, signal });
      });

      if (invocation.stdin) {
        processRef.stdin?.write(invocation.stdin);
      }
      processRef.stdin?.end();
    });
}
