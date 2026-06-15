// Target-date interview study plan (#180 / #174). Pure and deterministic so it can
// drive the plan UI and be tested exhaustively. Builds a 4/6/8-week plan from the
// dimension-level readiness report + recent evidence: the next highest-leverage
// task (with session type, bounded daily time, and a learner-friendly reason), a
// per-week focus, and a target-date risk indicator. Reuses the #180 readiness gate
// and selectNextPattern; never reads or writes FSRS. Separates practice volume
// from readiness evidence — the plan optimizes recovery and transfer, not counts.
import { selectNextPattern, type ReadinessDimension, type ReadinessReport, type InterviewEvidence } from "./readiness";
import type { ProblemGroup } from "./problem-catalog";

export type PlanHorizonWeeks = 4 | 6 | 8;
export const PLAN_HORIZONS: PlanHorizonWeeks[] = [4, 6, 8];

export type SessionType = "remediation" | "independent_timed" | "mock_interview" | "maintenance";

export type PlanRisk = "on_track" | "tight" | "at_risk" | "not_enough_evidence";

export type PlanTask = {
  sessionType: SessionType;
  pattern: ProblemGroup | null;
  estimatedMinutes: number;
  reason: string;
  /** How to spend the session — routes conceptual gaps to review, timing to timed reps. */
  guidance: string;
};

export type WeeklyFocus = { week: number; sessionType: SessionType; focus: string };

export type StudyPlan = {
  horizonWeeks: PlanHorizonWeeks;
  dailyMinutes: number;
  risk: PlanRisk;
  riskReason: string;
  weakestDimensions: ReadinessDimension[];
  /** The single highest-leverage task to do next. */
  nextTask: PlanTask;
  weeklyFocus: WeeklyFocus[];
};

const SESSION_BUDGET: Record<SessionType, number> = {
  remediation: 30,
  independent_timed: 45,
  mock_interview: 60,
  maintenance: 20
};

const SESSION_GUIDANCE: Record<SessionType, string> = {
  remediation: "Review the pattern's core idea and a worked example first, then drill a guided problem.",
  independent_timed: "Work a fresh, unseen problem under time with no hints — the strongest readiness signal.",
  mock_interview: "Run a full timed mock end-to-end: clarify, plan, implement, test, and analyze complexity.",
  maintenance: "A light spaced rep on a strong pattern to stay warm — keep it short."
};

const DIMENSION_LABEL: Record<ReadinessDimension, string> = {
  core_pattern_coverage: "core pattern coverage",
  unseen_problem_success: "unseen-problem success",
  no_critical_weak_cluster: "a critical weak cluster",
  mock_sessions: "completed mock sessions",
  quality_scores: "testing/complexity/communication quality",
  not_single_session: "consistency across sessions"
};

// Rough effort (in weeks) to close each gap; used only for the risk indicator.
const GAP_WEEKS: Record<ReadinessDimension, number> = {
  no_critical_weak_cluster: 2,
  core_pattern_coverage: 2,
  unseen_problem_success: 2,
  mock_sessions: 1,
  quality_scores: 1,
  not_single_session: 1
};

// Highest-leverage gap first: recover failing clusters, then cover, then transfer,
// then mocks, then quality, then consistency.
const PRIORITY: ReadinessDimension[] = [
  "no_critical_weak_cluster",
  "core_pattern_coverage",
  "unseen_problem_success",
  "mock_sessions",
  "quality_scores",
  "not_single_session"
];

const SESSION_FOR_DIMENSION: Record<ReadinessDimension, SessionType> = {
  no_critical_weak_cluster: "remediation",
  core_pattern_coverage: "independent_timed",
  unseen_problem_success: "independent_timed",
  mock_sessions: "mock_interview",
  quality_scores: "remediation",
  not_single_session: "independent_timed"
};

function unmetByPriority(report: ReadinessReport): ReadinessDimension[] {
  return PRIORITY.filter((d) => report.dimensions[d] === "unmet");
}

function clampMinutes(sessionType: SessionType, dailyMinutes: number): number {
  return Math.max(10, Math.min(SESSION_BUDGET[sessionType], dailyMinutes));
}

function computeRisk(report: ReadinessReport, horizonWeeks: PlanHorizonWeeks): { risk: PlanRisk; reason: string } {
  if (report.verdict === "not_enough_evidence") {
    return {
      risk: "not_enough_evidence",
      reason: "Not enough recent evidence to assess your target-date risk yet — log a few independent and mock outcomes."
    };
  }
  if (report.verdict === "ready") {
    return { risk: "on_track", reason: "All readiness dimensions are met — keep them warm with maintenance." };
  }
  const weeksNeeded = unmetByPriority(report).reduce((sum, d) => sum + GAP_WEEKS[d], 0);
  if (weeksNeeded <= horizonWeeks) {
    return { risk: "on_track", reason: `About ${weeksNeeded} focused weeks of work fits comfortably in ${horizonWeeks} weeks.` };
  }
  if (weeksNeeded <= horizonWeeks + 2) {
    return { risk: "tight", reason: `About ${weeksNeeded} focused weeks of work is tight for a ${horizonWeeks}-week target — protect your daily time.` };
  }
  return {
    risk: "at_risk",
    reason: `About ${weeksNeeded} focused weeks of work exceeds a ${horizonWeeks}-week target — extend the date or raise daily time.`
  };
}

/** Build a per-week focus: remediation/coverage early, transfer in the middle, mocks late. */
function buildWeeklyFocus(unmet: ReadinessDimension[], horizonWeeks: PlanHorizonWeeks): WeeklyFocus[] {
  const weeks: WeeklyFocus[] = [];
  for (let week = 1; week <= horizonWeeks; week += 1) {
    const fraction = week / horizonWeeks;
    let sessionType: SessionType;
    let focus: string;
    if (fraction <= 1 / 3) {
      sessionType = unmet.includes("no_critical_weak_cluster") || unmet.includes("core_pattern_coverage")
        ? "remediation"
        : "independent_timed";
      focus = "Shore up weak and missing patterns with guided review and reps.";
    } else if (fraction <= 2 / 3) {
      sessionType = "independent_timed";
      focus = "Build independent transfer: fresh, unseen problems under time.";
    } else {
      sessionType = "mock_interview";
      focus = "Simulate the real thing: full timed mocks, then maintenance on strengths.";
    }
    weeks.push({ week, sessionType, focus });
  }
  return weeks;
}

/**
 * Build a deterministic target-date study plan. The next task targets the
 * highest-leverage readiness gap (routed to the right session type and pattern,
 * with a learner-friendly reason); the weekly focus sequences remediation ->
 * transfer -> mocks; and the risk indicator compares the work remaining to the
 * chosen horizon. Returns a not_enough_evidence plan when the readiness model
 * cannot judge yet. Deterministic for identical inputs.
 */
export function buildStudyPlan(
  report: ReadinessReport,
  evidence: InterviewEvidence[],
  candidatePatterns: ProblemGroup[],
  horizonWeeks: PlanHorizonWeeks,
  dailyMinutes: number,
  now: number
): StudyPlan {
  const { risk, reason: riskReason } = computeRisk(report, horizonWeeks);
  const unmet = unmetByPriority(report);
  const next = selectNextPattern(evidence, candidatePatterns, now);

  let nextTask: PlanTask;
  if (report.verdict === "not_enough_evidence") {
    const sessionType: SessionType = "independent_timed";
    nextTask = {
      sessionType,
      pattern: next?.pattern ?? null,
      estimatedMinutes: clampMinutes(sessionType, dailyMinutes),
      reason: "Start building evidence: work a fresh problem independently and log the outcome.",
      guidance: SESSION_GUIDANCE[sessionType]
    };
  } else if (unmet.length === 0) {
    const sessionType: SessionType = "maintenance";
    nextTask = {
      sessionType,
      pattern: next?.pattern ?? null,
      estimatedMinutes: clampMinutes(sessionType, dailyMinutes),
      reason: "You meet every readiness dimension — keep patterns warm with light spaced practice.",
      guidance: SESSION_GUIDANCE[sessionType]
    };
  } else {
    const topGap = unmet[0];
    const sessionType = SESSION_FOR_DIMENSION[topGap];
    const usePattern = sessionType !== "mock_interview";
    const patternReason = usePattern && next ? ` Focus pattern: ${next.reason}` : "";
    nextTask = {
      sessionType,
      pattern: usePattern ? next?.pattern ?? null : null,
      estimatedMinutes: clampMinutes(sessionType, dailyMinutes),
      reason: `Your biggest gap is ${DIMENSION_LABEL[topGap]}.${patternReason}`,
      guidance: SESSION_GUIDANCE[sessionType]
    };
  }

  return {
    horizonWeeks,
    dailyMinutes,
    risk,
    riskReason,
    weakestDimensions: unmet,
    nextTask,
    weeklyFocus: buildWeeklyFocus(unmet, horizonWeeks)
  };
}
