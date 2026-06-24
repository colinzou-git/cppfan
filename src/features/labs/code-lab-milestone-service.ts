import type { CodeRunResult, CodeTestResult } from "@/features/code-lab/code-lab-types";
import type { CapstoneMilestone } from "./capstone-tracks";
import { canRunMilestoneInApp } from "./milestone-code-lab-adapter";
import type { MilestoneCompletionEvidence } from "./code-lab-milestone-types";

/**
 * Completion rules and evidence for in-app Code Lab milestones (#418). An
 * in-app milestone requires its visible tests to pass before it can be marked
 * complete; a `reflection`-verified milestone also requires a saved reflection.
 * Codespaces/manual milestones keep their existing behavior (no extra gate).
 */

function reflectionSaved(reflection?: string): boolean {
  return Boolean(reflection && reflection.trim().length > 0);
}

export function buildMilestoneCompletionEvidence(input: {
  milestone: CapstoneMilestone;
  codeResult?: CodeRunResult | null;
  testResult?: CodeTestResult | null;
  reflection?: string;
}): MilestoneCompletionEvidence {
  return {
    milestoneId: input.milestone.id,
    executionMode: input.milestone.executionMode ?? "manual",
    testsPassed: input.testResult?.passed ?? null,
    testsTotal: input.testResult?.total ?? null,
    ranInApp: Boolean(input.codeResult || input.testResult),
    reflectionSaved: reflectionSaved(input.reflection)
  };
}

export function canMarkMilestoneComplete(input: {
  milestone: CapstoneMilestone;
  testResult?: CodeTestResult | null;
  reflection?: string;
  /**
   * #431: a previously recorded passing attempt (visible tests passed in the
   * full-screen /lab editor, persisted cross-device) satisfies the in-app test
   * gate, since editing/running now happens on /lab rather than inline here.
   */
  hasPassingAttempt?: boolean;
}): { ok: boolean; reason?: string } {
  // Reflection-verified milestones need a saved reflection, in-app or not.
  if (input.milestone.verification === "reflection" && !reflectionSaved(input.reflection)) {
    return { ok: false, reason: "Write a short reflection before marking this milestone complete." };
  }

  if (!canRunMilestoneInApp(input.milestone)) {
    // Codespaces/manual milestones keep their existing manual completion flow.
    return { ok: true };
  }

  if (input.hasPassingAttempt) {
    return { ok: true };
  }

  const test = input.testResult;
  if (!test || test.total === 0) {
    return { ok: false, reason: "Open Code and pass the visible tests first." };
  }
  if (test.status === "compile_error") {
    return { ok: false, reason: "Your code does not compile yet — fix it and run the tests." };
  }
  if (test.passed < test.total) {
    return {
      ok: false,
      reason: `Pass all visible tests to complete this milestone (${test.passed}/${test.total} passing).`
    };
  }
  return { ok: true };
}
