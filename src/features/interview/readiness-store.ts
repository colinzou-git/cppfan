// Server-only inputs for the interview readiness report (#180). Surfaces the pure
// readiness model (readiness.ts / readiness-report.ts) over the learner's REAL
// persisted evidence. Today that is the #179 self-rubric quality (testing,
// complexity, communication); per-user transfer/mock evidence capture is a
// follow-up slice, so evidence is reported honestly as empty (which the model
// renders as an explicit not-enough-evidence state — never fabricated). The pure
// quality mapper is exported for unit tests.
import { getSelfRubricScores } from "./rubric-store";
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

export type ReadinessInputs = {
  evidence: InterviewEvidence[];
  mocksCompleted: number;
  quality: QualityAverages;
};

/**
 * Gather the signed-in learner's readiness inputs from persisted data. Quality
 * comes from the #179 self-rubric. Transfer/mock evidence is not yet captured
 * per-user (follow-up slice), so it is reported as empty rather than invented.
 */
export async function getReadinessInputs(): Promise<ReadinessInputs> {
  const rubric = await getSelfRubricScores();
  return {
    evidence: [],
    mocksCompleted: 0,
    quality: qualityFromSelfScores(rubric)
  };
}
