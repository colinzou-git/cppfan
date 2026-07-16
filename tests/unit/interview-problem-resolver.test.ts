import { beforeEach, describe, expect, it, vi } from "vitest";
import { getInterviewForOwner } from "@/features/user-content/user-content-queries";
import { resolveInterviewProblem } from "@/features/interview/interview-problem-resolver";

vi.mock("@/features/user-content/user-content-queries", () => ({ getInterviewForOwner: vi.fn() }));
const mockedInterview = vi.mocked(getInterviewForOwner);

const NATIVE_ID = "iv.prefix.balance-returns-to-zero";
const USER_ID = "user.item.00000000-0000-0000-0000-000000000055";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resolveInterviewProblem (#490)", () => {
  it("returns a native problem unchanged, without a DB read", async () => {
    const problem = await resolveInterviewProblem(NATIVE_ID);
    expect(problem?.id).toBe(NATIVE_ID);
    expect(mockedInterview).not.toHaveBeenCalled();
  });

  it("builds an InterviewProblem from the owner's published user problem", async () => {
    mockedInterview.mockResolvedValue({
      id: "00000000-0000-0000-0000-000000000055",
      kind: "interview_problem",
      title: "Two Sum",
      lifecycleStatus: "published",
      recommendationEnabled: true,
      draftRevision: 1,
      updatedAt: "2026-01-01T00:00:00Z",
      publishedAt: "2026-01-01T00:00:00Z",
      nativeModuleId: null,
      publishedVersionId: "v1",
      draftPayload: null,
      publishedPayload: {
        schemaVersion: 1,
        title: "Two Sum",
        statement: "Return indices summing to target.",
        evaluationMode: "judge",
        difficulty: "hard",
        group: "arrays_hashing_prefix",
        patternTags: ["hashing"],
        hintLadder: ["Use a hash map."],
        referenceSolution: "SECRET"
      }
    } as Awaited<ReturnType<typeof getInterviewForOwner>>);

    const problem = await resolveInterviewProblem(USER_ID);
    expect(problem?.id).toBe(USER_ID);
    expect(problem?.prompt).toBe("Return indices summing to target.");
    expect(problem?.difficulty).toBe("hard");
    expect(problem?.group).toBe("arrays_hashing_prefix");
    expect(problem?.primarySkillId).toContain("user.skill.");
    // the native InterviewProblem shape carries no reference solution (reveal policy)
    expect(JSON.stringify(problem)).not.toContain("SECRET");
  });

  it("returns null for an unknown id and for an unpublished user problem", async () => {
    expect(await resolveInterviewProblem("not-a-real-id")).toBeNull();
    mockedInterview.mockResolvedValue(null);
    expect(await resolveInterviewProblem(USER_ID)).toBeNull();
  });
});
