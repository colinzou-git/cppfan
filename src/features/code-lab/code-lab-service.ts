import type {
  CodeRunResult,
  CodeTestCase,
  CodeTestCaseResult,
  CodeTestResult
} from "./code-lab-types";
import { getCodeLabConfigForItem } from "./code-lab-catalog";
import { CODE_LAB_STALE_NOTE } from "./code-lab-item-resolver";
import { resolveCodeExecutionPlan } from "./code-execution-plan";
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

/**
 * A run/test whose user-content definition changed under it: refused rather
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
    note: CODE_LAB_STALE_NOTE,
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
    note: CODE_LAB_STALE_NOTE,
    staleDefinition: true
  };
}

export const ITEM_UNAVAILABLE_NOTE =
  "This exercise is no longer available. Return to the catalog or reload if it was recently republished.";

/**
 * The item could not be resolved (unknown id, or a user item that was archived /
 * deleted / unpublished). Run and Test return the SAME non-success signal before
 * touching the runner, so a missing item can never look like a successful run or
 * a valid zero-test pass (#614).
 */
function unavailableRunResult(): CodeRunResult {
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
    note: ITEM_UNAVAILABLE_NOTE,
    itemUnavailable: true
  };
}

function unavailableTestResult(): CodeTestResult {
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
    note: ITEM_UNAVAILABLE_NOTE,
    itemUnavailable: true
  };
}

function authorContractRunResult(note: string): CodeRunResult {
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
    note
  };
}

function authorContractTestResult(note: string): CodeTestResult {
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
    note
  };
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
  const planned = await resolveCodeExecutionPlan({
    itemId: input.itemId,
    expectedContentVersionId: input.expectedVersionId,
    milestoneIndex: input.milestoneIndex,
    learnerSource: input.source,
    compilerFlags: input.compilerFlags
  });
  if (planned.status === "stale_definition") {
    return staleRunResult();
  }
  // An unknown/unpublished item is refused BEFORE the runner, identically to
  // Test, so Run can never compile arbitrary source without a task context (#614).
  if (planned.status === "item_unavailable") {
    return unavailableRunResult();
  }
  if (planned.status === "invalid_contract") {
    return authorContractRunResult(planned.message);
  }
  const { plan } = planned;
  const result = await executeRun(
    buildRunnerInput({
      source: plan.preparedSource,
      stdin: input.stdin ?? "",
      compilerFlags: plan.compilerFlags,
      files: plan.files
    })
  );
  const { classifications } = classifyCodeAttempt({
    runResult: result,
    skillTags: plan.config.skillTags ?? []
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
  const planned = await resolveCodeExecutionPlan({
    itemId: input.itemId,
    expectedContentVersionId: input.expectedVersionId,
    milestoneIndex: input.milestoneIndex,
    learnerSource: input.source,
    compilerFlags: input.compilerFlags
  });
  if (planned.status === "stale_definition") {
    return staleTestResult();
  }
  if (planned.status === "item_unavailable") {
    return unavailableTestResult();
  }
  if (planned.status === "invalid_contract") {
    return authorContractTestResult(planned.message);
  }
  const { plan } = planned;
  const visibleCases = plan.visibleTests;
  const hiddenCases = input.includeHidden === false ? [] : plan.hiddenTests;

  const visible: CodeTestCaseResult[] = [];
  let hiddenPassed = 0;
  let provider = "none";
  let simulated = false;

  for (const test of visibleCases) {
    const run = await executeRun(
      buildRunnerInput({
        source: plan.preparedSource,
        stdin: test.stdin ?? "",
        compilerFlags: plan.compilerFlags,
        files: plan.files
      })
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
      return withClassifications(compileResult, plan.config.skillTags ?? [], input.itemId);
    }
    const passed =
      run.status === "success" &&
      compareOutput(run.stdout, test.expectedStdout ?? "", test.matcher);
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
      buildRunnerInput({
        source: plan.preparedSource,
        stdin: test.stdin ?? "",
        compilerFlags: plan.compilerFlags,
        files: plan.files
      })
    );
    provider = run.provider;
    simulated = run.simulated;
    if (
      run.status === "success" &&
      compareOutput(run.stdout, test.expectedStdout ?? "", test.matcher)
    ) {
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
  return withClassifications(result, plan.config.skillTags ?? [], input.itemId);
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
