import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolve: vi.fn(),
  record: vi.fn()
}));

vi.mock("@/features/interview/interview-problem-resolver", () => ({
  resolveInterviewProblemRef: mocks.resolve
}));

vi.mock("@/features/interview/interview-evidence-store", () => ({
  recordInterviewEvidence: mocks.record
}));

import { logInterviewEvidence } from "@/features/interview/interview-evidence-actions";

const CONTENT_VERSION_ID = "22222222-2222-4222-8222-222222222222";

function report(overrides: Record<string, unknown> = {}) {
  return {
    problemId: "user.item.abc",
    expectedContentVersionId: CONTENT_VERSION_ID,
    unseen: true,
    mode: "interview",
    correct: true,
    hintsUsed: 0,
    context: "mock",
    followUpResult: "passed",
    timeToApproachSeconds: 60,
    timeToImplementationSeconds: 300,
    ...overrides
  };
}

describe("logInterviewEvidence immutable definition attribution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.record.mockResolvedValue("ok");
  });

  it("derives user group and immutable version from the resolver", async () => {
    mocks.resolve.mockResolvedValue({
      problem: {
        id: "user.item.abc",
        version: 1,
        title: "Custom",
        prompt: "p",
        group: "binary_search"
      },
      contentVersionId: CONTENT_VERSION_ID
    });

    await expect(logInterviewEvidence(report())).resolves.toEqual({ status: "ok" });
    expect(mocks.record).toHaveBeenCalledWith(
      expect.objectContaining({
        problemId: "user.item.abc",
        pattern: "binary_search",
        problemVersion: 1,
        contentVersionId: CONTENT_VERSION_ID
      })
    );
  });

  it("stores null immutable version for native evidence", async () => {
    mocks.resolve.mockResolvedValue({
      problem: {
        id: "iv.bs.x",
        version: 3,
        title: "Native",
        prompt: "p",
        group: "binary_search"
      },
      contentVersionId: null
    });

    await expect(
      logInterviewEvidence(report({ problemId: "iv.bs.x", expectedContentVersionId: null }))
    ).resolves.toEqual({ status: "ok" });

    expect(mocks.record).toHaveBeenCalledWith(
      expect.objectContaining({
        problemId: "iv.bs.x",
        problemVersion: 3,
        contentVersionId: null
      })
    );
  });

  it("rejects a republish race without writing evidence", async () => {
    mocks.resolve.mockResolvedValue({
      problem: {
        id: "user.item.abc",
        version: 1,
        title: "Republished",
        prompt: "p",
        group: "binary_search"
      },
      contentVersionId: "33333333-3333-4333-8333-333333333333"
    });

    await expect(logInterviewEvidence(report())).resolves.toEqual({ status: "stale" });
    expect(mocks.record).not.toHaveBeenCalled();
  });

  it("returns unavailable when the problem no longer resolves", async () => {
    mocks.resolve.mockResolvedValue(null);
    await expect(logInterviewEvidence(report())).resolves.toEqual({ status: "unavailable" });
    expect(mocks.record).not.toHaveBeenCalled();
  });
});
