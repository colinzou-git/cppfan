/**
 * Shared types for the in-app C++ Code Lab (#407). These are imported by both
 * client UI and server route/service code, so this module must stay free of any
 * server-only or browser-only imports.
 */

import type { CodeTagClassification } from "./code-error-tags";
import type { CodePredictionPrompt, PredictionMode } from "./prediction-types";

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
  /**
   * Optional milestone this visible test maps to (#439). Project labs compile a
   * single codebase; this only labels which checkpoint a test exercises so
   * milestone progress can later be inferred. Never gates compilation.
   */
  milestoneId?: string;
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
  /** Phase 3.2 (#411) explicit boundary-case checklist ids to show/supplement. */
  boundaryChecklistIds?: string[];
  /** Phase 3.2 (#411) opt out of boundary checklists for this item. */
  boundaryChecklistsEnabled?: boolean;
  /** Phase 3.4 (#413) prediction-before-run mode; defaults to "off". */
  predictionMode?: PredictionMode;
  /** Phase 3.4 (#413) explicit prediction prompts; defaults are derived if omitted. */
  predictionPrompts?: CodePredictionPrompt[];
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
  /** Deterministic error-tag classifications for this run (#412). */
  classifications?: CodeTagClassification[];
  /**
   * True when a published user exercise (#488) was republished after this tab
   * loaded, so the run was refused rather than executed against a changed
   * definition. The client should prompt a reload.
   */
  staleDefinition?: boolean;
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
  /** Deterministic error-tag classifications for this test run (#412). */
  classifications?: CodeTagClassification[];
  /** See CodeRunResult.staleDefinition — the run was refused, not executed (#488). */
  staleDefinition?: boolean;
};

export type CodeReviewRequest = {
  itemId: string;
  source: string;
  lastRunResult?: CodeRunResult | null;
  lastTestResult?: CodeTestResult | null;
  userQuestion?: string;
  /** Published version the client loaded; a mismatch refuses review as stale (#611). */
  contentVersionId?: string;
  /** Active milestone for a multi-milestone user lab (#611). */
  milestoneIndex?: number;
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
