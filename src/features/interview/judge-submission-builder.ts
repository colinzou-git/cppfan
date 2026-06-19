// Server-side builder for judge submission drafts (#178). It hashes source and
// joins the selected problem to its server-held judge suite without storing raw
// source or exposing hidden fixtures through the web-app request boundary.
import { createHash } from "node:crypto";
import { getInterviewProblem } from "./problem-catalog";
import { getJudgeProblemSuite } from "./judge-test-suites";
import {
  validateJudgeSubmissionDraft,
  type JudgeSubmissionDraft,
  type JudgeSubmissionContext
} from "./judge-submission-store";
import type { CppStandard, JudgeCompiler } from "./judge-contract";
import type { JudgeTaskKind } from "../../../services/interview-judge/protocol";

export type BuildJudgeSubmissionDraftInput = {
  submissionId: string;
  problemId: string;
  source: string;
  compiler: JudgeCompiler;
  standard: CppStandard;
  taskKind?: JudgeTaskKind;
  context: JudgeSubmissionContext;
};

export type BuildJudgeSubmissionDraftResult =
  | {
      status: "ok";
      draft: JudgeSubmissionDraft;
      visibleTestCount: number;
      hiddenTestCount: number;
    }
  | { status: "unsupported_problem" }
  | { status: "invalid"; reason: string };

function sourceHash(source: string): string {
  return createHash("sha256").update(source, "utf8").digest("hex");
}

export function buildJudgeSubmissionDraftFromSource(
  input: BuildJudgeSubmissionDraftInput
): BuildJudgeSubmissionDraftResult {
  const problem = getInterviewProblem(input.problemId);
  const suite = getJudgeProblemSuite(input.problemId);
  if (!problem || !suite) {
    return { status: "unsupported_problem" };
  }

  const draft: JudgeSubmissionDraft = {
    submission: {
      submissionId: input.submissionId,
      problemId: problem.id,
      problemVersion: suite.version,
      compiler: input.compiler,
      standard: input.standard,
      sourceHash: sourceHash(input.source),
      sourceBytes: Buffer.byteLength(input.source, "utf8")
    },
    taskKind: input.taskKind ?? "compile_and_run",
    visibleTestCount: suite.visibleTests.length,
    hiddenTestCount: suite.hiddenTests.length,
    context: input.context
  };

  const validation = validateJudgeSubmissionDraft(draft);
  if (!validation.ok) {
    return { status: "invalid", reason: validation.reason };
  }

  return {
    status: "ok",
    draft,
    visibleTestCount: suite.visibleTests.length,
    hiddenTestCount: suite.hiddenTests.length
  };
}
