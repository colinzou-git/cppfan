import type { CodeTagClassification } from "./code-error-tags";
import type { CodeRunResult, CodeTestResult } from "./code-lab-types";
import type { BoundaryChecklist } from "./boundary-checklist-types";
import { classifyCompilerDiagnostics } from "./compiler-diagnostic-classifier";
import { classifyRuntimeError } from "./runtime-error-classifier";
import { classifyVisibleTestFailures } from "./test-failure-classifier";

/**
 * Deterministic Code Lab error-tag classifier (#412). Combines compiler,
 * runtime, and test classifiers into one de-duplicated, ranked result. AI-free;
 * never throws on unrecognised output.
 */

export type CodeAttemptClassificationInput = {
  runResult?: CodeRunResult | null;
  testResult?: CodeTestResult | null;
  skillTags?: string[];
  boundaryChecklists?: BoundaryChecklist[];
};

export type CodeAttemptClassification = {
  classifications: CodeTagClassification[];
  primary: CodeTagClassification | null;
};

const SOURCE_RANK: Record<CodeTagClassification["source"], number> = {
  compiler: 3,
  runtime: 2,
  test: 1,
  ai: 0
};

const CONFIDENCE_RANK: Record<CodeTagClassification["confidence"], number> = {
  high: 3,
  medium: 2,
  low: 1
};

/** De-duplicate by tag+source, keeping the highest-confidence entry. */
export function dedupeClassifications(items: CodeTagClassification[]): CodeTagClassification[] {
  const best = new Map<string, CodeTagClassification>();
  for (const item of items) {
    const key = `${item.source}:${item.tag}`;
    const existing = best.get(key);
    if (!existing || CONFIDENCE_RANK[item.confidence] > CONFIDENCE_RANK[existing.confidence]) {
      best.set(key, item);
    }
  }
  return [...best.values()];
}

/** The most actionable classification: deterministic source first, then confidence. */
export function pickPrimaryCodeErrorTag(
  items: CodeTagClassification[]
): CodeTagClassification | null {
  let primary: CodeTagClassification | null = null;
  for (const item of items) {
    if (!primary) {
      primary = item;
      continue;
    }
    const better =
      SOURCE_RANK[item.source] > SOURCE_RANK[primary.source] ||
      (SOURCE_RANK[item.source] === SOURCE_RANK[primary.source] &&
        CONFIDENCE_RANK[item.confidence] > CONFIDENCE_RANK[primary.confidence]);
    if (better) primary = item;
  }
  return primary;
}

export function classifyCodeAttempt(
  input: CodeAttemptClassificationInput
): CodeAttemptClassification {
  const collected: CodeTagClassification[] = [];

  const run = input.runResult;
  if (run) {
    collected.push(...classifyCompilerDiagnostics(run.compileOutput));
    collected.push(
      ...classifyRuntimeError({
        stderr: run.stderr,
        exitCode: run.exitCode,
        timedOut: run.timedOut
      })
    );
  }

  const test = input.testResult;
  if (test) {
    if (test.compileOutput) {
      collected.push(...classifyCompilerDiagnostics(test.compileOutput));
    }
    collected.push(
      ...classifyVisibleTestFailures({
        testResults: [test],
        skillTags: input.skillTags ?? [],
        boundaryChecklists: input.boundaryChecklists
      })
    );
  }

  const classifications = dedupeClassifications(collected);
  return { classifications, primary: pickPrimaryCodeErrorTag(classifications) };
}
