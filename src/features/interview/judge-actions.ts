"use server";

import { randomUUID } from "node:crypto";
import { saveQueuedJudgeSubmission } from "./judge-submission-store";
import { buildJudgeSubmissionDraftFromSource } from "./judge-submission-builder";
import type { SubmitJudgeAttemptInput, SubmitJudgeAttemptResult } from "./judge-action-types";

/**
 * App-side enqueue boundary for the isolated judge (#178). This hashes the
 * submitted source, joins server-held visible/hidden test metadata, and persists
 * a queued submission record. It does not compile or execute learner code.
 */
export async function submitJudgeAttempt(input: SubmitJudgeAttemptInput): Promise<SubmitJudgeAttemptResult> {
  if (!input || typeof input.problemId !== "string" || typeof input.source !== "string") {
    return { status: "invalid", reason: "invalid_input" };
  }

  const built = buildJudgeSubmissionDraftFromSource({
    submissionId: randomUUID(),
    problemId: input.problemId,
    source: input.source,
    compiler: input.compiler ?? "gcc",
    standard: input.standard ?? "c++20",
    taskKind: input.taskKind,
    context: {
      mode: input.mode,
      interviewSessionId: input.interviewSessionId ?? null,
      sourceVersion: input.sourceVersion,
      assistanceUsed: input.assistanceUsed,
      priorSolutionExposed: input.priorSolutionExposed
    }
  });

  if (built.status !== "ok") {
    return built;
  }

  const saved = await saveQueuedJudgeSubmission(built.draft);
  if (saved.status === "ok") {
    return {
      status: "queued",
      submissionId: saved.submissionId,
      visibleTestCount: built.visibleTestCount,
      hiddenTestCount: built.hiddenTestCount
    };
  }
  return saved;
}
