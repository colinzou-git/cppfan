// Google Staff Systems coding-refresh diagnostic (#175 / #174). A short,
// execution-focused diagnostic assembled from EXISTING items and the #176
// interview catalog, plus pure deterministic scoring that yields a per-pattern
// heat map and a 4-8 week plan. It measures interview execution, not seniority;
// it never hard-locks content or declares mastery, and is separate from FSRS.
// Per-user result storage, target-profile editing, and the result UI are layered
// around these pure rules so identical evidence yields identical guidance.
import { getInterviewProblemsByGroup, type ProblemGroup } from "./problem-catalog";

export type DiagnosticDimension =
  | "pattern_recognition"
  | "algorithm_selection"
  | "implementation_correctness"
  | "cpp_fluency"
  | "edge_case_testing"
  | "complexity_analysis"
  | "communication"
  | "time_management"
  | "hint_dependence";

export type DiagnosticSource =
  | { kind: "interview_problem"; problemId: string }
  | { kind: "learning_item"; itemId: string };

export type DiagnosticSection = {
  id: string;
  title: string;
  /** The catalog group this section probes (for plan problem selection). */
  group: ProblemGroup;
  source: DiagnosticSource;
  estimatedMinutes: number;
  dimensions: DiagnosticDimension[];
};

const COMMON_DIMENSIONS: DiagnosticDimension[] = [
  "communication",
  "time_management",
  "hint_dependence",
  "complexity_analysis"
];

export const diagnosticSections: DiagnosticSection[] = [
  {
    id: "diag.arrays_window",
    title: "Array / hashing / sliding-window problem",
    group: "two_pointers_sliding_window",
    source: { kind: "interview_problem", problemId: "iv.sliding.longest-window-under-budget" },
    estimatedMinutes: 25,
    dimensions: ["pattern_recognition", "algorithm_selection", "implementation_correctness", ...COMMON_DIMENSIONS]
  },
  {
    id: "diag.graph_dependency",
    title: "Tree / graph traversal or dependency problem",
    group: "graphs_paths",
    source: { kind: "interview_problem", problemId: "iv.graph.service-init-order" },
    estimatedMinutes: 25,
    dimensions: ["pattern_recognition", "algorithm_selection", "implementation_correctness", ...COMMON_DIMENSIONS]
  },
  {
    id: "diag.ds_design",
    title: "Data-structure design / implementation (top-k stream)",
    group: "heaps_topk_streaming",
    source: { kind: "interview_problem", problemId: "iv.heap.top-k-hot-keys" },
    estimatedMinutes: 30,
    dimensions: ["algorithm_selection", "implementation_correctness", "edge_case_testing", ...COMMON_DIMENSIONS]
  },
  {
    id: "diag.cpp_debugging",
    title: "C++ code-review / debugging (ownership & lifetime)",
    group: "cpp_implementation",
    source: { kind: "learning_item", itemId: "cpp.smart_pointers.ownership_transfer.bug_use_after_move" },
    estimatedMinutes: 15,
    dimensions: ["cpp_fluency", "implementation_correctness", "edge_case_testing", "communication"]
  }
];

/** Total diagnostic time; must stay within the 75-100 minute target (#175). */
export function diagnosticMinutes(): number {
  return diagnosticSections.reduce((sum, section) => sum + section.estimatedMinutes, 0);
}

export type AreaLevel = "refresh_first" | "practice_under_time" | "interview_ready";

const READY_THRESHOLD = 0.8;
const PRACTICE_THRESHOLD = 0.5;

/** Classify a per-section score in [0,1] into a deterministic readiness level. */
export function classifyArea(score: number): AreaLevel {
  if (score >= READY_THRESHOLD) {
    return "interview_ready";
  }
  if (score >= PRACTICE_THRESHOLD) {
    return "practice_under_time";
  }
  return "refresh_first";
}

export type HeatMapEntry = { sectionId: string; title: string; group: ProblemGroup; score: number; level: AreaLevel };

/**
 * Build a per-section heat map (not a single pass/fail) from section scores in
 * [0,1]. Missing sections default to 0 (refresh_first), so an incomplete
 * diagnostic still produces a safe, suggestion-only result. Stable order.
 */
export function buildHeatMap(scores: Partial<Record<string, number>>): HeatMapEntry[] {
  return diagnosticSections.map((section) => {
    const score = Math.min(1, Math.max(0, scores[section.id] ?? 0));
    return { sectionId: section.id, title: section.title, group: section.group, score, level: classifyArea(score) };
  });
}

export type DiagnosticNextStepKind = "refresh" | "implementation_practice" | "timed_practice" | "maintenance";

export type DiagnosticNextStep = {
  kind: DiagnosticNextStepKind;
  label: string;
  detail: string;
  href: string;
};

export type PlanWeek = {
  week: number;
  sectionId: string;
  level: AreaLevel;
  reason: string;
  problemIds: string[];
  nextStep: DiagnosticNextStep;
};

const LEVEL_RANK: Record<AreaLevel, number> = { refresh_first: 0, practice_under_time: 1, interview_ready: 2 };
const MIN_WEEKS = 4;
const MAX_WEEKS = 8;

/**
 * Generate a deterministic 4-8 week plan from the heat map. Weakest areas come
 * first (lowest level, then lowest score, then id); each week focuses one area
 * and lists catalog problems for its group (prefer unseen later, once
 * prior-exposure state exists). Identical input always yields an identical plan.
 */
export function generatePlan(heatMap: HeatMapEntry[]): PlanWeek[] {
  const ordered = [...heatMap].sort((a, b) => {
    if (LEVEL_RANK[a.level] !== LEVEL_RANK[b.level]) {
      return LEVEL_RANK[a.level] - LEVEL_RANK[b.level];
    }
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    return a.sectionId.localeCompare(b.sectionId);
  });

  const weeks = Math.min(MAX_WEEKS, Math.max(MIN_WEEKS, ordered.length));
  const plan: PlanWeek[] = [];
  for (let i = 0; i < weeks; i += 1) {
    const entry = ordered[i % ordered.length];
    plan.push({
      week: i + 1,
      sectionId: entry.sectionId,
      level: entry.level,
      reason: planReason(entry),
      problemIds: getInterviewProblemsByGroup(entry.group).map((p) => p.id),
      nextStep: nextStepFor(entry)
    });
  }
  return plan;
}

function planReason(entry: HeatMapEntry): string {
  switch (entry.level) {
    case "interview_ready":
      return `Maintenance: ${entry.title} looked strong (keep it sharp with a timed problem).`;
    case "practice_under_time":
      return `Practice under time: ${entry.title} was solid but needs speed.`;
    default:
      return `Refresh first: ${entry.title} showed gaps to rebuild before timed practice.`;
  }
}

function nextStepFor(entry: HeatMapEntry): DiagnosticNextStep {
  if (entry.level === "interview_ready") {
    return {
      kind: "maintenance",
      label: "Start a timed maintenance rep",
      detail: "Skip beginner review for this strong area and keep it warm with a short independent solve.",
      href: "/interview/session"
    };
  }

  if (entry.level === "practice_under_time") {
    return {
      kind: "timed_practice",
      label: "Practice this area under time",
      detail: "Reasoning is close; use timed sessions to make the execution reliable.",
      href: "/interview/session"
    };
  }

  if (entry.group === "cpp_implementation") {
    return {
      kind: "implementation_practice",
      label: "Drill C++ implementation scaffolding",
      detail: "Correct reasoning with shaky C++ should rebuild through focused implementation exercises before another full interview problem.",
      href: "/exercises"
    };
  }

  return {
    kind: "refresh",
    label: "Refresh the pattern, then solve",
    detail: "Use the interview plan to review the pattern and pick an unseen catalog problem in this weak area.",
    href: "/interview/plan"
  };
}
