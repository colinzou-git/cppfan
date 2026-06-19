import { describe, expect, it } from "vitest";
import {
  judgeResultToPatch,
  judgeSubmissionToRow,
  validateJudgeSubmissionDraft,
  type JudgeSubmissionDraft
} from "@/features/interview/judge-submission-store";
import type { JudgeResult, JudgeSubmission } from "@/features/interview/judge-contract";

const submission: JudgeSubmission = {
  submissionId: "00000000-0000-4000-8000-000000000478",
  problemId: "iv.graph.service-init-order",
  problemVersion: 2,
  compiler: "gcc",
  standard: "c++20",
  sourceHash: "b".repeat(64),
  sourceBytes: 1280
};

function draft(overrides: Partial<JudgeSubmissionDraft> = {}): JudgeSubmissionDraft {
  return {
    submission,
    taskKind: "compile_and_run",
    visibleTestCount: 2,
    hiddenTestCount: 7,
    context: {
      mode: "interview",
      interviewSessionId: "11111111-1111-4111-8111-111111111111",
      sourceVersion: 3,
      assistanceUsed: true,
      priorSolutionExposed: false
    },
    ...overrides
  };
}

describe("judge submission persistence mappers (#178)", () => {
  it("maps a draft to a queued durable row without raw source or fixtures", () => {
    const row = judgeSubmissionToRow(draft());

    expect(row).toMatchObject({
      submission_id: submission.submissionId,
      problem_id: submission.problemId,
      problem_version: 2,
      mode: "interview",
      task_kind: "compile_and_run",
      compiler: "gcc",
      standard: "c++20",
      source_hash: submission.sourceHash,
      source_bytes: 1280,
      source_version: 3,
      assistance_used: true,
      prior_solution_exposed: false,
      status: "queued",
      compiled: false,
      visible_total: 2,
      hidden_total: 7
    });
    expect(JSON.stringify(row)).not.toContain("int main");
    expect(JSON.stringify(row)).not.toContain("expectedStdout");
    expect(JSON.stringify(row)).not.toContain("stdin");
  });

  it("validates idempotency id, source hash, size, and test count", () => {
    expect(validateJudgeSubmissionDraft(draft())).toEqual({ ok: true });
    expect(
      validateJudgeSubmissionDraft(draft({ submission: { ...submission, submissionId: "not-a-uuid" } }))
    ).toEqual({ ok: false, reason: "invalid_submission_id" });
    expect(validateJudgeSubmissionDraft(draft({ submission: { ...submission, sourceHash: "short" } }))).toEqual({
      ok: false,
      reason: "invalid_source_hash"
    });
    expect(validateJudgeSubmissionDraft(draft({ submission: { ...submission, sourceBytes: 0 } }))).toEqual({
      ok: false,
      reason: "submission_limits_exceeded"
    });
    expect(validateJudgeSubmissionDraft(draft({ hiddenTestCount: 201 }))).toEqual({
      ok: false,
      reason: "submission_limits_exceeded"
    });
  });

  it("maps judge results to bounded result patches", () => {
    const result: JudgeResult = {
      submissionId: submission.submissionId,
      status: "wrong_answer",
      compiled: true,
      visible: { passed: 1, total: 2 },
      hidden: { passed: 4, total: 7 },
      runtimeMs: 123.9,
      memoryMb: 24.2
    };

    expect(judgeResultToPatch(result)).toEqual({
      status: "wrong_answer",
      compiled: true,
      visible_passed: 1,
      visible_total: 2,
      hidden_passed: 4,
      hidden_total: 7,
      runtime_ms: 123,
      memory_mb: 24
    });
  });
});
