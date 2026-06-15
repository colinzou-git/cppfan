// In-session follow-up delivery and reasoning credit (#181). Pure and
// deterministic — no live generation. Decides what to deliver from the reviewed
// follow-up catalog given the learner's first solution and remaining time, and
// grades the adaptation by reasoning (partial credit when implementation time
// expires). Records whether the learner explained the impact before editing.
import { selectFollowUp, type FollowUp, type FollowUpSelectionInput } from "./follow-ups";

export type FollowUpDelivery =
  | { mode: "follow_up"; followUp: FollowUp }
  | { mode: "diagnostic_hint"; reason: string }
  | { mode: "none"; reason: string };

/**
 * Decide the in-session delivery for a problem. When the base solution is not yet
 * correct, deliver a diagnostic/hint instead of an advanced follow-up; otherwise
 * pick the highest-priority reviewed follow-up that fits the remaining time, or
 * report that none fits. Deterministic for identical inputs.
 */
export function decideFollowUpDelivery(problemId: string, input: FollowUpSelectionInput): FollowUpDelivery {
  if (!input.baseSolutionCorrect) {
    return {
      mode: "diagnostic_hint",
      reason: "Your base solution is not correct yet — work a diagnostic question or hint before any follow-up."
    };
  }
  const followUp = selectFollowUp(problemId, input);
  if (followUp) {
    return { mode: "follow_up", followUp };
  }
  return {
    mode: "none",
    reason: "No reviewed follow-up fits the remaining time — keep the original solution and refine it."
  };
}

export type FollowUpReasoningInput = {
  /** Recorded: did the learner explain the impact before editing code? */
  explainedImpactBeforeEdit: boolean;
  reasoningCorrect: boolean;
  implementationComplete: boolean;
  timeExpired: boolean;
};

export type FollowUpCredit = "full" | "partial" | "none";

export type FollowUpOutcome = {
  credit: FollowUpCredit;
  /** Passed through for the session record, never gates credit. */
  explainedImpactBeforeEdit: boolean;
  reason: string;
};

/**
 * Grade a follow-up by reasoning. Correct reasoning with a finished adaptation is
 * full credit; correct reasoning when implementation time expires (or it is
 * unfinished) earns partial credit; incorrect reasoning earns none. Whether the
 * learner explained the impact before editing is recorded but never gates credit.
 */
export function gradeFollowUp(input: FollowUpReasoningInput): FollowUpOutcome {
  const explainedImpactBeforeEdit = Boolean(input.explainedImpactBeforeEdit);
  if (!input.reasoningCorrect) {
    return {
      credit: "none",
      explainedImpactBeforeEdit,
      reason: "The adaptation reasoning was not correct."
    };
  }
  if (input.implementationComplete && !input.timeExpired) {
    return {
      credit: "full",
      explainedImpactBeforeEdit,
      reason: "Correct reasoning and a completed adaptation."
    };
  }
  return {
    credit: "partial",
    explainedImpactBeforeEdit,
    reason: "Correct reasoning earns partial credit even though the implementation was not finished in time."
  };
}
