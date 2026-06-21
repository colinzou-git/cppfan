// Completed-session review summary (#179 / #174). Turns a finished timed
// session's evidence — per-phase timing, the judge's visible/hidden results, the
// learner's test notes, and how many times the code was revised — into a pure,
// deterministic review payload for the post-session surface. It never reads or
// writes FSRS state and invents no evidence: unobserved fields stay null.
import { SESSION_PHASES, type PhaseElapsedSeconds, type SessionPhase } from "./session-machine";

const PHASE_LABEL: Record<SessionPhase, string> = {
  clarification: "Clarify",
  examples: "Examples",
  baseline: "Baseline",
  optimization: "Optimize",
  implementation: "Implement",
  testing: "Test",
  complexity: "Complexity",
  follow_up: "Follow-up",
  reflection: "Reflect"
};

export type SessionJudgeResult = {
  compiled: boolean;
  visiblePassed: number;
  visibleTotal: number;
  hiddenPassed: number;
  hiddenTotal: number;
};

export type SessionReviewInput = {
  phaseElapsedSeconds: Partial<PhaseElapsedSeconds>;
  elapsedSeconds: number;
  durationMinutes: number;
  testNotes: string;
  codeDraft: string;
  /** Distinct code drafts saved during the session (a proxy for iteration). */
  codeRevisionCount: number;
  judge?: SessionJudgeResult | null;
};

export type SessionTimelineEntry = {
  phase: SessionPhase;
  label: string;
  seconds: number;
  /** Fraction of total phase time spent here, 0-1. */
  share: number;
};

export type SessionTestSummary = {
  /** Whether a judge run was attempted at all. */
  attempted: boolean;
  compiled: boolean | null;
  visiblePassed: number | null;
  visibleTotal: number | null;
  hiddenPassed: number | null;
  hiddenTotal: number | null;
  /** True only when it compiled and every visible+hidden test passed. */
  allPassed: boolean | null;
  notes: string;
};

export type SessionReviewSummary = {
  timeline: SessionTimelineEntry[];
  totalPhaseSeconds: number;
  elapsedSeconds: number;
  budgetSeconds: number;
  withinBudget: boolean;
  /** The phase the learner spent the most time in, or null when no time logged. */
  busiestPhase: SessionPhase | null;
  testSummary: SessionTestSummary;
  codeRevisionCount: number;
  codeBytes: number;
};

function clampSeconds(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function testSummaryFrom(input: SessionReviewInput): SessionTestSummary {
  const judge = input.judge ?? null;
  if (!judge) {
    return {
      attempted: false,
      compiled: null,
      visiblePassed: null,
      visibleTotal: null,
      hiddenPassed: null,
      hiddenTotal: null,
      allPassed: null,
      notes: input.testNotes.trim()
    };
  }
  const allPassed =
    judge.compiled &&
    judge.visiblePassed >= judge.visibleTotal &&
    judge.hiddenPassed >= judge.hiddenTotal &&
    judge.visibleTotal + judge.hiddenTotal > 0;
  return {
    attempted: true,
    compiled: judge.compiled,
    visiblePassed: judge.visiblePassed,
    visibleTotal: judge.visibleTotal,
    hiddenPassed: judge.hiddenPassed,
    hiddenTotal: judge.hiddenTotal,
    allPassed,
    notes: input.testNotes.trim()
  };
}

/**
 * Build the deterministic completed-session review. Pure — no FSRS, no I/O.
 */
export function summarizeSessionReview(input: SessionReviewInput): SessionReviewSummary {
  const seconds = SESSION_PHASES.map((phase) => ({ phase, seconds: clampSeconds(input.phaseElapsedSeconds[phase]) }));
  const totalPhaseSeconds = seconds.reduce((sum, entry) => sum + entry.seconds, 0);

  const timeline: SessionTimelineEntry[] = seconds.map(({ phase, seconds: phaseSeconds }) => ({
    phase,
    label: PHASE_LABEL[phase],
    seconds: phaseSeconds,
    share: totalPhaseSeconds > 0 ? phaseSeconds / totalPhaseSeconds : 0
  }));

  let busiestPhase: SessionPhase | null = null;
  let busiestSeconds = 0;
  for (const entry of seconds) {
    if (entry.seconds > busiestSeconds) {
      busiestSeconds = entry.seconds;
      busiestPhase = entry.phase;
    }
  }

  const budgetSeconds = Math.max(0, Math.trunc(input.durationMinutes * 60));
  const elapsedSeconds = clampSeconds(input.elapsedSeconds);

  return {
    timeline,
    totalPhaseSeconds,
    elapsedSeconds,
    budgetSeconds,
    withinBudget: budgetSeconds === 0 ? true : elapsedSeconds <= budgetSeconds,
    busiestPhase,
    testSummary: testSummaryFrom(input),
    codeRevisionCount: Math.max(0, Math.trunc(input.codeRevisionCount)),
    codeBytes: new TextEncoder().encode(input.codeDraft ?? "").length
  };
}
