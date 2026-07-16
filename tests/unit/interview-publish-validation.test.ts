import { describe, expect, it, vi } from "vitest";

const { executeRun } = vi.hoisted(() => ({ executeRun: vi.fn() }));
vi.mock("@/features/code-lab/code-runner", () => ({
  executeRun,
  buildRunnerInput: (x: unknown) => x
}));

import { validateInterviewPublication } from "@/features/user-content/interview-publish-validation";
import { CURRENT_INTERVIEW_SCHEMA_VERSION, type InterviewProblemPayload } from "@/features/user-content/interview-content-types";

function problem(overrides: Partial<InterviewProblemPayload> = {}): InterviewProblemPayload {
  return {
    schemaVersion: CURRENT_INTERVIEW_SCHEMA_VERSION,
    title: "Two Sum",
    statement: "Return indices summing to target.",
    evaluationMode: "judge",
    ...overrides
  };
}

const twoTests = [
  { name: "t1", input: "1\n", expectedOutput: "0\n", hidden: false },
  { name: "t2", input: "2\n", expectedOutput: "1\n", hidden: true }
];

describe("validateInterviewPublication (#490)", () => {
  it("skips when there is no reference solution", async () => {
    executeRun.mockReset();
    const result = await validateInterviewPublication(problem({ tests: twoTests }));
    expect(result.status).toBe("skipped");
    expect(executeRun).not.toHaveBeenCalled();
  });

  it("reports a compile error", async () => {
    executeRun.mockReset().mockResolvedValue({ status: "compile_error", compileOutput: "err", stdout: "" });
    const result = await validateInterviewPublication(problem({ referenceSolution: "bad", tests: twoTests }));
    expect(result.status).toBe("compile_error");
  });

  it("fails when the reference solution fails a test", async () => {
    executeRun
      .mockReset()
      .mockResolvedValueOnce({ status: "success", stdout: "0\n", compileOutput: "" })
      .mockResolvedValueOnce({ status: "success", stdout: "WRONG\n", compileOutput: "" });
    const result = await validateInterviewPublication(problem({ referenceSolution: "ok", tests: twoTests }));
    expect(result.status).toBe("failed");
    if (result.status === "failed") {
      expect(result.failures).toEqual(["t2"]);
    }
  });

  it("passes when the reference solution passes every test", async () => {
    executeRun
      .mockReset()
      .mockResolvedValueOnce({ status: "success", stdout: "0\n", compileOutput: "" })
      .mockResolvedValueOnce({ status: "success", stdout: "1\n", compileOutput: "" });
    const result = await validateInterviewPublication(problem({ referenceSolution: "ok", tests: twoTests }));
    expect(result.status).toBe("ok");
  });
});
