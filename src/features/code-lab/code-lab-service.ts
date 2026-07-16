import type {
  CodeRunResult,
  CodeTestCase,
  CodeTestCaseResult,
  CodeTestResult
} from "./code-lab-types";
import { DEFAULT_COMPILER_FLAGS } from "./code-lab-defaults";
import { getCodeLabConfigForItem } from "./code-lab-catalog";
import { getHiddenTestsForItem } from "./code-lab-hidden-tests";
import { resolveUserExerciseExecution } from "./user-exercise-code-lab";
import { resolveUserLabExecution } from "./user-lab-code-lab";
import { resolveUserInterviewExecution } from "./user-interview-code-lab";
import { buildRunnerInput, executeRun } from "./code-runner";
import { classifyCodeAttempt } from "./code-error-classifier";
import { getBoundaryChecklistsForCodeLab } from "./boundary-checklist-service";

/**
 * Server-side orchestration for Code Lab run/test (#407). Runner calls stay
 * here (and downstream), never in client code. Output grading is pure and
 * reused for visible and hidden cases so hidden expectations never leak.
 */

export function compareOutput(
  actual: string,
  expected: string,
  matcher: CodeTestCase["matcher"] = "exact"
): boolean {
  switch (matcher) {
    case "trimmed":
      return actual.trim() === expected.trim();
    case "contains":
      return actual.includes(expected);
    case "exact":
    default:
      return actual === expected;
  }
}

function resolvedFlags(itemFlags?: string[]): string[] {
  return itemFlags && itemFlags.length > 0 ? itemFlags : [...DEFAULT_COMPILER_FLAGS];
}

const DEFINITION_CHANGED_NOTE =
  "This exercise was republished since you opened it. Reload the page to run against the current definition.";

/**
 * A run/test whose user-exercise definition changed under it: refused rather
 * than executed against a different (hidden) test suite (#488). The client
 * detects `staleDefinition` and prompts a reload.
 */
function staleRunResult(): CodeRunResult {
  return {
    status: "runner_error",
    compileOutput: "",
    stdout: "",
    stderr: "",
    exitCode: null,
    timedOut: false,
    durationMs: null,
    memoryKb: null,
    provider: "none",
    simulated: false,
    note: DEFINITION_CHANGED_NOTE,
    staleDefinition: true
  };
}

function staleTestResult(): CodeTestResult {
  return {
    status: "runner_error",
    passed: 0,
    total: 0,
    visible: [],
    hiddenPassed: 0,
    hiddenTotal: 0,
    compileOutput: "",
    provider: "none",
    simulated: false,
    note: DEFINITION_CHANGED_NOTE,
    staleDefinition: true
  };
}

/**
 * True when `itemId` is a user exercise, an expected version was supplied, and
 * the current published version differs — i.e. the caller's tab is stale.
 */
function isStale(expectedVersionId: string | undefined, publishedVersionId: string | null): boolean {
  return Boolean(expectedVersionId && publishedVersionId && expectedVersionId !== publishedVersionId);
}

/**
 * Resolve a published user item's Code Lab execution (config + hidden tests +
 * version) — an exercise, or failing that a lab. Native items resolve a sync
 * config and never reach here.
 */
async function resolveUserItemExecution(itemId: string, milestoneIndex = 0) {
  const exercise = await resolveUserExerciseExecution(itemId);
  if (exercise) {
    return { ...exercise, files: [] as { name: string; content: string }[] };
  }
  return (await resolveUserLabExecution(itemId, milestoneIndex)) ?? (await resolveUserInterviewExecution(itemId));
}

export async function runCode(input: {
  itemId: string;
  source: string;
  stdin?: string;
  compilerFlags?: string[];
  /** The published version the client loaded; a mismatch refuses the run (#488). */
  expectedVersionId?: string;
  /** Active milestone for a user lab (#489). */
  milestoneIndex?: number;
}): Promise<CodeRunResult> {
  const staticConfig = getCodeLabConfigForItem(input.itemId);
  const resolvedUser = staticConfig ? null : await resolveUserItemExecution(input.itemId, input.milestoneIndex);
  if (resolvedUser && isStale(input.expectedVersionId, resolvedUser.publishedVersionId)) {
    return staleRunResult();
  }
  const config = staticConfig ?? resolvedUser?.config ?? null;
  const result = await executeRun(
    buildRunnerInput({
      source: input.source,
      stdin: input.stdin ?? "",
      compilerFlags: resolvedFlags(input.compilerFlags ?? config?.compilerFlags),
      files: resolvedUser?.files
    })
  );
  const { classifications } = classifyCodeAttempt({
    runResult: result,
    skillTags: config?.skillTags ?? []
  });
  return classifications.length > 0 ? { ...result, classifications } : result;
}

/**
 * Compile once, then run every selected test case against that program. A run
 * is executed per case because stdin varies; the first compile failure short-
 * circuits with a compile-error summary instead of fabricated test results.
 */
export async function runTests(input: {
  itemId: string;
  source: string;
  includeHidden?: boolean;
  compilerFlags?: string[];
  /** The published version the client loaded; a mismatch refuses the run (#488). */
  expectedVersionId?: string;
  /** Active milestone for a user lab (#489). */
  milestoneIndex?: number;
}): Promise<CodeTestResult> {
  let config = getCodeLabConfigForItem(input.itemId);
  let hiddenTests = config ? getHiddenTestsForItem(input.itemId) : [];
  let files: { name: string; content: string }[] = [];
  if (!config) {
    // Published user-created exercises/labs carry no static config; resolve from the DB.
    const resolved = await resolveUserItemExecution(input.itemId, input.milestoneIndex);
    if (!resolved) {
      return emptyTestResult("invalid_item");
    }
    if (isStale(input.expectedVersionId, resolved.publishedVersionId)) {
      return staleTestResult();
    }
    config = resolved.config;
    hiddenTests = resolved.hiddenTests;
    files = resolved.files;
  }

  const flags = resolvedFlags(input.compilerFlags ?? config.compilerFlags);
  const visibleCases = config.visibleTests ?? [];
  const hiddenCases = input.includeHidden === false ? [] : hiddenTests;

  const visible: CodeTestCaseResult[] = [];
  let hiddenPassed = 0;
  let provider = "none";
  let simulated = false;

  for (const test of visibleCases) {
    const run = await executeRun(
      buildRunnerInput({ source: input.source, stdin: test.stdin ?? "", compilerFlags: flags, files })
    );
    provider = run.provider;
    simulated = run.simulated;
    if (run.status === "compile_error") {
      const compileResult: CodeTestResult = {
        status: "compile_error",
        passed: 0,
        total: visibleCases.length + hiddenCases.length,
        visible: [],
        hiddenPassed: 0,
        hiddenTotal: hiddenCases.length,
        compileOutput: run.compileOutput,
        provider: run.provider,
        simulated: run.simulated,
        note: "Tests did not run because the code did not compile."
      };
      return withClassifications(compileResult, config.skillTags ?? [], input.itemId);
    }
    const passed = run.status === "success" && compareOutput(run.stdout, test.expectedStdout ?? "", test.matcher);
    visible.push({
      name: test.name,
      passed,
      expectedStdout: test.expectedStdout,
      actualStdout: run.stdout,
      matcher: test.matcher ?? "exact",
      hidden: false
    });
  }

  for (const test of hiddenCases) {
    const run = await executeRun(
      buildRunnerInput({ source: input.source, stdin: test.stdin ?? "", compilerFlags: flags, files })
    );
    provider = run.provider;
    simulated = run.simulated;
    if (run.status === "success" && compareOutput(run.stdout, test.expectedStdout ?? "", test.matcher)) {
      hiddenPassed += 1;
    }
  }

  const visiblePassed = visible.filter((result) => result.passed).length;
  const result: CodeTestResult = {
    status: "ok",
    passed: visiblePassed + hiddenPassed,
    total: visible.length + hiddenCases.length,
    visible,
    hiddenPassed,
    hiddenTotal: hiddenCases.length,
    compileOutput: "",
    provider,
    simulated
  };
  return withClassifications(result, config.skillTags ?? [], input.itemId);
}

function withClassifications(
  result: CodeTestResult,
  skillTags: string[],
  itemId: string
): CodeTestResult {
  const config = getCodeLabConfigForItem(itemId);
  const { classifications } = classifyCodeAttempt({
    testResult: result,
    skillTags,
    boundaryChecklists: config ? getBoundaryChecklistsForCodeLab(config) : []
  });
  return classifications.length > 0 ? { ...result, classifications } : result;
}

function emptyTestResult(note: string): CodeTestResult {
  return {
    status: "ok",
    passed: 0,
    total: 0,
    visible: [],
    hiddenPassed: 0,
    hiddenTotal: 0,
    compileOutput: "",
    provider: "none",
    simulated: false,
    note
  };
}
