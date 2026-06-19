import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { describe, expect, it } from "vitest";
import { createDockerCliLauncher, type JudgeProcess, type JudgeProcessSpawner } from "../../services/interview-judge/process-launcher";

class FakeJudgeProcess extends EventEmitter implements JudgeProcess {
  stdout = new PassThrough();
  stderr = new PassThrough();
  stdin = new PassThrough();
  killed = false;
  killedSignal: NodeJS.Signals | undefined;
  stdinText = "";

  constructor() {
    super();
    this.stdin.on("data", (chunk: Buffer) => {
      this.stdinText += chunk.toString("utf8");
    });
  }

  kill(signal?: NodeJS.Signals): boolean {
    this.killed = true;
    this.killedSignal = signal;
    return true;
  }

  close(exitCode: number | null, signal: NodeJS.Signals | null = null): void {
    this.emit("close", exitCode, signal);
  }
}

function setup(nowMs = () => 1000) {
  const processes: FakeJudgeProcess[] = [];
  const spawned: { command: string; args: string[] }[] = [];
  const spawnProcess: JudgeProcessSpawner = (command, args) => {
    const process = new FakeJudgeProcess();
    processes.push(process);
    spawned.push({ command, args });
    return process;
  };
  const launcher = createDockerCliLauncher({ spawnProcess, nowMs });
  return { launcher, processes, spawned };
}

describe("Docker CLI process launcher (#178)", () => {
  it("spawns docker with argv, forwards stdin, and returns process output", async () => {
    const { launcher, processes, spawned } = setup(() => 1000);
    const promise = launcher({
      args: ["run", "--rm", "cppfan/interview-judge:local", "/workspace/submission"],
      stdin: "fixture input\n",
      timeoutMs: 5000,
      outputLimitBytes: 1024
    });

    const process = processes[0];
    process.stdout.write("ok\n");
    process.stderr.write("warn\n");
    process.close(0);

    await expect(promise).resolves.toMatchObject({
      exitCode: 0,
      stdout: "ok\n",
      stderr: "warn\n",
      timedOut: false,
      outputExceeded: false
    });
    expect(spawned[0]).toEqual({
      command: "docker",
      args: ["run", "--rm", "cppfan/interview-judge:local", "/workspace/submission"]
    });
    expect(process.stdinText).toBe("fixture input\n");
  });

  it("kills the process on wall-time timeout", async () => {
    let now = 1000;
    const { launcher, processes } = setup(() => now);
    const promise = launcher({ args: ["run"], timeoutMs: 1, outputLimitBytes: 1024 });

    await new Promise((resolve) => setTimeout(resolve, 5));
    const process = processes[0];
    now = 1008;
    expect(process.killed).toBe(true);
    expect(process.killedSignal).toBe("SIGKILL");
    process.close(null, "SIGKILL");

    await expect(promise).resolves.toMatchObject({
      exitCode: null,
      timedOut: true,
      runtimeMs: 8
    });
  });

  it("enforces the combined stdout/stderr output cap", async () => {
    const { launcher, processes } = setup(() => 1000);
    const promise = launcher({ args: ["run"], timeoutMs: 5000, outputLimitBytes: 5 });

    const process = processes[0];
    process.stdout.write("hello world");
    expect(process.killed).toBe(true);
    process.close(null, "SIGKILL");

    await expect(promise).resolves.toMatchObject({
      stdout: "hello",
      outputExceeded: true
    });
  });

  it("maps Docker OOM-style exits to memoryExceeded", async () => {
    const { launcher, processes } = setup(() => 1000);
    const promise = launcher({ args: ["run"], timeoutMs: 5000, outputLimitBytes: 1024 });

    const process = processes[0];
    process.stderr.write("container out of memory\n");
    process.close(137);

    await expect(promise).resolves.toMatchObject({
      exitCode: 137,
      memoryExceeded: true
    });
  });
});
