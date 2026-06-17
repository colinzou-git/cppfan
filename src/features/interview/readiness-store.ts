// Server-only inputs for the interview readiness report (#180). Surfaces the pure
// readiness model (readiness.ts / readiness-report.ts) over the learner's REAL
// persisted evidence: recent self-reported interview outcomes (interview_evidence)
// plus the #179 self-rubric quality (testing, complexity, communication). Mock
// sessions are counted as distinct days carrying mock-context evidence — a
// conservative proxy that never over-counts a single session's problems. The pure
// mappers are exported for unit tests.
import { getSelfRubricScores } from "./rubric-store";
import { getRecentInterviewEvidence, getRecentTimingSamples } from "./interview-evidence-store";
import { readinessFacets, type ReadinessFacet } from "./readiness-facets";
import { summarizeTiming, type TimingSummary } from "./interview-timing";
import { summarizeAssistance, type AssistanceSummary } from "./interview-assistance";
import type { RubricScore } from "./rubric";
import type { InterviewEvidence, QualityAverages } from "./readiness";

/** Map the learner's self-rubric scores to the readiness quality averages. Pure. */
export function qualityFromSelfScores(scores: RubricScore[]): QualityAverages {
  const self = (criterion: RubricScore["criterion"]): number | undefined => {
    const match = scores.find((s) => s.source === "self" && s.criterion === criterion);
    return match ? match.score : undefined;
  };
  const quality: QualityAverages = {};
  const testing = self("testing");
  const complexity = self("complexity");
  const communication = self("communication");
  if (testing !== undefined) {
    quality.testing = testing;
  }
  if (complexity !== undefined) {
    quality.complexity = complexity;
  }
  if (communication !== undefined) {
    quality.communication = communication;
  }
  return quality;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Distinct days carrying mock-context evidence — a per-session proxy that never
 * over-counts the several problems worked within one mock. Pure. */
export function mocksCompletedFromEvidence(evidence: InterviewEvidence[]): number {
  const days = new Set<number>();
  for (const e of evidence) {
    if (e.context === "mock") {
      days.add(Math.floor(e.completedAtMs / DAY_MS));
    }
  }
  return days.size;
}

export type ReadinessInputs = {
  evidence: InterviewEvidence[];
  mocksCompleted: number;
  quality: QualityAverages;
};

/**
 * Gather the signed-in learner's readiness inputs from persisted data: recent
 * interview evidence (bounded query), a conservative mock-session count, and the
 * #179 self-rubric quality. Empty/zero when signed out or no evidence yet, which
 * the model renders as an explicit not-enough-evidence state (never invented).
 */
export async function getReadinessInputs(now: number = Date.now()): Promise<ReadinessInputs> {
  const [rubric, evidence] = await Promise.all([getSelfRubricScores(), getRecentInterviewEvidence(now)]);
  return {
    evidence,
    mocksCompleted: mocksCompletedFromEvidence(evidence),
    quality: qualityFromSelfScores(rubric)
  };
}

/** The reported skill-level readiness facets from the learner's self-rubric (#180). */
export async function getReadinessFacets(): Promise<ReadinessFacet[]> {
  return readinessFacets(await getSelfRubricScores());
}

/** The learner's recent approach/implementation timing breakdown (#182). */
export async function getReadinessTiming(now: number = Date.now()): Promise<TimingSummary> {
  return summarizeTiming(await getRecentTimingSamples(now));
}

/** The learner's recent assistance (hint) dependence (#182). */
export async function getReadinessAssistance(now: number = Date.now()): Promise<AssistanceSummary> {
  return summarizeAssistance(await getRecentInterviewEvidence(now));
}
