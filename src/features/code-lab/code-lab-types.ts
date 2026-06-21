/**
 * Shared types for the in-app C++ Code Lab (#407). These are imported by both
 * client UI and server route/service code, so this module must stay free of any
 * server-only or browser-only imports.
 */

export type CodeLabLanguage = "cpp";

export type CodeLabMode = "stdin" | "function" | "unit-test";

export type CodeTestMatcher = "exact" | "trimmed" | "contains";

/**
 * One visible test case. Visible cases may expose their stdin and expected
 * output to the learner; hidden cases never appear here (see hiddenTestCount).
 */
export type CodeTestCase = {
  name: string;
  stdin?: string;
  expectedStdout?: string;
  matcher?: CodeTestMatcher;
};

/**
 * Code Lab configuration attached to a learning item. Stored seed-side and
 * client-readable, so it must NOT contain hidden test inputs/outputs — those
 * live in a server-only module keyed by item id.
 */
export type LearningItemCodeLab = {
  enabled: boolean;
  language: CodeLabLanguage;
  mode: CodeLabMode;
  /** Coding-task prompt, distinct from the item's own teaching prompt. */
  prompt?: string;
  starterCode: string;
  stdin?: string;
  visibleTests: CodeTestCase[];
  /** Count only — hidden inputs/expected outputs never reach the client. */
  hiddenTestCount?: number;
  compilerFlags?: string[];
  skillTags?: string[];
  /** Phase 2 (#408) trace control; defaults to enabled when AI is configured. */
  traceEnabled?: boolean;
};

export type CodeRunRequest = {
  itemId: string;
  language: CodeLabLanguage;
  source: string;
  stdin?: string;
  compilerFlags?: string[];
};

export type CodeRunStatus =
  | "success"
  | "compile_error"
  | "runtime_error"
  | "timeout"
  | "runner_error"
  | "runner_unconfigured";

export type CodeRunResult = {
  status: CodeRunStatus;
  /** Compiler diagnostics (stderr from the compile stage), if any. */
  compileOutput: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  durationMs: number | null;
  memoryKb: number | null;
  /** Provider that produced the result, e.g. "mock" or "piston". */
  provider: string;
  /** True when the result came from the deterministic mock, not real execution. */
  simulated: boolean;
  /** Human-readable note, e.g. why a runner is unavailable. */
  note?: string;
};

export type CodeTestCaseResult = {
  name: string;
  passed: boolean;
  /** Only present for visible tests; hidden tests omit all I/O. */
  expectedStdout?: string;
  actualStdout?: string;
  matcher?: CodeTestMatcher;
  hidden: boolean;
};

export type CodeTestResult = {
  status: CodeRunStatus | "ok";
  passed: number;
  total: number;
  visible: CodeTestCaseResult[];
  hiddenPassed: number;
  hiddenTotal: number;
  /** Compile output surfaced when tests could not run because compilation failed. */
  compileOutput: string;
  provider: string;
  simulated: boolean;
  note?: string;
};

export type CodeReviewRequest = {
  itemId: string;
  source: string;
  lastRunResult?: CodeRunResult | null;
  lastTestResult?: CodeTestResult | null;
  userQuestion?: string;
};

// Structured AI review output now lives in StructuredCodeFeedback
// (code-feedback-types.ts, #410); the legacy CodeReviewResult was removed.

export type CodeAttemptSummary = {
  itemId: string;
  runStatus: CodeRunStatus | "ok";
  testsPassed: number | null;
  testsTotal: number | null;
  aiReviewRequested: boolean;
};

/** Maximum sizes enforced at the API boundary to bound runner/AI cost. */
export const CODE_LAB_LIMITS = {
  maxSourceChars: 20_000,
  maxStdinChars: 10_000
} as const;
