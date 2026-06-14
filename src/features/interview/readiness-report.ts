// Final readiness report (#182 / #174). Pure, transparent, evidence-based, and
// role-targeted: it maps the #180 readiness verdict + #179 rubric quality into a
// learner-facing status with strongest/weakest patterns and evidence-age
// warnings. It never claims to guarantee hiring or predict a Google decision, and
// stays separate from FSRS. Per-user storage and the report UI are follow-ups.
import {
  computeReadiness,
  type InterviewEvidence,
  type QualityAverages,
  type ReadinessOptions,
  type ReadinessReport
} from "./readiness";
import type { ProblemGroup } from "./problem-catalog";

export type ReadinessStatus =
  | "not_assessed"
  | "refreshing_fundamentals"
  | "independent_but_inconsistent"
  | "mock_ready"
  | "interview_ready";

/** Map a dimension-level readiness report to a learner-facing status. Deterministic. */
export function readinessStatus(report: ReadinessReport): ReadinessStatus {
  if (report.verdict === "not_enough_evidence") {
    return "not_assessed";
  }
  if (report.verdict === "ready") {
    return "interview_ready";
  }
  const d = report.dimensions;
  if (d.core_pattern_coverage !== "met" || d.no_critical_weak_cluster !== "met") {
    return "refreshing_fundamentals";
  }
  if (d.unseen_problem_success === "met" && d.mock_sessions === "met") {
    return "mock_ready";
  }
  if (d.unseen_problem_success === "met") {
    return "independent_but_inconsistent";
  }
  return "refreshing_fundamentals";
}

export type PatternStanding = { pattern: ProblemGroup; attempts: number; correctRate: number };

function patternStandings(evidence: InterviewEvidence[]): PatternStanding[] {
  const byPattern = new Map<ProblemGroup, { total: number; correct: number }>();
  for (const e of evidence) {
    const acc = byPattern.get(e.pattern) ?? { total: 0, correct: 0 };
    acc.total += 1;
    acc.correct += e.correct ? 1 : 0;
    byPattern.set(e.pattern, acc);
  }
  return [...byPattern.entries()]
    .map(([pattern, { total, correct }]) => ({ pattern, attempts: total, correctRate: correct / total }))
    .sort((a, b) => b.correctRate - a.correctRate || a.pattern.localeCompare(b.pattern));
}

const STALE_WINDOW_DAYS = 21;
const DAY_MS = 24 * 60 * 60 * 1000;

export type ReadinessReportView = {
  status: ReadinessStatus;
  verdict: ReadinessReport["verdict"];
  dimensions: ReadinessReport["dimensions"];
  strongestPatterns: PatternStanding[];
  weakestPatterns: PatternStanding[];
  evidenceStale: boolean;
  reasons: string[];
  /** Honest disclaimer — cppFan does not guarantee or predict a hiring outcome. */
  disclaimer: string;
};

const DISCLAIMER =
  "This reflects your recent practice evidence only. It is not an endorsement by Google and does not predict any hiring decision.";

/**
 * Build the transparent readiness report from interview evidence, completed mock
 * count, and #179 rubric quality. Reuses the #180 readiness gate (so
 * `interview_ready` requires recent independent transfer + >=3 mocks, etc.).
 */
export function buildReadinessReport(
  evidence: InterviewEvidence[],
  mocksCompleted: number,
  quality: QualityAverages,
  options: ReadinessOptions
): ReadinessReportView {
  const report = computeReadiness(evidence, mocksCompleted, quality, options);
  const standings = patternStandings(evidence);
  const windowDays = options.windowDays ?? STALE_WINDOW_DAYS;
  const hasRecent = evidence.some((e) => options.now - e.completedAtMs <= windowDays * DAY_MS);

  return {
    status: readinessStatus(report),
    verdict: report.verdict,
    dimensions: report.dimensions,
    strongestPatterns: standings.slice(0, 3),
    weakestPatterns: [...standings].reverse().slice(0, 3),
    evidenceStale: evidence.length > 0 && !hasRecent,
    reasons: report.reasons,
    disclaimer: DISCLAIMER
  };
}
