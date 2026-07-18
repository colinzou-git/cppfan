// Server-side builder for judge submission drafts (#178/#608). It hashes source
// and joins the selected problem to its resolved judge definition (native OR the
// owner's published user problem) without storing raw source or exposing hidden
// fixtures through the web-app request boundary. The returned `execution` payload
// (raw source + worker tests + fixtures) is worker-only and must never be
// serialized into a learner-facing response or log.
import { createHash } from "node:crypto";
import { resolveInterviewJudgeDefinition } from "./interview-judge-definition";
import {
  validateJudgeSubmissionDraft,
  type JudgeSubmissionDraft,
  type JudgeSubmissionContext
} from "./judge-submission-store";
import type { CppStandard, JudgeCompiler } from "./judge-contract";
import type { JudgeTaskKind, JudgeWorkerTest } from "../../../services/interview-judge/protocol";
import type { JudgeFixture } from "../../../services/interview-judge/worker-runner";

export type BuildJudgeSubmissionDraftInput = {
  submissionId: string;
  problemId: string;
  source: string;
  compiler: JudgeCompiler;
  standard: CppStandard;
  taskKind?: JudgeTaskKind;
  /** Immutable published version the learner is bound to; null for native. */
  contentVersionId?: string | null;
  context: JudgeSubmissionContext;
};

/** Worker-only execution payload — never serialized to learners/logs. */
export type JudgeSubmissionExecution = {
  source: string;
  workerTests: JudgeWorkerTest[];
  fixtures: JudgeFixture[];
};

export type BuildJudgeSubmissionDraftResult =
  | {
      status: "ok";
      draft: JudgeSubmissionDraft;
      visibleTestCount: number;
      hiddenTestCount: number;
      execution: JudgeSubmissionExecution;
    }
  | { status: "unsupported_problem" }
  | { status: "evaluation_not_judge_backed" }
  | { status: "stale_definition" }
  | { status: "invalid"; reason: string };

function sourceHash(source: string): string {
  return createHash("sha256").update(source, "utf8").digest("hex");
}

export async function buildJudgeSubmissionDraftFromSource(
  input: BuildJudgeSubmissionDraftInput
): Promise<BuildJudgeSubmissionDraftResult> {
  const resolved = await resolveInterviewJudgeDefinition({
    problemId: input.problemId,
    expectedContentVersionId: input.contentVersionId ?? null
  });

  if (resolved.status === "not_found") {
    return { status: "unsupported_problem" };
  }
  if (resolved.status === "evaluation_not_judge_backed") {
    return { status: "evaluation_not_judge_backed" };
  }
  if (resolved.status === "stale_definition") {
    return { status: "stale_definition" };
  }
  if (resolved.status === "invalid_suite") {
    return { status: "invalid", reason: resolved.reason };
  }

  const definition = resolved.definition;
  const visibleTestCount = definition.visibleTests.length;
  const hiddenTestCount = definition.hiddenTests.length;

  const draft: JudgeSubmissionDraft = {
    submission: {
      submissionId: input.submissionId,
      problemId: definition.problemId,
      // Numeric native/author version — publication identity is content_version_id.
      problemVersion: definition.problemVersion,
      compiler: input.compiler,
      standard: input.standard,
      sourceHash: sourceHash(input.source),
      sourceBytes: Buffer.byteLength(input.source, "utf8")
    },
    taskKind: input.taskKind ?? "compile_and_run",
    visibleTestCount,
    hiddenTestCount,
    context: {
      ...input.context,
      definitionSource: definition.source,
      contentVersionId: definition.contentVersionId
    }
  };

  const validation = validateJudgeSubmissionDraft(draft);
  if (!validation.ok) {
    return { status: "invalid", reason: validation.reason };
  }

  return {
    status: "ok",
    draft,
    visibleTestCount,
    hiddenTestCount,
    execution: {
      source: input.source,
      workerTests: [...definition.visibleTests, ...definition.hiddenTests],
      fixtures: definition.fixtures
    }
  };
}
