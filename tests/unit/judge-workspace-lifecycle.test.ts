import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import {
  createJudgeWorkspace,
  JudgeWorkspaceError,
  JUDGE_SUBMISSION_FILENAME,
  withJudgeWorkspace
} from "../../services/interview-judge/workspace-lifecycle";

const tempRoots: string[] = [];

async function makeTempRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "cppfan-judge-workspace-test-"));
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

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("judge workspace lifecycle (#178)", () => {
  it("creates a sanitized per-submission workspace and writes submission.cpp", async () => {
    const rootDir = await makeTempRoot();
    const workspace = await createJudgeWorkspace({
      submissionId: "user/../secret:submission",
      source: "#include <iostream>\nint main(){ std::cout << 42; }\n",
      rootDir
    });

    expect(workspace.hostPath.startsWith(rootDir)).toBe(true);
    expect(basename(workspace.hostPath)).toMatch(/^cppfan-judge-user____secret_submission-/);
    expect(workspace.hostSubmissionPath).toBe(join(workspace.hostPath, JUDGE_SUBMISSION_FILENAME));
    await expect(readFile(workspace.hostSubmissionPath, "utf8")).resolves.toContain("std::cout << 42");
    expect(workspace.containerWorkspace).toBe("/workspace");
    expect(workspace.containerSubmissionPath).toBe("/workspace/submission.cpp");
    expect(workspace.sourceBytes).toBe(Buffer.byteLength("#include <iostream>\nint main(){ std::cout << 42; }\n", "utf8"));

    await workspace.cleanup();
    await expect(exists(workspace.hostPath)).resolves.toBe(false);
  });

  it("supports custom container workspace paths", async () => {
    const rootDir = await makeTempRoot();
    const workspace = await createJudgeWorkspace({
      submissionId: "sub-custom-path",
      source: "int main(){}\n",
      rootDir,
      containerWorkspace: "/judge-workspace/"
    });

    expect(workspace.containerSubmissionPath).toBe("/judge-workspace/submission.cpp");
  });

  it("rejects empty and oversized sources before writing a workspace", async () => {
    const rootDir = await makeTempRoot();

    await expect(createJudgeWorkspace({ submissionId: "empty", source: "", rootDir })).rejects.toMatchObject({
      code: "empty_source"
    });
    await expect(
      createJudgeWorkspace({ submissionId: "too-large", source: "abcdef", rootDir, maxSourceBytes: 5 })
    ).rejects.toMatchObject({
      code: "source_size_limit"
    });
  });

  it("cleans up the workspace when the judge callback throws", async () => {
    const rootDir = await makeTempRoot();
    let observedPath = "";

    await expect(
      withJudgeWorkspace({ submissionId: "throwing", source: "int main(){}\n", rootDir }, async (workspace) => {
        observedPath = workspace.hostPath;
        throw new JudgeWorkspaceError("source_size_limit", "simulated failure");
      })
    ).rejects.toMatchObject({ code: "source_size_limit" });

    expect(observedPath).not.toBe("");
    await expect(exists(observedPath)).resolves.toBe(false);
  });
});
