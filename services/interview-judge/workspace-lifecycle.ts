import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { DEFAULT_JUDGE_LIMITS } from "@/features/interview/judge-contract";

export const JUDGE_SUBMISSION_FILENAME = "submission.cpp";

export type JudgeWorkspaceErrorCode = "empty_source" | "source_size_limit";

export class JudgeWorkspaceError extends Error {
  code: JudgeWorkspaceErrorCode;

  constructor(code: JudgeWorkspaceErrorCode, message: string) {
    super(message);
    this.name = "JudgeWorkspaceError";
    this.code = code;
  }
}

export type CreateJudgeWorkspaceInput = {
  submissionId: string;
  source: string;
  rootDir?: string;
  containerWorkspace?: string;
  maxSourceBytes?: number;
};

export type JudgeWorkspace = {
  hostPath: string;
  hostSubmissionPath: string;
  containerWorkspace: string;
  containerSubmissionPath: string;
  sourceBytes: number;
  cleanup(): Promise<void>;
};

function safeWorkspaceId(submissionId: string): string {
  const safe = submissionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
  return safe.length > 0 ? safe : "submission";
}

function joinContainerPath(containerWorkspace: string, filename: string): string {
  const root = containerWorkspace.replace(/\/+$/g, "");
  return `${root.length > 0 ? root : ""}/${filename}`;
}

export async function createJudgeWorkspace(input: CreateJudgeWorkspaceInput): Promise<JudgeWorkspace> {
  const sourceBytes = Buffer.byteLength(input.source, "utf8");
  const maxSourceBytes = input.maxSourceBytes ?? DEFAULT_JUDGE_LIMITS.maxSourceBytes;
  if (sourceBytes <= 0) {
    throw new JudgeWorkspaceError("empty_source", "Judge submission source must not be empty.");
  }
  if (sourceBytes > maxSourceBytes) {
    throw new JudgeWorkspaceError("source_size_limit", "Judge submission source exceeds the configured byte limit.");
  }

  const rootDir = input.rootDir ?? tmpdir();
  await mkdir(rootDir, { recursive: true });

  const hostPath = await mkdtemp(join(rootDir, `cppfan-judge-${safeWorkspaceId(input.submissionId)}-`));
  const hostSubmissionPath = join(hostPath, JUDGE_SUBMISSION_FILENAME);
  await writeFile(hostSubmissionPath, input.source, { encoding: "utf8", flag: "wx" });

  const containerWorkspace = input.containerWorkspace ?? "/workspace";
  return {
    hostPath,
    hostSubmissionPath,
    containerWorkspace,
    containerSubmissionPath: joinContainerPath(containerWorkspace, JUDGE_SUBMISSION_FILENAME),
    sourceBytes,
    cleanup: () => rm(hostPath, { recursive: true, force: true })
  };
}

export async function withJudgeWorkspace<T>(
  input: CreateJudgeWorkspaceInput,
  run: (workspace: JudgeWorkspace) => Promise<T>
): Promise<T> {
  const workspace = await createJudgeWorkspace(input);
  try {
    return await run(workspace);
  } finally {
    await workspace.cleanup();
  }
}
