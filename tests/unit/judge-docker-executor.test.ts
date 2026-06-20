import { describe, expect, it } from "vitest";
import {
  buildDockerRunArgs,
  createDockerExecutor,
  type DockerInvocation
} from "../../services/interview-judge/docker-executor";
import type { WorkerProcessCommand } from "../../services/interview-judge/worker-runner";

const command: WorkerProcessCommand = {
  kind: "run",
  argv: ["/workspace/submission"],
  stdin: "hidden fixture input\n",
  timeoutMs: 5000,
  outputLimitBytes: 64 * 1024,
  cpuSeconds: 2,
  fileSizeBytes: 1024 * 1024,
  memoryMb: 256,
  pidsLimit: 8
};

describe("local Docker executor boundary (#178)", () => {
  it("wraps worker commands in the documented isolated docker envelope", () => {
    const args = buildDockerRunArgs(command, { workspacePath: "/tmp/cppfan-judge-1" });

    expect(args).toContain("run");
    expect(args).toContain("--rm");
    expect(args).toContain("--network=none");
    expect(args).toContain("--read-only");
    expect(args).toContain("--tmpfs=/tmp:rw,nosuid,nodev,noexec");
    expect(args).toContain("type=bind,source=/tmp/cppfan-judge-1,target=/workspace");
    expect(args).toContain("--workdir");
    expect(args).toContain("/workspace");
    expect(args).toContain("--user=65532:65532");
    expect(args).toContain("--cap-drop=ALL");
    expect(args).toContain("--security-opt=no-new-privileges");
    expect(args).toContain("--pids-limit");
    expect(args).toContain("8");
    expect(args).toContain("--memory");
    expect(args).toContain("256m");
    expect(args).toContain("cpu=2:2");
    expect(args).toContain("fsize=1048576:1048576");
    expect(args).toContain("--cpus");
    expect(args).toContain("1");
    expect(args).toContain("cppfan/interview-judge:local");
    expect(args.at(-1)).toBe("/workspace/submission");
  });

  it("allows image/workspace/cpu overrides for local Codespaces wiring", () => {
    const args = buildDockerRunArgs(command, {
      image: "local/custom-judge:test",
      workspacePath: "C:/tmp/cppfan-judge-2",
      containerWorkspace: "/judge-workspace",
      cpus: 0.5
    });

    expect(args).toContain("type=bind,source=C:/tmp/cppfan-judge-2,target=/judge-workspace");
    expect(args).toContain("/judge-workspace");
    expect(args).toContain("0.5");
    expect(args).toContain("local/custom-judge:test");
  });

  it("creates an executor that forwards stdin and limits without exposing fixtures in args", async () => {
    const invocations: DockerInvocation[] = [];
    const executor = createDockerExecutor({ workspacePath: "/tmp/cppfan-judge-3" }, async (invocation) => {
      invocations.push(invocation);
      return { exitCode: 0, stdout: "ok\n", stderr: "", runtimeMs: 10, memoryMb: 20 };
    });

    const result = await executor(command);
    expect(result.exitCode).toBe(0);
    expect(invocations[0]?.stdin).toBe("hidden fixture input\n");
    expect(invocations[0]?.timeoutMs).toBe(5000);
    expect(invocations[0]?.outputLimitBytes).toBe(64 * 1024);
    expect(invocations[0]?.args.join(" ")).not.toContain("hidden fixture input");
  });
});
