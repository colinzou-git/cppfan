// Server-only: assemble the interview progress view (#180). Pure aggregation lives
// in interview-progress.ts; this gathers a longer evidence window for the weekly
// buckets and runs the readiness gate (standard window) for the current weakest
// dimensions, then delegates.
import { computeReadiness, type ReadinessDimension, type ReadinessReport } from "./readiness";
import { getReadinessInputs } from "./readiness-store";
import { getRecentInterviewEvidence } from "./interview-evidence-store";
import { summarizeProgress, type ProgressSummary } from "./interview-progress";

const DEFAULT_WEEKS = 8;

// Display order, weakest-leverage first (mirrors the planner's priorities).
const DIMENSION_ORDER: ReadinessDimension[] = [
  "no_critical_weak_cluster",
  "core_pattern_coverage",
  "unseen_problem_success",
  "mock_sessions",
  "quality_scores",
  "not_single_session"
];

/** Dimensions not yet met, in weakest-leverage order. */
export function weakestDimensions(report: ReadinessReport): ReadinessDimension[] {
  return DIMENSION_ORDER.filter((d) => report.dimensions[d] !== "met");
}

export type ProgressView = {
  weeks: number;
  summary: ProgressSummary;
  verdict: ReadinessReport["verdict"];
  weakest: ReadinessDimension[];
};

/** Build the signed-in learner's weekly progress + current weakest dimensions. */
export async function getProgressView(now: number = Date.now(), weeks: number = DEFAULT_WEEKS): Promise<ProgressView> {
  const [inputs, longEvidence] = await Promise.all([
    getReadinessInputs(now),
    getRecentInterviewEvidence(now, weeks * 7)
  ]);
  const report = computeReadiness(inputs.evidence, inputs.mocksCompleted, inputs.quality, { now });
  return {
    weeks,
    summary: summarizeProgress(longEvidence, now, weeks),
    verdict: report.verdict,
    weakest: weakestDimensions(report)
  };
}
