import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveInterviewJudgeDefinition } from "@/features/interview/interview-judge-definition";
import { getJudgeProblemSuite } from "@/features/interview/judge-test-suites";
import { fixtureHashFor } from "@/features/interview/judge-fixture";
import type { InterviewProblemPayload, ExerciseTest } from "@/features/user-content/interview-content-types";

// The resolver reads the authenticated owner's published user problem through
// this query; native catalog resolution uses the real in-memory catalog.
const getInterviewForOwner = vi.fn();
vi.mock("@/features/user-content/user-content-queries", () => ({
  getInterviewForOwner: (contentId: string) => getInterviewForOwner(contentId)
}));

const NATIVE_ID = "iv.prefix.balance-returns-to-zero";
const USER_ID = "user.item.abc-123";
const PUBLISHED_VERSION = "11111111-1111-4111-8111-111111111111";

function test(over: Partial<ExerciseTest> = {}): ExerciseTest {
  return { name: "case", input: "1 2\n", expectedOutput: "3\n", hidden: false, ...over };
}

function payload(over: Partial<InterviewProblemPayload> = {}): InterviewProblemPayload {
  return {
    schemaVersion: 1,
    title: "Sum",
    statement: "Add two numbers",
    evaluationMode: "judge",
    constraints: "read two ints, print sum",
    tests: [test({ name: "visible", hidden: false }), test({ name: "hidden", hidden: true, expectedOutput: "9\n" })],
    ...over
  };
}

beforeEach(() => {
  getInterviewForOwner.mockReset();
});

describe("resolveInterviewJudgeDefinition — native (#608)", () => {
  it("resolves a native catalog problem to its server-held suite", async () => {
    const result = await resolveInterviewJudgeDefinition({ problemId: NATIVE_ID });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    const suite = getJudgeProblemSuite(NATIVE_ID)!;
    expect(result.definition.source).toBe("native");
    expect(result.definition.contentVersionId).toBeNull();
    expect(result.definition.visibleTests.length).toBe(suite.visibleTests.length);
    expect(result.definition.hiddenTests.length).toBe(suite.hiddenTests.length);
    expect(result.definition.fixtures.length).toBe(suite.fixtures.length);
    // getInterviewForOwner is never consulted for native problems.
    expect(getInterviewForOwner).not.toHaveBeenCalled();
  });

  it("reports not_found for an unknown native id", async () => {
    expect(await resolveInterviewJudgeDefinition({ problemId: "iv.nope.missing" })).toEqual({ status: "not_found" });
  });

  it("reports not_found for an empty id", async () => {
    expect(await resolveInterviewJudgeDefinition({ problemId: "" })).toEqual({ status: "not_found" });
  });
});

describe("resolveInterviewJudgeDefinition — user problems (#608)", () => {
  it("converts an author's judge-backed tests into worker tests + matching fixtures", async () => {
    getInterviewForOwner.mockResolvedValue({ publishedPayload: payload(), publishedVersionId: PUBLISHED_VERSION });
    const result = await resolveInterviewJudgeDefinition({ problemId: USER_ID });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.definition.source).toBe("user");
    expect(result.definition.contentVersionId).toBe(PUBLISHED_VERSION);
    expect(result.definition.visibleTests.map((t) => t.id)).toEqual(["case-1"]);
    expect(result.definition.hiddenTests.map((t) => t.id)).toEqual(["case-2"]);
    // The worker test carries only the hash — never the raw stdin/expected output.
    const visible = result.definition.visibleTests[0];
    expect(visible.fixtureHash).toBe(fixtureHashFor("1 2\n", "3\n"));
    expect(JSON.stringify(result.definition.visibleTests)).not.toContain("1 2");
    // Fixtures (worker-only) carry the raw I/O and pair by testId.
    const fixture = result.definition.fixtures.find((f) => f.testId === "case-1")!;
    expect(fixture).toMatchObject({ stdin: "1 2\n", expectedStdout: "3\n" });
  });

  it("reports evaluation_not_judge_backed for ai/self evaluation modes", async () => {
    for (const evaluationMode of ["ai_evaluation", "self_evaluation"] as const) {
      getInterviewForOwner.mockResolvedValue({
        publishedPayload: payload({ evaluationMode }),
        publishedVersionId: PUBLISHED_VERSION
      });
      expect(await resolveInterviewJudgeDefinition({ problemId: USER_ID })).toEqual({
        status: "evaluation_not_judge_backed"
      });
    }
  });

  it("reports stale_definition when the pinned version no longer matches", async () => {
    getInterviewForOwner.mockResolvedValue({ publishedPayload: payload(), publishedVersionId: PUBLISHED_VERSION });
    expect(
      await resolveInterviewJudgeDefinition({ problemId: USER_ID, expectedContentVersionId: "22222222-2222-4222-8222-222222222222" })
    ).toEqual({ status: "stale_definition", publishedVersionId: PUBLISHED_VERSION });
  });

  it("accepts a matching pinned version", async () => {
    getInterviewForOwner.mockResolvedValue({ publishedPayload: payload(), publishedVersionId: PUBLISHED_VERSION });
    const result = await resolveInterviewJudgeDefinition({ problemId: USER_ID, expectedContentVersionId: PUBLISHED_VERSION });
    expect(result.status).toBe("ok");
  });

  it("rejects an empty test suite as invalid_suite", async () => {
    getInterviewForOwner.mockResolvedValue({ publishedPayload: payload({ tests: [] }), publishedVersionId: PUBLISHED_VERSION });
    expect(await resolveInterviewJudgeDefinition({ problemId: USER_ID })).toEqual({
      status: "invalid_suite",
      reason: "no_tests"
    });
  });

  it("rejects an over-limit test suite as invalid_suite", async () => {
    const tooMany = Array.from({ length: 51 }, (_, i) => test({ name: `t${i}` }));
    getInterviewForOwner.mockResolvedValue({ publishedPayload: payload({ tests: tooMany }), publishedVersionId: PUBLISHED_VERSION });
    expect(await resolveInterviewJudgeDefinition({ problemId: USER_ID })).toEqual({
      status: "invalid_suite",
      reason: "too_many_tests"
    });
  });

  it("rejects a malformed test as invalid_suite", async () => {
    const bad = [{ name: "x", input: 42, expectedOutput: "y", hidden: false } as unknown as ExerciseTest];
    getInterviewForOwner.mockResolvedValue({ publishedPayload: payload({ tests: bad }), publishedVersionId: PUBLISHED_VERSION });
    expect(await resolveInterviewJudgeDefinition({ problemId: USER_ID })).toEqual({
      status: "invalid_suite",
      reason: "malformed_test"
    });
  });

  it("reports not_found when the owner has no published problem", async () => {
    getInterviewForOwner.mockResolvedValue({ publishedPayload: null, publishedVersionId: null });
    expect(await resolveInterviewJudgeDefinition({ problemId: USER_ID })).toEqual({ status: "not_found" });
  });

  it("reports not_found for a user id with no content segment", async () => {
    expect(await resolveInterviewJudgeDefinition({ problemId: "user.item." })).toEqual({ status: "not_found" });
    expect(getInterviewForOwner).not.toHaveBeenCalled();
  });
});
