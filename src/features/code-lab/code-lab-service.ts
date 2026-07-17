import type {
  CodeRunResult,
  CodeTestCase,
  CodeTestCaseResult,
  CodeTestResult
} from "./code-lab-types";
import type { LearningItemCodeLab } from "./code-lab-types";
import { DEFAULT_COMPILER_FLAGS } from "./code-lab-defaults";
import { getCodeLabConfigForItem } from "./code-lab-catalog";
import { resolveCodeLabItem, CODE_LAB_STALE_NOTE } from "./code-lab-item-resolver";
import { buildFunctionExerciseTranslationUnit } from "@/features/user-content/function-exercise-harness";
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

const ITEM_UNAVAILABLE_NOTE =
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

/**
 * Prepare the actual source sent to the runner. Function-mode exercises (#607)
 * are wrapped in the generated single-`main` harness keyed off the authored
 * signature; every other mode runs the learner source unchanged. A build failure
 * means the AUTHOR's contract is invalid (should be caught at publish) — distinct
 * from a learner compile error, which surfaces later as a normal compile_error.
 */
function prepareRunnerSource(
  config: LearningItemCodeLab,
  learnerSource: string
): { ok: true; source: string } | { ok: false; note: string } {
  if (config.mode !== "function") {
    return { ok: true, source: learnerSource };
  }
  const built = buildFunctionExerciseTranslationUnit({
    learnerSource,
    functionSignature: config.functionSignature ?? ""
  });
  if (!built.ok) {
    return {
      ok: false,
      note: `This function-mode exercise has an invalid author signature: ${built.issues.map((i) => i.message).join("; ")}`
    };
  }
  return { ok: true, source: built.source };
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
  const resolved = await resolveCodeLabItem({
    itemId: input.itemId,
    expectedContentVersionId: input.expectedVersionId,
    milestoneIndex: input.milestoneIndex
  });
  if (resolved.status === "stale_definition") {
    return staleRunResult();
  }
  // An unknown/unpublished item is refused BEFORE the runner, identically to
  // Test, so Run can never compile arbitrary source without a task context (#614).
  if (resolved.status === "not_found") {
    return unavailableRunResult();
  }
  const item = resolved.item;
  const config = item.config;
  const prepared = prepareRunnerSource(config, input.source);
  if (!prepared.ok) {
    return authorContractRunResult(prepared.note);
  }
  const result = await executeRun(
    buildRunnerInput({
      source: prepared.source,
      stdin: input.stdin ?? "",
      compilerFlags: resolvedFlags(input.compilerFlags ?? config.compilerFlags),
      files: item.files
    })
  );
  const { classifications } = classifyCodeAttempt({
    runResult: result,
    skillTags: config.skillTags ?? []
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
  const resolved = await resolveCodeLabItem({
    itemId: input.itemId,
    expectedContentVersionId: input.expectedVersionId,
    milestoneIndex: input.milestoneIndex
  });
  if (resolved.status === "stale_definition") {
    return staleTestResult();
  }
  if (resolved.status === "not_found") {
    return unavailableTestResult();
  }
  const { config, hiddenTests, files } = resolved.item;

  // Function-mode source is wrapped once in the generated harness; each test then
  // supplies its own stdin, exactly like a stdin-mode exercise (#607).
  const prepared = prepareRunnerSource(config, input.source);
  if (!prepared.ok) {
    return authorContractTestResult(prepared.note);
  }
  const runnerSource = prepared.source;

  const flags = resolvedFlags(input.compilerFlags ?? config.compilerFlags);
  const visibleCases = config.visibleTests ?? [];
  const hiddenCases = input.includeHidden === false ? [] : hiddenTests;

  const visible: CodeTestCaseResult[] = [];
  let hiddenPassed = 0;
  let provider = "none";
  let simulated = false;

  for (const test of visibleCases) {
    const run = await executeRun(
      buildRunnerInput({ source: runnerSource, stdin: test.stdin ?? "", compilerFlags: flags, files })
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
      buildRunnerInput({ source: runnerSource, stdin: test.stdin ?? "", compilerFlags: flags, files })
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
