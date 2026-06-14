// Adaptive interview-practice readiness + scheduling core (#180 / #174). Pure and
// deterministic so it can drive the plan UI and be tested exhaustively. Interview
// evidence is tracked SEPARATELY from FSRS. Readiness is reported per dimension
// (never one opaque number) and depends on recent INDEPENDENT transfer to unseen
// problems and completed mocks — not on problems-completed counts. Per-user
// evidence storage, the plan UI, and target-date workload limits are follow-ups.
import type { ProblemGroup } from "./problem-catalog";

export type InterviewContext = "diagnostic" | "guided" | "independent" | "mock";

export type InterviewEvidence = {
  pattern: ProblemGroup;
  problemId: string;
  /** True only for the learner's first exposure to this problem. */
  unseen: boolean;
  mode: "practice" | "interview";
  correct: boolean;
  hintsUsed: number;
  context: InterviewContext;
  completedAtMs: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export type ReadinessOptions = {
  now: number;
  windowDays?: number;
  requiredCorePatterns?: number;
};

const DEFAULTS = { windowDays: 21, requiredCorePatterns: 4 } as const;
const MIN_UNSEEN_INDEPENDENT = 2;
const MIN_MOCKS = 3;
const MIN_EVIDENCE_FOR_A_VERDICT = 3;
const QUALITY_THRESHOLD = 2.5; // 0-4 rubric scale (#179)

/** Independent, unhinted success on a first-seen problem in a real practice/mock context. */
export function isIndependentUnseenSuccess(e: InterviewEvidence): boolean {
  return e.unseen && e.correct && e.hintsUsed === 0 && (e.context === "independent" || e.context === "mock");
}

function withinWindow(e: InterviewEvidence, now: number, windowDays: number): boolean {
  return now - e.completedAtMs <= windowDays * DAY_MS;
}

function dayKey(ms: number): number {
  return Math.floor(ms / DAY_MS);
}

export type ReadinessDimension =
  | "core_pattern_coverage"
  | "unseen_problem_success"
  | "no_critical_weak_cluster"
  | "mock_sessions"
  | "quality_scores"
  | "not_single_session";

export type DimensionStatus = "met" | "unmet" | "not_enough_evidence";

export type ReadinessReport = {
  verdict: "ready" | "not_ready" | "not_enough_evidence";
  dimensions: Record<ReadinessDimension, DimensionStatus>;
  reasons: string[];
};

export type QualityAverages = {
  /** From the #179 rubric: 0-4 category averages, when available. */
  testing?: number;
  complexity?: number;
  communication?: number;
};

/**
 * Dimension-level readiness over a recent window. `ready` requires every gate;
 * `not_enough_evidence` is returned when there is too little recent evidence to
 * judge. Deterministic for identical inputs. Never reads/writes FSRS.
 */
export function computeReadiness(
  evidence: InterviewEvidence[],
  mocksCompleted: number,
  quality: QualityAverages,
  options: ReadinessOptions
): ReadinessReport {
  const windowDays = options.windowDays ?? DEFAULTS.windowDays;
  const requiredCorePatterns = options.requiredCorePatterns ?? DEFAULTS.requiredCorePatterns;
  const recent = evidence.filter((e) => withinWindow(e, options.now, windowDays));

  const dimensions = {} as Record<ReadinessDimension, DimensionStatus>;
  const reasons: string[] = [];

  // Core pattern coverage.
  const coveredPatterns = new Set(recent.map((e) => e.pattern));
  dimensions.core_pattern_coverage = coveredPatterns.size >= requiredCorePatterns ? "met" : "unmet";

  // Unseen-problem success (distinct problems, independent).
  const independent = recent.filter(isIndependentUnseenSuccess);
  const distinctUnseen = new Set(independent.map((e) => e.problemId));
  dimensions.unseen_problem_success = distinctUnseen.size >= MIN_UNSEEN_INDEPENDENT ? "met" : "unmet";

  // No critical weak cluster: a pattern whose every recent attempt failed.
  const byPattern = new Map<ProblemGroup, { total: number; correct: number }>();
  for (const e of recent) {
    const acc = byPattern.get(e.pattern) ?? { total: 0, correct: 0 };
    acc.total += 1;
    acc.correct += e.correct ? 1 : 0;
    byPattern.set(e.pattern, acc);
  }
  const hasWeakCluster = [...byPattern.values()].some((p) => p.total >= 2 && p.correct === 0);
  dimensions.no_critical_weak_cluster = hasWeakCluster ? "unmet" : "met";

  // Completed full mock sessions.
  dimensions.mock_sessions = mocksCompleted >= MIN_MOCKS ? "met" : "unmet";

  // Quality scores (testing/complexity/communication) — needs the rubric data.
  const provided = [quality.testing, quality.complexity, quality.communication].filter(
    (v): v is number => typeof v === "number"
  );
  if (provided.length < 3) {
    dimensions.quality_scores = "not_enough_evidence";
  } else {
    dimensions.quality_scores = provided.every((v) => v >= QUALITY_THRESHOLD) ? "met" : "unmet";
  }

  // Not dependent on a single session: independent successes span >= 2 days.
  const independentDays = new Set(independent.map((e) => dayKey(e.completedAtMs)));
  dimensions.not_single_session = independentDays.size >= 2 ? "met" : "unmet";

  // Verdict.
  if (recent.length < MIN_EVIDENCE_FOR_A_VERDICT && mocksCompleted < MIN_MOCKS) {
    reasons.push("Not enough recent interview evidence yet — complete more independent and mock practice.");
    return { verdict: "not_enough_evidence", dimensions, reasons };
  }

  const unmet = (Object.keys(dimensions) as ReadinessDimension[]).filter(
    (d) => dimensions[d] !== "met"
  );
  if (unmet.length === 0) {
    reasons.push("All readiness dimensions met within the recent window.");
    return { verdict: "ready", dimensions, reasons };
  }

  for (const d of unmet) {
    reasons.push(`${d.replaceAll("_", " ")}: ${dimensions[d]}`);
  }
  return { verdict: "not_ready", dimensions, reasons };
}

export type NextPattern = { pattern: ProblemGroup; reason: string };

/**
 * Deterministically pick the highest-leverage pattern to practice next:
 * patterns missing recent unseen-independent evidence come first, then weak
 * (recent failures), then stale (least-recent or never practiced). Interleaves
 * by avoiding the most recently practiced pattern when an alternative exists.
 */
export function selectNextPattern(
  evidence: InterviewEvidence[],
  candidatePatterns: ProblemGroup[],
  now: number
): NextPattern | null {
  if (candidatePatterns.length === 0) {
    return null;
  }

  const lastPracticed = [...evidence].sort((a, b) => b.completedAtMs - a.completedAtMs)[0]?.pattern;

  const scored = candidatePatterns.map((pattern) => {
    const forPattern = evidence.filter((e) => e.pattern === pattern);
    const hasUnseenSuccess = forPattern.some(isIndependentUnseenSuccess);
    const recentFailures = forPattern.filter((e) => !e.correct).length;
    const lastMs = forPattern.reduce((max, e) => Math.max(max, e.completedAtMs), 0);
    const staleness = now - lastMs; // larger = staler (never practiced => now - 0)
    return { pattern, hasUnseenSuccess, recentFailures, staleness };
  });

  scored.sort((a, b) => {
    // 1) missing unseen-independent evidence first
    if (a.hasUnseenSuccess !== b.hasUnseenSuccess) {
      return a.hasUnseenSuccess ? 1 : -1;
    }
    // 2) more recent failures (weaker) first
    if (a.recentFailures !== b.recentFailures) {
      return b.recentFailures - a.recentFailures;
    }
    // 3) staler first
    if (a.staleness !== b.staleness) {
      return b.staleness - a.staleness;
    }
    return a.pattern.localeCompare(b.pattern);
  });

  // Interleave: skip the just-practiced pattern if a different one ranks equally usable.
  const top = scored[0];
  const pick = top.pattern === lastPracticed && scored.length > 1 ? scored[1] : top;

  const reason = !pick.hasUnseenSuccess
    ? `No independent success on an unseen ${pick.pattern.replaceAll("_", " ")} problem yet — try a fresh one.`
    : pick.recentFailures > 0
      ? `Recent misses on ${pick.pattern.replaceAll("_", " ")} — targeted practice to recover.`
      : `${pick.pattern.replaceAll("_", " ")} is the stalest pattern — time to refresh it.`;

  return { pattern: pick.pattern, reason };
}
