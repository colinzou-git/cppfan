// Coding-interview rubric and session review (#179 / #174). Each dimension is
// scored SEPARATELY (0-4), feedback sources (self / peer / automated) stay
// distinct, and weak areas yield actionable remediation. Pure and deterministic
// so it can drive the post-session review UI and readiness reporting without
// touching FSRS state. Per-user persistence and the UI are follow-up slices.

export type RubricCategory = "problem_solving" | "implementation" | "communication" | "process";

export type RubricCriterionId =
  | "clarification"
  | "examples"
  | "baseline_reasoning"
  | "optimization"
  | "correctness"
  | "cpp_implementation"
  | "testing"
  | "complexity"
  | "communication"
  | "follow_up_adaptability"
  | "time_management"
  | "hint_dependence";

export type RubricCriterion = {
  id: RubricCriterionId;
  label: string;
  category: RubricCategory;
  /**
   * Higher is always better (0-4). For hint_dependence a high score means the
   * learner needed few hints; the rater applies that direction.
   */
  remediation: string;
};

export const RUBRIC_CRITERIA: RubricCriterion[] = [
  { id: "clarification", label: "Problem clarification", category: "problem_solving", remediation: "Start by restating the problem and asking about inputs, ranges, and edge cases before coding." },
  { id: "examples", label: "Worked examples", category: "problem_solving", remediation: "Walk a small concrete example (and a tricky one) before choosing an approach." },
  { id: "baseline_reasoning", label: "Baseline approach", category: "problem_solving", remediation: "State a correct brute-force baseline and its complexity before optimizing." },
  { id: "optimization", label: "Optimization", category: "problem_solving", remediation: "Name the bottleneck, then map it to a pattern (hashing, two-pointer, heap, etc.)." },
  { id: "correctness", label: "Implementation correctness", category: "implementation", remediation: "Trace your code on the example end-to-end; check off-by-one and empty-input paths." },
  { id: "cpp_implementation", label: "C++ implementation", category: "implementation", remediation: "Practice idiomatic STL containers/algorithms and watch ownership, iterator validity, and overflow." },
  { id: "testing", label: "Edge-case testing", category: "implementation", remediation: "Enumerate edge cases up front and test them, not just the happy path." },
  { id: "complexity", label: "Complexity analysis", category: "problem_solving", remediation: "State time and space complexity precisely, and justify it from the loops/data structures." },
  { id: "communication", label: "Communication", category: "communication", remediation: "Think aloud: narrate decisions and tradeoffs so an interviewer can follow your reasoning." },
  { id: "follow_up_adaptability", label: "Follow-up adaptability", category: "problem_solving", remediation: "Practice adapting a solution to a changed constraint (streaming, larger n, new requirement)." },
  { id: "time_management", label: "Time management", category: "process", remediation: "Budget time per phase; do not over-spend on clarification or polish before a working solution." },
  { id: "hint_dependence", label: "Hint independence", category: "process", remediation: "Re-attempt similar problems without hints to build independent recall." }
];

export type FeedbackSource = "self" | "peer" | "automated";

export type RubricScore = {
  criterion: RubricCriterionId;
  /** 0 (missing) to 4 (excellent). */
  score: number;
  source: FeedbackSource;
};

export type ScoreBand = "needs_work" | "developing" | "solid" | "strong";

export function scoreBand(score: number): ScoreBand {
  if (score >= 3.5) {
    return "strong";
  }
  if (score >= 2.5) {
    return "solid";
  }
  if (score >= 1.5) {
    return "developing";
  }
  return "needs_work";
}

export type CriterionSummary = {
  criterion: RubricCriterionId;
  label: string;
  category: RubricCategory;
  /** Scores grouped by source so self / peer / automated stay distinct. */
  bySource: Record<FeedbackSource, number[]>;
  /** Average across all provided scores, or null when none were given. */
  average: number | null;
  band: ScoreBand | null;
};

const criterionById = new Map(RUBRIC_CRITERIA.map((c) => [c.id, c]));

function emptyBySource(): Record<FeedbackSource, number[]> {
  return { self: [], peer: [], automated: [] };
}

/** Per-criterion summary, one entry per rubric criterion, scores kept by source. */
export function summarizeRubric(scores: RubricScore[]): CriterionSummary[] {
  return RUBRIC_CRITERIA.map((criterion) => {
    const bySource = emptyBySource();
    const all: number[] = [];
    for (const s of scores) {
      if (s.criterion === criterion.id) {
        const clamped = Math.min(4, Math.max(0, s.score));
        bySource[s.source].push(clamped);
        all.push(clamped);
      }
    }
    const average = all.length > 0 ? all.reduce((a, b) => a + b, 0) / all.length : null;
    return {
      criterion: criterion.id,
      label: criterion.label,
      category: criterion.category,
      bySource,
      average,
      band: average === null ? null : scoreBand(average)
    };
  });
}

const WEAK_THRESHOLD = 2;

export type RemediationItem = { criterion: RubricCriterionId; label: string; average: number; advice: string };

/** Weak criteria (scored, average below threshold) with actionable remediation. */
export function remediationFromSummaries(summaries: CriterionSummary[]): RemediationItem[] {
  return summaries
    .filter((s): s is CriterionSummary & { average: number } => s.average !== null && s.average < WEAK_THRESHOLD)
    .sort((a, b) => a.average - b.average || a.criterion.localeCompare(b.criterion))
    .map((s) => ({
      criterion: s.criterion,
      label: s.label,
      average: s.average,
      advice: criterionById.get(s.criterion)?.remediation ?? ""
    }));
}

export type SessionReview = {
  summaries: CriterionSummary[];
  /** Average per category so coding vs communication stay separable. */
  categoryAverages: Partial<Record<RubricCategory, number>>;
  remediation: RemediationItem[];
};

/**
 * Build a deterministic post-session review from rubric scores. Each dimension is
 * reported separately, category averages are computed for readiness reporting,
 * and weak areas carry remediation. Pure — never reads or writes FSRS state.
 */
export function reviewSession(scores: RubricScore[]): SessionReview {
  const summaries = summarizeRubric(scores);

  const categoryTotals = new Map<RubricCategory, { sum: number; count: number }>();
  for (const summary of summaries) {
    if (summary.average === null) {
      continue;
    }
    const acc = categoryTotals.get(summary.category) ?? { sum: 0, count: 0 };
    acc.sum += summary.average;
    acc.count += 1;
    categoryTotals.set(summary.category, acc);
  }

  const categoryAverages: Partial<Record<RubricCategory, number>> = {};
  for (const [category, { sum, count }] of categoryTotals) {
    categoryAverages[category] = sum / count;
  }

  return { summaries, categoryAverages, remediation: remediationFromSummaries(summaries) };
}
