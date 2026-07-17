import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LearningItemCodeLab } from "@/features/code-lab/code-lab-types";
import { exercisePayloadToCodeLabConfig } from "@/features/user-content/exercise-code-lab";
import type { ExercisePayload } from "@/features/user-content/exercise-content-types";

// Capture the exact source handed to the runner so we can prove function-mode
// Run/Test wrap the learner code in the generated harness (#607).
const captured: string[] = [];
vi.mock("@/features/code-lab/code-runner", async () => {
  const actual = await vi.importActual<typeof import("@/features/code-lab/code-runner")>(
    "@/features/code-lab/code-runner"
  );
  return {
    ...actual,
    executeRun: vi.fn(async (input: { source: string }) => {
      captured.push(input.source);
      return {
        status: "success",
        compileOutput: "",
        stdout: "5\n",
        stderr: "",
        exitCode: 0,
        timedOut: false,
        durationMs: 1,
        memoryKb: 1,
        provider: "mock",
        simulated: true
      };
    })
  };
});

vi.mock("@/features/code-lab/code-lab-catalog", () => ({ getCodeLabConfigForItem: vi.fn(() => null) }));
vi.mock("@/features/code-lab/code-lab-hidden-tests", () => ({ getHiddenTestsForItem: vi.fn(() => []) }));
vi.mock("@/features/code-lab/user-exercise-code-lab", () => ({
  resolveUserExerciseExecution: vi.fn(),
  exerciseHiddenTests: vi.fn(() => [])
}));
vi.mock("@/features/code-lab/user-lab-code-lab", () => ({ resolveUserLabExecution: vi.fn(async () => null) }));
vi.mock("@/features/code-lab/user-interview-code-lab", () => ({ resolveUserInterviewExecution: vi.fn(async () => null) }));

import { runCode, runTests } from "@/features/code-lab/code-lab-service";
import { resolveUserExerciseExecution } from "@/features/code-lab/user-exercise-code-lab";

const mockedExercise = vi.mocked(resolveUserExerciseExecution);
const USER_ITEM = "user.item.00000000-0000-0000-0000-00000000000f";

function functionConfig(signature: string): LearningItemCodeLab {
  return {
    enabled: true,
    language: "cpp",
    mode: "function",
    functionSignature: signature,
    starterCode: "",
    visibleTests: [{ name: "v", stdin: "2 3\n", expectedStdout: "5", matcher: "trimmed" }],
    skillTags: ["s"]
  };
}

beforeEach(() => {
  captured.length = 0;
  vi.clearAllMocks();
});

afterEach(() => {
  delete process.env.CODE_RUNNER_PROVIDER;
});

describe("function-mode config mapping (#607)", () => {
  const base: ExercisePayload = {
    schemaVersion: 1,
    title: "Add",
    prompt: "Add two numbers",
    mode: "function",
    evaluationMode: "automated_tests",
    functionSignature: "int add(int a, int b)",
    tests: [{ name: "v", input: "2 3", expectedOutput: "5", hidden: false }]
  };

  it("carries the signature, a function-stub starter, and a trimmed matcher", () => {
    const config = exercisePayloadToCodeLabConfig(base);
    expect(config.mode).toBe("function");
    expect(config.functionSignature).toBe("int add(int a, int b)");
    expect(config.starterCode).toContain("int add(int arg0, int arg1)");
    expect(config.starterCode).not.toContain("main");
    expect(config.visibleTests[0].matcher).toBe("trimmed");
  });
});

describe("Run and Test wrap function-mode source through the harness (#607)", () => {
  beforeEach(() => {
    mockedExercise.mockResolvedValue({
      config: functionConfig("int add(int a, int b)"),
      hiddenTests: [],
      publishedVersionId: "v1"
    });
  });

  it("runCode sends a wrapped translation unit with exactly one main(), not the raw function", async () => {
    await runCode({ itemId: USER_ITEM, source: "int add(int a, int b){ return a + b; }" });
    expect(captured).toHaveLength(1);
    expect(captured[0]).toContain("int add(int a, int b){ return a + b; }");
    expect(captured[0].match(/int main\(/g)?.length).toBe(1);
    // The raw source alone (no harness) must never be what runs.
    expect(captured[0]).not.toBe("int add(int a, int b){ return a + b; }");
  });

  it("runTests wraps once and reuses it for the visible test", async () => {
    const result = await runTests({ itemId: USER_ITEM, source: "int add(int a, int b){ return a + b; }" });
    expect(captured[0]).toContain("int main(");
    expect(result.visible[0].passed).toBe(true);
  });

  it("an invalid author signature is refused as an author-contract error, not executed", async () => {
    mockedExercise.mockResolvedValue({
      config: functionConfig("int add(std::map<int,int> m)"),
      hiddenTests: [],
      publishedVersionId: "v1"
    });
    const result = await runCode({ itemId: USER_ITEM, source: "int add(){ return 0; }" });
    expect(result.status).toBe("runner_error");
    expect(result.note).toMatch(/invalid author signature/i);
    expect(captured).toHaveLength(0); // never reached the runner
  });
});
