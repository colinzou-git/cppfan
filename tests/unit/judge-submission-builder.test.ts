import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildJudgeSubmissionDraftFromSource } from "@/features/interview/judge-submission-builder";
import { getJudgeProblemSuite } from "@/features/interview/judge-test-suites";
import type { InterviewProblemPayload } from "@/features/user-content/interview-content-types";

const getInterviewForOwner = vi.fn();
vi.mock("@/features/user-content/user-content-queries", () => ({
  getInterviewForOwner: (contentId: string) => getInterviewForOwner(contentId)
}));

const SOURCE = "#include <bits/stdc++.h>\nint main(){ std::cout << 0 << '\\n'; }\n";

const USER_ID = "user.item.def-456";
const USER_VERSION = "33333333-3333-4333-8333-333333333333";

function userPayload(over: Partial<InterviewProblemPayload> = {}): InterviewProblemPayload {
  return {
    schemaVersion: 1,
    title: "Sum",
    statement: "Add",
    evaluationMode: "judge",
    tests: [
      { name: "v", input: "1\n", expectedOutput: "1\n", hidden: false },
      { name: "h", input: "2\n", expectedOutput: "2\n", hidden: true }
    ],
    ...over
  };
}

beforeEach(() => getInterviewForOwner.mockReset());

describe("judge submission builder (#178)", () => {
  it("builds a validated draft from source without storing the raw source", async () => {
    // Derive the expected suite metadata from the catalog so the builder
    // contract (it forwards the joined suite's counts and version) stays
    // verified as the catalog is rebalanced over time.
    const problemId = "iv.prefix.balance-returns-to-zero";
    const suite = getJudgeProblemSuite(problemId);
    expect(suite).not.toBeNull();
    if (!suite) return;

    const built = await buildJudgeSubmissionDraftFromSource({
      submissionId: "00000000-0000-4000-8000-000000000678",
      problemId,
      source: SOURCE,
      compiler: "gcc",
      standard: "c++20",
      context: {
        mode: "practice",
        sourceVersion: 2,
        assistanceUsed: false,
        priorSolutionExposed: false
      }
    });

    expect(built.status).toBe("ok");
    if (built.status !== "ok") return;
    expect(built.visibleTestCount).toBe(suite.visibleTests.length);
    expect(built.hiddenTestCount).toBe(suite.hiddenTests.length);
    expect(built.draft.submission).toMatchObject({
      problemId,
      problemVersion: suite.version,
      compiler: "gcc",
      standard: "c++20",
      sourceBytes: Buffer.byteLength(SOURCE, "utf8")
    });
    expect(built.draft.submission.sourceHash).toMatch(/^[0-9a-f]{64}$/);
    expect(built.draft.context.definitionSource).toBe("native");
    expect(built.draft.context.contentVersionId).toBeNull();
    // The learner-facing draft never carries raw source or fixtures; the
    // worker-only execution payload carries them separately.
    expect(JSON.stringify(built.draft)).not.toContain("#include");
    expect(built.execution.source).toBe(SOURCE);
    expect(built.execution.workerTests.length).toBe(suite.visibleTests.length + suite.hiddenTests.length);
    expect(built.execution.fixtures.length).toBe(suite.fixtures.length);
  });

  it("rejects unsupported problems and invalid source", async () => {
    expect(
      await buildJudgeSubmissionDraftFromSource({
        submissionId: "00000000-0000-4000-8000-000000000679",
        problemId: "iv.does-not-exist.unsupported",
        source: SOURCE,
        compiler: "gcc",
        standard: "c++20",
        context: { mode: "practice" }
      })
    ).toEqual({ status: "unsupported_problem" });

    expect(
      await buildJudgeSubmissionDraftFromSource({
        submissionId: "00000000-0000-4000-8000-000000000680",
        problemId: "iv.prefix.balance-returns-to-zero",
        source: "",
        compiler: "gcc",
        standard: "c++20",
        context: { mode: "practice" }
      })
    ).toEqual({ status: "invalid", reason: "submission_limits_exceeded" });
  });

  it("builds a draft + worker execution from an owner's published user problem", async () => {
    getInterviewForOwner.mockResolvedValue({ publishedPayload: userPayload(), publishedVersionId: USER_VERSION });
    const built = await buildJudgeSubmissionDraftFromSource({
      submissionId: "00000000-0000-4000-8000-000000000681",
      problemId: USER_ID,
      source: SOURCE,
      compiler: "gcc",
      standard: "c++20",
      contentVersionId: USER_VERSION,
      context: { mode: "practice" }
    });
    expect(built.status).toBe("ok");
    if (built.status !== "ok") return;
    expect(built.draft.context.definitionSource).toBe("user");
    expect(built.draft.context.contentVersionId).toBe(USER_VERSION);
    expect(built.visibleTestCount).toBe(1);
    expect(built.hiddenTestCount).toBe(1);
    expect(built.execution.workerTests.length).toBe(2);
    expect(built.execution.fixtures.length).toBe(2);
    // The learner-facing draft carries neither raw source nor fixture I/O.
    expect(JSON.stringify(built.draft)).not.toContain("#include");
  });

  it("surfaces stale_definition and evaluation_not_judge_backed distinctly (not unsupported)", async () => {
    getInterviewForOwner.mockResolvedValue({ publishedPayload: userPayload(), publishedVersionId: USER_VERSION });
    const stale = await buildJudgeSubmissionDraftFromSource({
      submissionId: "00000000-0000-4000-8000-000000000682",
      problemId: USER_ID,
      source: SOURCE,
      compiler: "gcc",
      standard: "c++20",
      contentVersionId: "99999999-9999-4999-8999-999999999999",
      context: { mode: "practice" }
    });
    expect(stale).toEqual({ status: "stale_definition" });

    getInterviewForOwner.mockResolvedValue({
      publishedPayload: userPayload({ evaluationMode: "self_evaluation" }),
      publishedVersionId: USER_VERSION
    });
    const notJudge = await buildJudgeSubmissionDraftFromSource({
      submissionId: "00000000-0000-4000-8000-000000000683",
      problemId: USER_ID,
      source: SOURCE,
      compiler: "gcc",
      standard: "c++20",
      contentVersionId: USER_VERSION,
      context: { mode: "practice" }
    });
    expect(notJudge).toEqual({ status: "evaluation_not_judge_backed" });
  });

  it("keeps the server action free of compiler/worker execution imports", () => {
    const source = readFileSync("src/features/interview/judge-actions.ts", "utf8");
    expect(source).not.toMatch(/worker-runner|local-worker|docker-executor|process-launcher/);
    expect(source).not.toMatch(/runJudgeRequest|runLocalDockerJudge|createDockerExecutor/);
  });
});
