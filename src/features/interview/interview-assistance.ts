// Assistance-dependence summary for the readiness report (#182). Pure and
// deterministic: of the learner's recent correct solves, how many were
// independent (no hints) versus hint-assisted. High hint reliance means a solve
// count overstates real readiness. Derived from the per-evidence hint counts on
// interview_evidence (#180); never reads or writes FSRS.
import type { InterviewEvidence } from "./readiness";

export type AssistanceBand = "independent" | "light" | "reliant";

export type AssistanceSummary = {
  /** Correct solves in the window. */
  recentSolves: number;
  /** Correct solves with no hints used. */
  independentSolves: number;
  /** Correct solves that used at least one hint. */
  hintedSolves: number;
  /** hintedSolves / recentSolves, or null when there are no solves yet. */
  hintRelianceRate: number | null;
  band: AssistanceBand | null;
};

function band(rate: number): AssistanceBand {
  if (rate < 0.25) {
    return "independent";
  }
  if (rate < 0.5) {
    return "light";
  }
  return "reliant";
}

/** Summarize how much the learner's recent correct solves leaned on hints. Pure. */
export function summarizeAssistance(evidence: InterviewEvidence[]): AssistanceSummary {
  const solves = evidence.filter((e) => e.correct);
  const hinted = solves.filter((e) => e.hintsUsed > 0).length;
  const recentSolves = solves.length;
  const hintRelianceRate = recentSolves > 0 ? hinted / recentSolves : null;
  return {
    recentSolves,
    independentSolves: recentSolves - hinted,
    hintedSolves: hinted,
    hintRelianceRate,
    band: hintRelianceRate === null ? null : band(hintRelianceRate)
  };
}
