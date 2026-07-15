import { describe, expect, it, vi } from "vitest";

const { executeRun } = vi.hoisted(() => ({ executeRun: vi.fn() }));
vi.mock("@/features/code-lab/code-runner", () => ({
  executeRun,
  buildRunnerInput: (x: unknown) => x
}));

import { allLabTests, validateLabPublication } from "@/features/user-content/lab-publish-validation";
import { CURRENT_LAB_SCHEMA_VERSION, type LabPayload } from "@/features/user-content/lab-content-types";

function lab(overrides: Partial<LabPayload> = {}): LabPayload {
  return {
    schemaVersion: CURRENT_LAB_SCHEMA_VERSION,
    title: "CSV",
    summary: "Summarize a CSV.",
    taskDescription: "Read a CSV.",
    mode: "single_task",
    evaluationMode: "automated_tests",
    ...overrides
  };
}

const twoTests = [
  { name: "t1", input: "ab\n", expectedOutput: "ba\n", hidden: false },
  { name: "t2", input: "xy\n", expectedOutput: "yx\n", hidden: true }
];

describe("allLabTests (#489)", () => {
  it("gathers single-task completion tests", () => {
    expect(allLabTests(lab({ completion: { tests: twoTests } }))).toHaveLength(2);
  });
  it("gathers tests across every milestone", () => {
    const payload = lab({
      mode: "milestones",
      milestones: [
        { id: "m1", title: "A", instructions: "a", required: true, tests: [twoTests[0]] },
        { id: "m2", title: "B", instructions: "b", required: true, tests: [twoTests[1]] }
      ]
    });
    expect(allLabTests(payload).map((t) => t.name)).toEqual(["t1", "t2"]);
  });
});

describe("validateLabPublication (#489)", () => {
  it("skips when there is no reference solution", async () => {
    executeRun.mockReset();
    const result = await validateLabPublication(lab({ completion: { tests: twoTests } }));
    expect(result.status).toBe("skipped");
    expect(executeRun).not.toHaveBeenCalled();
  });

  it("skips when the runner is unconfigured", async () => {
    executeRun.mockReset().mockResolvedValue({ status: "runner_unconfigured", compileOutput: "", stdout: "" });
    const result = await validateLabPublication(lab({ referenceSolution: "int main(){}", completion: { tests: twoTests } }));
    expect(result.status).toBe("skipped");
  });

  it("reports a compile error", async () => {
    executeRun.mockReset().mockResolvedValue({ status: "compile_error", compileOutput: "error", stdout: "" });
    const result = await validateLabPublication(lab({ referenceSolution: "bad", completion: { tests: twoTests } }));
    expect(result.status).toBe("compile_error");
  });

  it("fails when the reference solution fails a test", async () => {
    executeRun
      .mockReset()
      .mockResolvedValueOnce({ status: "success", stdout: "ba\n", compileOutput: "" })
      .mockResolvedValueOnce({ status: "success", stdout: "WRONG\n", compileOutput: "" });
    const result = await validateLabPublication(lab({ referenceSolution: "ok", completion: { tests: twoTests } }));
    expect(result.status).toBe("failed");
    if (result.status === "failed") {
      expect(result.failures).toEqual(["t2"]);
    }
  });

  it("passes when the reference solution passes every milestone test", async () => {
    executeRun
      .mockReset()
      .mockResolvedValueOnce({ status: "success", stdout: "ba\n", compileOutput: "" })
      .mockResolvedValueOnce({ status: "success", stdout: "yx\n", compileOutput: "" });
    const payload = lab({
      referenceSolution: "ok",
      mode: "milestones",
      milestones: [
        { id: "m1", title: "A", instructions: "a", required: true, tests: [twoTests[0]] },
        { id: "m2", title: "B", instructions: "b", required: true, tests: [twoTests[1]] }
      ]
    });
    const result = await validateLabPublication(payload);
    expect(result.status).toBe("ok");
  });
});
