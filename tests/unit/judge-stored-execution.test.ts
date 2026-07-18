import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  buildStoredJudgeExecution,
  runStoredJudgeExecution,
  type StoredJudgeExecutionRecord
} from "../../services/interview-judge/stored-execution";
import { DEFAULT_JUDGE_LIMITS } from "@/features/interview/judge-contract";
import type { JudgeWorkerTest } from "../../services/interview-judge/protocol";
import type {
  JudgeFixture,
  WorkerProcessCommand,
  WorkerProcessExecutor,
  WorkerProcessResult
} from "../../services/interview-judge/worker-runner";

const SOURCE = "#include <iostream>\nint main(){ int a,b; std::cin>>a>>b; std::cout<<a+b<<'\\n'; }\n";

const visible: JudgeWorkerTest = { id: "case-1", name: "v", hidden: false, category: "visible", fixtureHash: "a".repeat(64) };
const hidden: JudgeWorkerTest = { id: "case-2", name: "h", hidden: true, category: "hidden", fixtureHash: "b".repeat(64) };

const fixtures: JudgeFixture[] = [
  { testId: "case-1", stdin: "1 2\n", expectedStdout: "3\n" },
  { testId: "case-2", stdin: "4 5\n", expectedStdout: "9\n" }
];

function record(over: Partial<StoredJudgeExecutionRecord> = {}): StoredJudgeExecutionRecord {
  return {
    submissionId: "00000000-0000-4000-8000-000000000608",
    problemId: "user.item.sum",
    problemVersion: 1,
    compiler: "gcc",
    standard: "c++20",
    taskKind: "compile_and_run",
    sourceText: SOURCE,
    workerTests: [visible, hidden],
    fixtures,
    ...over
  };
}

/** Fake executor: compiles OK, then echoes each fixture's expected output (a pass),
 *  unless `failTestId` is given, in which case that run returns wrong output. */
function fakeExecutor(opts: { failTestId?: string; compileExit?: number } = {}): WorkerProcessExecutor {
  return vi.fn(async (command: WorkerProcessCommand): Promise<WorkerProcessResult> => {
    if (command.kind === "compile") {
      return { exitCode: opts.compileExit ?? 0, stdout: "", stderr: "" };
    }
    const fixture = fixtures.find((f) => f.stdin === command.stdin);
    const wrong = fixture && opts.failTestId && fixture.testId === opts.failTestId;
    return { exitCode: 0, stdout: wrong ? "999\n" : (fixture?.expectedStdout ?? ""), stderr: "" };
  });
}

describe("buildStoredJudgeExecution (#608 worker adapter)", () => {
  it("maps the stored payload into a worker request + paired fixtures", () => {
    const built = buildStoredJudgeExecution(record());
    expect(built.request.submission).toMatchObject({
      submissionId: "00000000-0000-4000-8000-000000000608",
      problemId: "user.item.sum",
      problemVersion: 1,
      compiler: "gcc",
      standard: "c++20",
      sourceBytes: Buffer.byteLength(SOURCE, "utf8")
    });
    // Source hash is recomputed from the stored source so the request is self-consistent.
    expect(built.request.submission.sourceHash).toBe(createHash("sha256").update(SOURCE).digest("hex"));
    expect(built.request.tests).toEqual([visible, hidden]);
    expect(built.request.limits).toBe(DEFAULT_JUDGE_LIMITS);
    expect(built.source).toBe(SOURCE);
    expect(built.fixtures).toBe(record().fixtures);
  });
});

describe("runStoredJudgeExecution (#608 worker adapter, injected executor)", () => {
  it("accepts when every visible and hidden test passes", async () => {
    const executor = fakeExecutor();
    const result = await runStoredJudgeExecution({ record: record(), executor });
    expect(result.status).toBe("accepted");
    expect(result.compiled).toBe(true);
    expect(result.visible).toEqual({ passed: 1, total: 1 });
    expect(result.hidden).toEqual({ passed: 1, total: 1 });
    // Compile + one run per test — the fixtures reached the worker as stdin.
    expect(executor).toHaveBeenCalledTimes(3);
  });

  it("reports wrong_answer when a hidden test fails (hidden inputs still drive the run)", async () => {
    const result = await runStoredJudgeExecution({ record: record(), executor: fakeExecutor({ failTestId: "case-2" }) });
    expect(result.status).toBe("wrong_answer");
    expect(result.visible).toEqual({ passed: 1, total: 1 });
    expect(result.hidden.passed).toBe(0);
  });

  it("reports compile_error without running any test when compilation fails", async () => {
    const executor = fakeExecutor({ compileExit: 1 });
    const result = await runStoredJudgeExecution({ record: record(), executor });
    expect(result.status).toBe("compile_error");
    expect(result.compiled).toBe(false);
    expect(executor).toHaveBeenCalledTimes(1); // compile only
  });

  it("fails safe (infrastructure_error) when a test has no matching fixture", async () => {
    const broken = record({ fixtures: [fixtures[0]] }); // missing case-2 fixture
    const result = await runStoredJudgeExecution({ record: broken, executor: fakeExecutor() });
    expect(result.status).toBe("infrastructure_error");
  });
});

describe("stored-execution adapter stays out of the Next.js app process (#608)", () => {
  it("is not imported by any app-side judge module", () => {
    // The adapter lives under services/; the app must never import it (that would
    // drag worker execution into the Next.js process).
    const appModules = [
      "src/features/interview/judge-actions.ts",
      "src/features/interview/judge-submission-builder.ts",
      "src/features/interview/judge-submission-store.ts",
      "src/features/interview/interview-judge-definition.ts"
    ];
    for (const path of appModules) {
      const source = readFileSync(path, "utf8");
      expect(source).not.toMatch(/stored-execution/);
      expect(source).not.toMatch(/runStoredJudgeExecution|buildStoredJudgeExecution/);
    }
  });
});
