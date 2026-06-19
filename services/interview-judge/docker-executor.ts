import type { WorkerProcessCommand, WorkerProcessExecutor, WorkerProcessResult } from "./worker-runner";

export type DockerExecutorOptions = {
  image?: string;
  workspacePath: string;
  containerWorkspace?: string;
  cpus?: number;
};

export type DockerInvocation = {
  args: string[];
  stdin?: string;
  timeoutMs: number;
  outputLimitBytes: number;
};

export type DockerLauncher = (invocation: DockerInvocation) => Promise<WorkerProcessResult>;

const DEFAULT_IMAGE = "cppfan/interview-judge:local";
const DEFAULT_CONTAINER_WORKSPACE = "/workspace";

export function buildDockerRunArgs(command: WorkerProcessCommand, options: DockerExecutorOptions): string[] {
  const image = options.image ?? DEFAULT_IMAGE;
  const containerWorkspace = options.containerWorkspace ?? DEFAULT_CONTAINER_WORKSPACE;
  const cpus = options.cpus ?? 1;

  return [
    "run",
    "--rm",
    "--network=none",
    "--read-only",
    "--tmpfs=/tmp:rw,nosuid,nodev,noexec",
    "--mount",
    `type=bind,source=${options.workspacePath},target=${containerWorkspace}`,
    "--workdir",
    containerWorkspace,
    "--user=65532:65532",
    "--cap-drop=ALL",
    "--security-opt=no-new-privileges",
    "--pids-limit",
    String(command.pidsLimit),
    "--memory",
    `${command.memoryMb}m`,
    "--cpus",
    String(cpus),
    image,
    ...command.argv
  ];
}

export function createDockerExecutor(options: DockerExecutorOptions, launch: DockerLauncher): WorkerProcessExecutor {
  return async (command) =>
    launch({
      args: buildDockerRunArgs(command, options),
      stdin: command.stdin,
      timeoutMs: command.timeoutMs,
      outputLimitBytes: command.outputLimitBytes
    });
}
