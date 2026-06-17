// Diagnostic baseline vs current comparison for the readiness report (#175/#182).
// Pure and deterministic: pairs the learner's persisted baseline diagnostic score
// per area (diagnostic_scores) with a CURRENT signal derived from recent
// interview_evidence — the correct rate on problems in that area's pattern group.
// Shows the per-area trend (never one opaque number). Never touches FSRS.
import { classifyArea, diagnosticSections, type AreaLevel } from "./diagnostic";
import type { InterviewEvidence } from "./readiness";
import type { ProblemGroup } from "./problem-catalog";

export type AreaTrend = "improved" | "declined" | "steady" | "unknown";

export type AreaComparison = {
  sectionId: string;
  title: string;
  group: ProblemGroup;
  baselineScore: number | null;
  baselineLevel: AreaLevel | null;
  currentScore: number | null;
  currentLevel: AreaLevel | null;
  /** current - baseline, when both are known. */
  delta: number | null;
  trend: AreaTrend;
};

// Below this absolute delta the areas count as unchanged.
const STEADY_BAND = 0.1;

function currentScoreForGroup(evidence: InterviewEvidence[], group: ProblemGroup): number | null {
  const inGroup = evidence.filter((e) => e.pattern === group);
  if (inGroup.length === 0) {
    return null;
  }
  const correct = inGroup.filter((e) => e.correct).length;
  return correct / inGroup.length;
}

/**
 * Compare the baseline diagnostic scores to current per-area performance derived
 * from recent evidence. One entry per diagnostic section, stable order. Deterministic.
 */
export function compareBaselineToCurrent(
  baselineScores: Record<string, number>,
  evidence: InterviewEvidence[]
): AreaComparison[] {
  return diagnosticSections.map((section) => {
    const rawBaseline = baselineScores[section.id];
    const baselineScore = typeof rawBaseline === "number" ? Math.min(1, Math.max(0, rawBaseline)) : null;
    const currentScore = currentScoreForGroup(evidence, section.group);

    let delta: number | null = null;
    let trend: AreaTrend = "unknown";
    if (baselineScore !== null && currentScore !== null) {
      delta = currentScore - baselineScore;
      trend = delta > STEADY_BAND ? "improved" : delta < -STEADY_BAND ? "declined" : "steady";
    }

    return {
      sectionId: section.id,
      title: section.title,
      group: section.group,
      baselineScore,
      baselineLevel: baselineScore === null ? null : classifyArea(baselineScore),
      currentScore,
      currentLevel: currentScore === null ? null : classifyArea(currentScore),
      delta,
      trend
    };
  });
}

/** True when at least one area has both a baseline and a current score to compare. */
export function hasComparableArea(comparisons: AreaComparison[]): boolean {
  return comparisons.some((c) => c.trend !== "unknown");
}
