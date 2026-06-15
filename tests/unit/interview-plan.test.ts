import { describe, expect, it } from "vitest";
import { buildStudyPlan } from "@/features/interview/interview-plan";
import type { InterviewEvidence, ReadinessDimension, ReadinessReport } from "@/features/interview/readiness";
import type { ProblemGroup } from "@/features/interview/problem-catalog";

const PATTERNS: ProblemGroup[] = ["arrays_hashing_prefix", "binary_search", "graphs_paths", "dp_backtracking"];
const NOW = 1_800_000_000_000;

function report(
  verdict: ReadinessReport["verdict"],
  overrides: Partial<Record<ReadinessDimension, ReadinessReport["dimensions"][ReadinessDimension]>> = {}
): ReadinessReport {
  const dimensions: ReadinessReport["dimensions"] = {
    core_pattern_coverage: "met",
    unseen_problem_success: "met",
    no_critical_weak_cluster: "met",
    mock_sessions: "met",
    quality_scores: "met",
    not_single_session: "met",
    ...overrides
  };
  return { verdict, dimensions, reasons: [] };
}

const someEvidence: InterviewEvidence[] = [
  { pattern: "arrays_hashing_prefix", problemId: "a", unseen: true, mode: "interview", correct: false, hintsUsed: 1, context: "independent", completedAtMs: NOW - 1000 }
];

describe("buildStudyPlan (#180)", () => {
  it("returns a not_enough_evidence plan that still proposes a first evidence-building task", () => {
    const plan = buildStudyPlan(report("not_enough_evidence"), [], PATTERNS, 6, 45, NOW);
    expect(plan.risk).toBe("not_enough_evidence");
    expect(plan.nextTask.sessionType).toBe("independent_timed");
    expect(plan.nextTask.reason).toMatch(/build/i);
  });

  it("routes the top gap to the right session type (weak cluster -> remediation)", () => {
    const plan = buildStudyPlan(
      report("not_ready", { no_critical_weak_cluster: "unmet", core_pattern_coverage: "unmet" }),
      someEvidence,
      PATTERNS,
      6,
      45,
      NOW
    );
    expect(plan.nextTask.sessionType).toBe("remediation");
    expect(plan.weakestDimensions[0]).toBe("no_critical_weak_cluster");
    expect(plan.nextTask.reason).toMatch(/critical weak cluster/i);
  });

  it("routes a mock-sessions gap to a full mock with no fixed pattern", () => {
    const plan = buildStudyPlan(report("not_ready", { mock_sessions: "unmet" }), someEvidence, PATTERNS, 6, 90, NOW);
    expect(plan.nextTask.sessionType).toBe("mock_interview");
    expect(plan.nextTask.pattern).toBeNull();
    expect(plan.nextTask.estimatedMinutes).toBe(60); // capped by the mock session budget
  });

  it("schedules maintenance when every dimension is met", () => {
    const plan = buildStudyPlan(report("ready"), someEvidence, PATTERNS, 4, 45, NOW);
    expect(plan.nextTask.sessionType).toBe("maintenance");
    expect(plan.risk).toBe("on_track");
    expect(plan.weakestDimensions).toEqual([]);
  });

  it("bounds the estimated minutes by the daily-time budget", () => {
    const plan = buildStudyPlan(report("not_ready", { unseen_problem_success: "unmet" }), someEvidence, PATTERNS, 6, 20, NOW);
    expect(plan.nextTask.estimatedMinutes).toBe(20); // daily budget below the session budget
  });

  it("escalates target-date risk as the horizon shrinks against the same gaps", () => {
    const gaps = report("not_ready", {
      no_critical_weak_cluster: "unmet",
      core_pattern_coverage: "unmet",
      unseen_problem_success: "unmet"
    });
    expect(buildStudyPlan(gaps, someEvidence, PATTERNS, 8, 45, NOW).risk).toBe("on_track");
    expect(buildStudyPlan(gaps, someEvidence, PATTERNS, 4, 45, NOW).risk).toBe("tight");
  });

  it("emits one weekly-focus entry per horizon week, ending on mocks", () => {
    const plan = buildStudyPlan(report("not_ready", { unseen_problem_success: "unmet" }), someEvidence, PATTERNS, 8, 45, NOW);
    expect(plan.weeklyFocus).toHaveLength(8);
    expect(plan.weeklyFocus[0].week).toBe(1);
    expect(plan.weeklyFocus[7].sessionType).toBe("mock_interview");
  });

  it("is deterministic for identical inputs", () => {
    const args = [report("not_ready", { unseen_problem_success: "unmet" }), someEvidence, PATTERNS, 6, 45, NOW] as const;
    expect(buildStudyPlan(...args)).toEqual(buildStudyPlan(...args));
  });

  it("caps today's planned minutes at the daily budget and never exceeds it", () => {
    const gaps = report("not_ready", { no_critical_weak_cluster: "unmet", core_pattern_coverage: "unmet" });
    // Generous budget leaves room for a second task.
    const big = buildStudyPlan(gaps, someEvidence, PATTERNS, 6, 120, NOW);
    expect(big.todayTasks.length).toBeGreaterThan(1);
    expect(big.todayTasks[0]).toEqual(big.nextTask);
    expect(big.plannedMinutes).toBe(big.todayTasks.reduce((s, t) => s + t.estimatedMinutes, 0));
    expect(big.plannedMinutes).toBeLessThanOrEqual(120);
  });

  it("fits a single task when the daily budget is too small for a second", () => {
    const gaps = report("not_ready", { no_critical_weak_cluster: "unmet", core_pattern_coverage: "unmet" });
    const small = buildStudyPlan(gaps, someEvidence, PATTERNS, 6, 25, NOW);
    expect(small.todayTasks).toHaveLength(1);
    expect(small.plannedMinutes).toBeLessThanOrEqual(25);
  });

  it("does not stack a second task when not enough evidence or fully ready", () => {
    expect(buildStudyPlan(report("not_enough_evidence"), [], PATTERNS, 6, 120, NOW).todayTasks).toHaveLength(1);
    expect(buildStudyPlan(report("ready"), someEvidence, PATTERNS, 6, 120, NOW).todayTasks).toHaveLength(1);
  });
});
