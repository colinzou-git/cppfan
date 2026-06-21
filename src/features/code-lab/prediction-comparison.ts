import type { CodeRunResult, CodeTestResult } from "./code-lab-types";
import type {
  CodePredictionComparison,
  CodePredictionPrompt,
  CodePredictionSubmission
} from "./prediction-types";

/**
 * Compares predictions to the actual run/test result (#413). MVP: stdout and
 * failing-test predictions are comparable; other kinds return a reflective
 * not_comparable result. Pure and deterministic.
 */

function submissionValue(
  submissions: CodePredictionSubmission[],
  promptId: string
): string | undefined {
  return submissions.find((submission) => submission.promptId === promptId)?.value;
}

function compareStdout(
  predicted: string,
  runResult?: CodeRunResult
): CodePredictionComparison["status"] | "pending" {
  if (!runResult) return "pending";
  return predicted.trim() === runResult.stdout.trim() ? "matched" : "mismatched";
}

function firstFailedVisibleName(testResult?: CodeTestResult): string | null {
  if (!testResult) return null;
  return testResult.visible.find((test) => !test.passed)?.name ?? null;
}

function looksLikeNone(value: string): boolean {
  return /^(none|no|n\/a|pass|all pass)/i.test(value.trim());
}

export function comparePredictionsToRunResult(input: {
  prompts: CodePredictionPrompt[];
  submissions: CodePredictionSubmission[];
  runResult?: CodeRunResult;
  testResult?: CodeTestResult;
}): CodePredictionComparison[] {
  const comparisons: CodePredictionComparison[] = [];

  for (const prompt of input.prompts) {
    const value = submissionValue(input.submissions, prompt.id);
    if (value === undefined || value.trim().length === 0) continue;

    if (prompt.kind === "stdout") {
      const status = compareStdout(value, input.runResult);
      if (status === "pending") continue;
      comparisons.push({
        promptId: prompt.id,
        status,
        explanation:
          status === "matched"
            ? "Your stdout prediction matched the actual output."
            : `Your prediction differed. Expected ${JSON.stringify(
                value.trim()
              )}, actual ${JSON.stringify(input.runResult?.stdout.trim() ?? "")}.`
      });
      continue;
    }

    if (prompt.kind === "failing_test") {
      if (!input.testResult) continue;
      const firstFailed = firstFailedVisibleName(input.testResult);
      let status: CodePredictionComparison["status"];
      if (firstFailed === null) {
        status = looksLikeNone(value) ? "matched" : "mismatched";
      } else {
        status = value.trim().toLowerCase().includes(firstFailed.toLowerCase())
          ? "matched"
          : "mismatched";
      }
      comparisons.push({
        promptId: prompt.id,
        status,
        explanation:
          firstFailed === null
            ? status === "matched"
              ? "You predicted no failing test, and all visible tests passed."
              : "All visible tests passed, but you predicted a failure."
            : status === "matched"
              ? `You correctly predicted "${firstFailed}" would fail.`
              : `The first failing visible test was "${firstFailed}".`
      });
      continue;
    }

    // first_variable_change / loop_invariant / complexity: not auto-gradable.
    comparisons.push({
      promptId: prompt.id,
      status: "not_comparable",
      explanation:
        "Reflect on this prediction yourself — try Trace with AI or the boundary-case checklist to check it."
    });
  }

  return comparisons;
}
