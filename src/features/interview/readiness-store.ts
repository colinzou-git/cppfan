// Server-only inputs for the interview readiness report (#180). Surfaces the pure
// readiness model (readiness.ts / readiness-report.ts) over the learner's REAL
// persisted evidence: recent self-reported interview outcomes (interview_evidence)
// plus the #179 self-rubric quality (testing, complexity, communication). Mock
// sessions are counted as distinct days carrying mock-context evidence — a
// conservative proxy that never over-counts a single session's problems. The pure
// mappers are exported for unit tests.
import { getAllRubricScores, getSelfRubricScores } from "./rubric-store";
import { getRecentInterviewEvidence, getRecentTimingSamples } from "./interview-evidence-store";
import { readinessFacets, type ReadinessFacet } from "./readiness-facets";
import { summarizeTiming, type TimingSummary } from "./interview-timing";
import { summarizeAssistance, type AssistanceSummary } from "./interview-assistance";
import { getDiagnosticScores } from "./diagnostic-store";
import { compareBaselineToCurrent, type AreaComparison } from "./interview-baseline";
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

// Trust order for source-separated rubric evidence: server-verified automated
// evidence (#178 judge/session) outweighs a peer interviewer's score, which in
// turn outweighs the learner's self-assessment. Readiness uses the most-trusted
// score available per dimension so passing code with thin testing or silent
// communication cannot be self-reported into readiness.
const SOURCE_PRIORITY: RubricScore["source"][] = ["automated", "peer", "self"];

/** Most-trusted available score for one criterion, or undefined when unrated. Pure. */
export function preferredScoreForCriterion(
  scores: RubricScore[],
  criterion: RubricScore["criterion"]
): number | undefined {
  for (const source of SOURCE_PRIORITY) {
    const match = scores.find((s) => s.source === source && s.criterion === criterion);
    if (match) {
      return Math.min(4, Math.max(0, match.score));
    }
  }
  return undefined;
}

/**
 * Map source-separated rubric scores to readiness quality averages, preferring
 * trusted automated/peer evidence over self per dimension (#179). Pure.
 */
export function qualityFromScores(scores: RubricScore[]): QualityAverages {
  const quality: QualityAverages = {};
  const testing = preferredScoreForCriterion(scores, "testing");
  const complexity = preferredScoreForCriterion(scores, "complexity");
  const communication = preferredScoreForCriterion(scores, "communication");
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
  const [rubric, evidence] = await Promise.all([getAllRubricScores(), getRecentInterviewEvidence(now)]);
  return {
    evidence,
    mocksCompleted: mocksCompletedFromEvidence(evidence),
    quality: qualityFromScores(rubric)
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

/** Per-area baseline-diagnostic vs current-performance comparison (#175/#182). */
export async function getBaselineComparison(now: number = Date.now()): Promise<AreaComparison[]> {
  const [baseline, evidence] = await Promise.all([getDiagnosticScores(), getRecentInterviewEvidence(now)]);
  return compareBaselineToCurrent(baseline, evidence);
}
