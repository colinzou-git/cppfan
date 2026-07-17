/*
 * Pure combination logic for learner-side formal evaluation of user-created
 * content (#609). Authors can select AI, self, automated, judge, or combined
 * evaluation modes, but the learner workspace had no submission outcome that
 * respected the selected mode. This is the deterministic heart of that
 * orchestrator: given the objective (test/judge) result, optional AI rubric
 * verdict, and optional self-assessment, it computes the final evaluation status
 * and whether completion is credited.
 *
 * The invariant this enforces: for combined modes, a FAILING objective result can
 * never become an overall pass just because AI feedback is optimistic — the
 * deterministic objective outcome is authoritative and AI is advisory. Provider
 * failure never fabricates a pass. Self-assessment credits completion only as
 * explicitly weaker evidence.
 *
 * Pure and I/O-free: the async service (resolve definition, run tests/judge, call
 * the provider, persist evidence) wraps this; the pass/fail decision lives here so
 * it is fully unit-testable.
 */

export type ContentEvaluationMode =
  | "automated_tests"
  | "ai_evaluation"
  | "self_evaluation"
  | "automated_plus_ai"
  | "judge"
  | "judge_plus_ai";

export type EvaluationStatus = "passed" | "partial" | "failed" | "unavailable" | "invalid";

/** Deterministic test/judge result. `total === 0` means the item defines no tests. */
export type ObjectiveOutcome = { passed: number; total: number };

/** Formal AI rubric verdict (distinct from optional AI help/review). */
export type AiOutcome = { available: boolean; verdict: "pass" | "revise" | "unknown" };

export type SelfOutcome = { rating: "not_yet" | "partial" | "complete" };

export type CombineEvaluationInput = {
  mode: ContentEvaluationMode;
  objective?: ObjectiveOutcome;
  ai?: AiOutcome;
  self?: SelfOutcome;
};

export type CombineEvaluationResult = {
  status: EvaluationStatus;
  /** True only when the mode's outcome credits completion (see reason). */
  completionCredited: boolean;
  /** Whether this pass rests on deterministic objective evidence (strong). */
  objectiveAuthoritative: boolean;
  reason: string;
};

function objectiveStatus(objective: ObjectiveOutcome): EvaluationStatus {
  if (objective.total === 0) {
    // No tests defined: objective evaluation cannot assert a pass on its own.
    return "partial";
  }
  return objective.passed >= objective.total ? "passed" : "failed";
}

export function combineEvaluationOutcome(input: CombineEvaluationInput): CombineEvaluationResult {
  const { mode, objective, ai, self } = input;

  switch (mode) {
    case "automated_tests":
    case "judge": {
      if (!objective) {
        return { status: "invalid", completionCredited: false, objectiveAuthoritative: false, reason: "objective result required" };
      }
      const status = objectiveStatus(objective);
      return {
        status,
        completionCredited: status === "passed",
        objectiveAuthoritative: true,
        reason: `objective ${objective.passed}/${objective.total}`
      };
    }

    case "automated_plus_ai":
    case "judge_plus_ai": {
      if (!objective) {
        return { status: "invalid", completionCredited: false, objectiveAuthoritative: false, reason: "objective result required" };
      }
      // Objective is authoritative: a failing objective can NEVER become a pass
      // from optimistic AI. AI only grounds the feedback shown alongside it.
      const status = objectiveStatus(objective);
      return {
        status,
        completionCredited: status === "passed",
        objectiveAuthoritative: true,
        reason:
          status === "passed"
            ? `objective ${objective.passed}/${objective.total} passed; AI feedback is advisory`
            : `objective ${objective.passed}/${objective.total} failed; AI optimism does not override`
      };
    }

    case "ai_evaluation": {
      if (!ai || !ai.available) {
        // Provider failure never fabricates a pass — retryable, no completion.
        return { status: "unavailable", completionCredited: false, objectiveAuthoritative: false, reason: "AI evaluation unavailable" };
      }
      if (ai.verdict === "pass") {
        return { status: "passed", completionCredited: true, objectiveAuthoritative: false, reason: "AI rubric pass (weak evidence)" };
      }
      return { status: "partial", completionCredited: false, objectiveAuthoritative: false, reason: `AI verdict ${ai.verdict}` };
    }

    case "self_evaluation": {
      if (!self) {
        return { status: "invalid", completionCredited: false, objectiveAuthoritative: false, reason: "self-assessment required" };
      }
      if (self.rating === "complete") {
        // Weaker evidence than objective passing tests, but an intentional
        // learner submission credits completion for a self-evaluated item.
        return { status: "passed", completionCredited: true, objectiveAuthoritative: false, reason: "self-assessed complete (weak evidence)" };
      }
      if (self.rating === "partial") {
        return { status: "partial", completionCredited: false, objectiveAuthoritative: false, reason: "self-assessed partial" };
      }
      return { status: "failed", completionCredited: false, objectiveAuthoritative: false, reason: "self-assessed not yet" };
    }

    default: {
      const _exhaustive: never = mode;
      return { status: "invalid", completionCredited: false, objectiveAuthoritative: false, reason: `unknown mode ${String(_exhaustive)}` };
    }
  }
}

/** Extract the objective outcome from a deterministic test result (#609). */
export function objectiveOutcomeFromTestResult(
  test: { passed: number; total: number } | null | undefined
): ObjectiveOutcome | undefined {
  return test ? { passed: test.passed, total: test.total } : undefined;
}

/** The learner-facing formal evaluation result the submission API returns (#609). */
export type UserContentEvaluationResult = {
  status: EvaluationStatus;
  mode: ContentEvaluationMode;
  objective?: ObjectiveOutcome;
  completionCredited: boolean;
  objectiveAuthoritative: boolean;
  reason: string;
  /** Learner-facing next step derived from the outcome. */
  nextAction: string;
};

function nextActionFor(status: EvaluationStatus): string {
  switch (status) {
    case "passed":
      return "Completion recorded — continue to your next review item.";
    case "partial":
      return "Address the feedback, then resubmit for evaluation.";
    case "failed":
      return "Fix the failing tests/criteria and resubmit.";
    case "unavailable":
      return "Evaluation is temporarily unavailable — your work is saved; try again.";
    case "invalid":
    default:
      return "This submission could not be evaluated.";
  }
}

/**
 * Compose the full formal evaluation result from the mode + available evidence,
 * grounding the pass/fail on combineEvaluationOutcome so a failing objective can
 * never be flipped to a pass by optimistic AI (#609). The async submission
 * service (resolve definition, run tests/judge, call the provider, persist)
 * gathers the inputs and wraps this pure builder.
 */
export function buildUserContentEvaluationResult(input: CombineEvaluationInput): UserContentEvaluationResult {
  const combined = combineEvaluationOutcome(input);
  return {
    status: combined.status,
    mode: input.mode,
    ...(input.objective ? { objective: input.objective } : {}),
    completionCredited: combined.completionCredited,
    objectiveAuthoritative: combined.objectiveAuthoritative,
    reason: combined.reason,
    nextAction: nextActionFor(combined.status)
  };
}
