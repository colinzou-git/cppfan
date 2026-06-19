import {
  DEFAULT_JUDGE_LIMITS,
  isSubmissionWithinLimits,
  type JudgeLimits,
  type JudgeSubmission
} from "./judge-contract";
import type { JudgeTaskKind, JudgeWorkerRequest, JudgeWorkerTest } from "../../../services/interview-judge/protocol";

export type JudgeEnqueueResult =
  | { status: "queued"; submissionId: string }
  | { status: "duplicate"; submissionId: string }
  | { status: "rejected"; reason: string }
  | { status: "unavailable"; reason: string };

export type JudgeQueueAdapter = {
  enqueue(request: JudgeWorkerRequest): Promise<JudgeEnqueueResult>;
};

export type JudgeClientInput = {
  submission: JudgeSubmission;
  taskKind: JudgeTaskKind;
  visibleTests: JudgeWorkerTest[];
  hiddenTests: JudgeWorkerTest[];
  limits?: JudgeLimits;
};

export function buildJudgeRequest(input: JudgeClientInput): JudgeWorkerRequest | { error: string } {
  const limits = input.limits ?? DEFAULT_JUDGE_LIMITS;
  const testCount = input.visibleTests.length + input.hiddenTests.length;
  if (!isSubmissionWithinLimits(input.submission, testCount, limits)) {
    return { error: "submission_limits_exceeded" };
  }

  return {
    submission: input.submission,
    taskKind: input.taskKind,
    tests: [...input.visibleTests, ...input.hiddenTests],
    limits
  };
}

/**
 * Web-app boundary for #178. The app may validate and enqueue a submission; it
 * does not import process-launch APIs, compiler tooling, container tooling, or any runner.
 */
export function createJudgeClient(adapter: JudgeQueueAdapter) {
  return {
    async enqueue(input: JudgeClientInput): Promise<JudgeEnqueueResult> {
      const request = buildJudgeRequest(input);
      if ("error" in request) {
        return { status: "rejected", reason: request.error };
      }
      return adapter.enqueue(request);
    }
  };
}
