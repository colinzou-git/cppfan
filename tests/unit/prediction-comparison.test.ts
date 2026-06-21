import { describe, expect, it } from "vitest";
import { comparePredictionsToRunResult } from "@/features/code-lab/prediction-comparison";
import type { CodeRunResult, CodeTestResult } from "@/features/code-lab/code-lab-types";
import type { CodePredictionPrompt } from "@/features/code-lab/prediction-types";

const stdoutPrompt: CodePredictionPrompt = { id: "stdout", kind: "stdout", label: "out" };
const failPrompt: CodePredictionPrompt = { id: "failing_test", kind: "failing_test", label: "fail" };
const invariantPrompt: CodePredictionPrompt = {
  id: "loop_invariant",
  kind: "loop_invariant",
  label: "invariant"
};

const run = (stdout: string): CodeRunResult => ({
  status: "success",
  compileOutput: "",
  stdout,
  stderr: "",
  exitCode: 0,
  timedOut: false,
  durationMs: 1,
  memoryKb: null,
  provider: "mock",
  simulated: true
});

const test = (visible: { name: string; passed: boolean }[]): CodeTestResult => ({
  status: "ok",
  passed: visible.filter((v) => v.passed).length,
  total: visible.length,
  visible: visible.map((v) => ({ ...v, hidden: false })),
  hiddenPassed: 0,
  hiddenTotal: 0,
  compileOutput: "",
  provider: "mock",
  simulated: true
});

describe("comparePredictionsToRunResult", () => {
  it("matches a trimmed stdout prediction", () => {
    const [cmp] = comparePredictionsToRunResult({
      prompts: [stdoutPrompt],
      submissions: [{ promptId: "stdout", value: " 15 ", createdAt: "" }],
      runResult: run("15\n")
    });
    expect(cmp.status).toBe("matched");
  });

  it("reports a stdout mismatch with expected/actual", () => {
    const [cmp] = comparePredictionsToRunResult({
      prompts: [stdoutPrompt],
      submissions: [{ promptId: "stdout", value: "15", createdAt: "" }],
      runResult: run("10\n")
    });
    expect(cmp.status).toBe("mismatched");
    expect(cmp.explanation).toContain("10");
  });

  it("matches a failing-test prediction against the first failed visible test", () => {
    const [cmp] = comparePredictionsToRunResult({
      prompts: [failPrompt],
      submissions: [{ promptId: "failing_test", value: "Greets cppFan", createdAt: "" }],
      testResult: test([{ name: "Greets cppFan", passed: false }])
    });
    expect(cmp.status).toBe("matched");
  });

  it("matches a 'none' prediction when all visible tests pass", () => {
    const [cmp] = comparePredictionsToRunResult({
      prompts: [failPrompt],
      submissions: [{ promptId: "failing_test", value: "none", createdAt: "" }],
      testResult: test([{ name: "ok", passed: true }])
    });
    expect(cmp.status).toBe("matched");
  });

  it("returns not_comparable reflective feedback for invariant prompts", () => {
    const [cmp] = comparePredictionsToRunResult({
      prompts: [invariantPrompt],
      submissions: [{ promptId: "loop_invariant", value: "sum >= 0", createdAt: "" }],
      runResult: run("")
    });
    expect(cmp.status).toBe("not_comparable");
  });

  it("skips prompts with no submission", () => {
    expect(
      comparePredictionsToRunResult({
        prompts: [stdoutPrompt],
        submissions: [],
        runResult: run("x")
      })
    ).toEqual([]);
  });
});
