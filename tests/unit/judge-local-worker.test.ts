import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { type JudgeSubmission } from "@/features/interview/judge-contract";
import { type DockerInvocation, type DockerLauncher } from "../../services/interview-judge/docker-executor";
import { runLocalDockerJudge } from "../../services/interview-judge/local-worker";
import type { JudgeWorkerRequest, JudgeWorkerTest } from "../../services/interview-judge/protocol";
import type { JudgeFixture, WorkerProcessResult } from "../../services/interview-judge/worker-runner";

const tempRoots: string[] = [];

async function makeTempRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "cppfan-local-worker-test-"));
  tempRoots.push(root);
  return root;
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function mountSource(args: string[]): string {
  const mount = args.find((arg) => arg.startsWith("type=bind,source="));
  if (!mount) {
    throw new Error("missing docker workspace mount");
  }
  return mount.replace(/^type=bind,source=/, "").replace(/,target=\/workspace$/, "");
}

const source = '#include <iostream>\nint main(){ std::cout << "ok"; }\n';

const submission: JudgeSubmission = {
  submissionId: "00000000-0000-4000-8000-000000000378",
  problemId: "iv.local.worker",
  problemVersion: 1,
  compiler: "gcc",
  standard: "c++20",
  sourceHash: "sha256:local-worker",
  sourceBytes: Buffer.byteLength(source, "utf8")
};

const visible: JudgeWorkerTest = {
  id: "visible.sample",
  name: "sample",
  hidden: false,
  category: "sample",
  fixtureHash: "0123456789abcdef"
};

const hidden: JudgeWorkerTest = {
  id: "hidden.secret",
  name: "secret-shape",
  hidden: true,
  category: "edge",
  fixtureHash: "fedcba9876543210"
};

const fixtures: JudgeFixture[] = [
  { testId: visible.id, stdin: "visible input\n", expectedStdout: "ok\n" },
  { testId: hidden.id, stdin: "SECRET hidden input\n", expectedStdout: "ok\n" }
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

function ok(stdout = ""): WorkerProcessResult {
  return { exitCode: 0, stdout, stderr: "", runtimeMs: 10, memoryMb: 32 };
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("local Docker judge worker composition (#178)", () => {
  it("runs the worker through workspace, Docker executor, and runner contracts", async () => {
    const workspaceRootDir = await makeTempRoot();
    const invocations: DockerInvocation[] = [];
    let workspacePath = "";
    let sourceDuringCompile = "";
    const launch: DockerLauncher = async (invocation) => {
      invocations.push(invocation);
      workspacePath = mountSource(invocation.args);
      if (invocation.args.includes("g++")) {
        sourceDuringCompile = await readFile(join(workspacePath, "submission.cpp"), "utf8");
        return ok();
      }
      return ok("ok\n");
    };

    const result = await runLocalDockerJudge({
      request: request(),
      source,
      fixtures,
      workspaceRootDir,
      launch
    });

    expect(result).toMatchObject({
      status: "accepted",
      compiled: true,
      visible: { passed: 1, total: 1 },
      hidden: { passed: 1, total: 1 }
    });
    expect(invocations).toHaveLength(3);
    expect(sourceDuringCompile).toBe(source);
    expect(invocations.every((invocation) => invocation.args.includes("--network=none"))).toBe(true);
    expect(invocations.map((invocation) => invocation.stdin)).toEqual([
      undefined,
      "visible input\n",
      "SECRET hidden input\n"
    ]);
    expect(invocations.map((invocation) => invocation.args.join(" ")).join("\n")).not.toContain("SECRET hidden input");
    await expect(exists(workspacePath)).resolves.toBe(false);
  });

  it("cleans up the workspace when the Docker launcher fails", async () => {
    const workspaceRootDir = await makeTempRoot();
    let workspacePath = "";
    const launch: DockerLauncher = async (invocation) => {
      workspacePath = mountSource(invocation.args);
      throw new Error("docker unavailable");
    };

    await expect(
      runLocalDockerJudge({ request: request(), source, fixtures, workspaceRootDir, launch })
    ).rejects.toThrow("docker unavailable");
    expect(workspacePath).not.toBe("");
    await expect(exists(workspacePath)).resolves.toBe(false);
  });
});
