// Reported readiness facets (#180). The issue's readiness model lists more
// dimensions than the six that GATE the `ready` verdict (computeReadiness). These
// extra, skill-level facets — implementation correctness, C++ fluency, testing,
// complexity, communication, time management, follow-up adaptability — are
// reported for transparency, sourced from the #179 self-rubric. Pure and
// deterministic; informational only (they do NOT change the ready gate) and never
// touch FSRS.
import { scoreBand, type RubricCriterionId, type RubricScore, type ScoreBand } from "./rubric";

export type ReadinessFacetId =
  | "implementation_correctness"
  | "cpp_fluency"
  | "testing_discipline"
  | "complexity_reasoning"
  | "communication"
  | "time_management"
  | "follow_up_adaptability";

// Each facet is sourced from a single #179 rubric criterion.
const FACET_CRITERION: Record<ReadinessFacetId, RubricCriterionId> = {
  implementation_correctness: "correctness",
  cpp_fluency: "cpp_implementation",
  testing_discipline: "testing",
  complexity_reasoning: "complexity",
  communication: "communication",
  time_management: "time_management",
  follow_up_adaptability: "follow_up_adaptability"
};

export const READINESS_FACET_LABEL: Record<ReadinessFacetId, string> = {
  implementation_correctness: "Implementation correctness",
  cpp_fluency: "C++ fluency",
  testing_discipline: "Testing discipline",
  complexity_reasoning: "Complexity reasoning",
  communication: "Communication",
  time_management: "Time management",
  follow_up_adaptability: "Follow-up adaptability"
};

export const READINESS_FACET_IDS = Object.keys(FACET_CRITERION) as ReadinessFacetId[];

export type ReadinessFacet = {
  id: ReadinessFacetId;
  label: string;
  /** Self score 0-4, or null when not yet rated (no invented evidence). */
  score: number | null;
  band: ScoreBand | null;
};

/** Map the learner's self-rubric scores to the reported readiness facets. Pure. */
export function readinessFacets(scores: RubricScore[]): ReadinessFacet[] {
  return READINESS_FACET_IDS.map((id) => {
    const criterion = FACET_CRITERION[id];
    const match = scores.find((s) => s.source === "self" && s.criterion === criterion);
    const score = match ? match.score : null;
    return {
      id,
      label: READINESS_FACET_LABEL[id],
      score,
      band: score === null ? null : scoreBand(score)
    };
  });
}
