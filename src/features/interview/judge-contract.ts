// Typed contract for the isolated C++ interview judge (#178, design in
// docs/adr/0006). Pure types + helpers shared by the web app (which only
// enqueues submissions and reads results — it never compiles/runs learner code)
// and the future sandbox worker. Hidden test inputs/expected outputs never appear
// here; the learner-facing result exposes only pass/fail categories and counts.

export type JudgeCompiler = "gcc" | "clang";
export type CppStandard = "c++17" | "c++20";

export type JudgeStatus =
  | "accepted"
  | "wrong_answer"
  | "compile_error"
  | "runtime_error"
  | "timeout"
  | "memory_limit"
  | "infrastructure_error";

export type JudgeLimits = {
  cpuMs: number;
  wallMs: number;
  memoryMb: number;
  maxProcesses: number;
  outputKb: number;
  maxSourceBytes: number;
  maxTests: number;
};

export const DEFAULT_JUDGE_LIMITS: JudgeLimits = {
  cpuMs: 2000,
  wallMs: 5000,
  memoryMb: 256,
  maxProcesses: 32,
  outputKb: 256,
  maxSourceBytes: 64 * 1024,
  maxTests: 200
};

export type JudgeSubmission = {
  /** Idempotency key: re-submitting the same id must not double-judge. */
  submissionId: string;
  problemId: string;
  problemVersion: number;
  compiler: JudgeCompiler;
  standard: CppStandard;
  /** Hash of the source (the worker stores the hash, not necessarily the source). */
  sourceHash: string;
  sourceBytes: number;
};

/**
 * One test's outcome as it leaves the judge. `hidden` marks server-held tests;
 * note there is NO input/expected field — those never cross this boundary.
 */
export type TestOutcome = { name: string; hidden: boolean; passed: boolean };

export type TestSummary = { passed: number; total: number };

export type JudgeResult = {
  submissionId: string;
  status: JudgeStatus;
  compiled: boolean;
  visible: TestSummary;
  hidden: TestSummary;
  /** Diagnostic only — not a ranking. */
  runtimeMs: number | null;
  memoryMb: number | null;
};

/** Whether a submission is within the size/test-count bounds before judging. */
export function isSubmissionWithinLimits(
  submission: Pick<JudgeSubmission, "sourceBytes">,
  testCount: number,
  limits: JudgeLimits = DEFAULT_JUDGE_LIMITS
): boolean {
  return (
    submission.sourceBytes > 0 &&
    submission.sourceBytes <= limits.maxSourceBytes &&
    testCount >= 0 &&
    testCount <= limits.maxTests
  );
}

/** Visible/hidden pass counts from outcomes — counts only, never inputs. */
export function summarizeOutcomes(outcomes: TestOutcome[]): { visible: TestSummary; hidden: TestSummary } {
  const visible: TestSummary = { passed: 0, total: 0 };
  const hidden: TestSummary = { passed: 0, total: 0 };
  for (const o of outcomes) {
    const bucket = o.hidden ? hidden : visible;
    bucket.total += 1;
    if (o.passed) {
      bucket.passed += 1;
    }
  }
  return { visible, hidden };
}

/**
 * Derive the overall status when execution itself succeeded (no
 * timeout/memory/runtime/compile failure — those come straight from the worker).
 * `accepted` only when there is at least one test and all pass.
 */
export function deriveExecutionStatus(compiled: boolean, outcomes: TestOutcome[]): JudgeStatus {
  if (!compiled) {
    return "compile_error";
  }
  if (outcomes.length === 0) {
    return "infrastructure_error";
  }
  return outcomes.every((o) => o.passed) ? "accepted" : "wrong_answer";
}

/**
 * Learner-facing view: which test categories failed, never the hidden
 * inputs/expected outputs. Returns failed visible test names but only the COUNT
 * of failed hidden tests (names of hidden tests may hint at the case, so they are
 * withheld until the catalog policy permits disclosure).
 */
export function learnerFacingResult(result: JudgeResult, outcomes: TestOutcome[]): {
  status: JudgeStatus;
  failedVisibleTests: string[];
  failedHiddenCount: number;
} {
  return {
    status: result.status,
    failedVisibleTests: outcomes.filter((o) => !o.hidden && !o.passed).map((o) => o.name),
    failedHiddenCount: outcomes.filter((o) => o.hidden && !o.passed).length
  };
}

/**
 * Truncate judge logs to the output cap so they cannot exfiltrate large hidden
 * inputs or flood storage. Returns the (possibly truncated) log with a marker.
 */
export function sanitizeJudgeLog(log: string, limits: JudgeLimits = DEFAULT_JUDGE_LIMITS): string {
  const max = limits.outputKb * 1024;
  if (log.length <= max) {
    return log;
  }
  return `${log.slice(0, max)}\n…[truncated ${log.length - max} bytes]`;
}
