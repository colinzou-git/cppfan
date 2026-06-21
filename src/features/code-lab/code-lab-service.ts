import type {
  CodeRunResult,
  CodeTestCase,
  CodeTestCaseResult,
  CodeTestResult
} from "./code-lab-types";
import { DEFAULT_COMPILER_FLAGS } from "./code-lab-defaults";
import { getCodeLabConfigForItem } from "./code-lab-catalog";
import { getHiddenTestsForItem } from "./code-lab-hidden-tests";
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

export async function runCode(input: {
  itemId: string;
  source: string;
  stdin?: string;
  compilerFlags?: string[];
}): Promise<CodeRunResult> {
  const config = getCodeLabConfigForItem(input.itemId);
  const result = await executeRun(
    buildRunnerInput({
      source: input.source,
      stdin: input.stdin ?? "",
      compilerFlags: resolvedFlags(input.compilerFlags ?? config?.compilerFlags)
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
}): Promise<CodeTestResult> {
  const config = getCodeLabConfigForItem(input.itemId);
  if (!config) {
    return emptyTestResult("invalid_item");
  }

  const flags = resolvedFlags(input.compilerFlags ?? config.compilerFlags);
  const visibleCases = config.visibleTests ?? [];
  const hiddenCases = input.includeHidden === false ? [] : getHiddenTestsForItem(input.itemId);

  const visible: CodeTestCaseResult[] = [];
  let hiddenPassed = 0;
  let provider = "none";
  let simulated = false;

  for (const test of visibleCases) {
    const run = await executeRun(
      buildRunnerInput({ source: input.source, stdin: test.stdin ?? "", compilerFlags: flags })
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
      buildRunnerInput({ source: input.source, stdin: test.stdin ?? "", compilerFlags: flags })
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
