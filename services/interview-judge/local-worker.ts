import type { JudgeResult } from "@/features/interview/judge-contract";
import { createDockerExecutor, type DockerLauncher } from "./docker-executor";
import { createDockerCliLauncher, type DockerCliLauncherOptions } from "./process-launcher";
import type { JudgeWorkerRequest } from "./protocol";
import { type JudgeFixture, runJudgeRequest } from "./worker-runner";
import { withJudgeWorkspace } from "./workspace-lifecycle";

export type RunLocalDockerJudgeInput = {
  request: JudgeWorkerRequest;
  source: string;
  fixtures: JudgeFixture[];
  workspaceRootDir?: string;
  image?: string;
  cpus?: number;
  launch?: DockerLauncher;
  cli?: DockerCliLauncherOptions;
};

export async function runLocalDockerJudge(input: RunLocalDockerJudgeInput): Promise<JudgeResult> {
  const launch = input.launch ?? createDockerCliLauncher(input.cli);

  return withJudgeWorkspace(
    {
      submissionId: input.request.submission.submissionId,
      source: input.source,
      rootDir: input.workspaceRootDir,
      maxSourceBytes: input.request.limits.maxSourceBytes
    },
    async (workspace) => {
      const executor = createDockerExecutor(
        {
          image: input.image,
          workspacePath: workspace.hostPath,
          cpus: input.cpus
        },
        launch
      );
      return runJudgeRequest({ request: input.request, fixtures: input.fixtures, executor });
    }
  );
}
