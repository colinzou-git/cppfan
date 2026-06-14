// Deterministic interviewer follow-ups and transfer variants (#181 / #174).
// Reviewed, typed follow-ups keyed to the #176 problems test genuine adaptation
// (invariants, constraints, data-structure tradeoffs) under pressure — no live
// generation for graded sessions. Selection is deterministic. Per-session
// delivery, hidden tests, and the judge are follow-up slices; the full
// 40-across-30 release waits on the catalog growing past its first problems.
import { getInterviewProblem } from "./problem-catalog";
import type { RubricCriterionId } from "./rubric";

export type VariantKind =
  | "stream"
  | "out_of_memory"
  | "return_witness"
  | "support_updates"
  | "stable_ordering"
  | "duplicates_or_negatives"
  | "integer_range"
  | "stricter_target"
  | "incremental_output"
  | "multi_source"
  | "operation_mix_change"
  | "make_reusable_testable"
  | "thread_safety_discussion"
  | "diagnose_bug"
  | "compare_approaches";

export type FollowUpTrigger = "base_correct" | "after_remediation";
export type FollowUpTiming = "after_baseline" | "after_implementation" | "after_acceptance";
export type RevealPolicy = "after_attempt" | "on_request";

export type FollowUp = {
  id: string;
  version: number;
  /** Parent problem id (#176 catalog) and the parent version it was written for. */
  problemId: string;
  parentVersion: number;
  kind: VariantKind;
  trigger: FollowUpTrigger;
  timing: FollowUpTiming;
  /** Lower runs first when several fit (deterministic priority). */
  priority: number;
  prompt: string;
  affectedConstraints: string;
  expectedReasoningShift: string;
  targetRubricDimensions: RubricCriterionId[];
  timeBudgetMinutes: number;
  revealPolicy: RevealPolicy;
  explanation: string;
};

export const followUps: FollowUp[] = [
  {
    id: "fu.top-k.updates",
    version: 1,
    problemId: "iv.heap.top-k-hot-keys",
    parentVersion: 1,
    kind: "support_updates",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Now keys can also be evicted (their count drops to zero between queries). Keep the top-k correct as counts go up and down.",
    affectedConstraints: "Counts mutate between queries; a single fixed-size heap can hold stale entries.",
    expectedReasoningShift: "A plain size-k heap no longer suffices; discuss lazy deletion or an ordered structure keyed by count.",
    targetRubricDimensions: ["optimization", "follow_up_adaptability"],
    timeBudgetMinutes: 8,
    revealPolicy: "after_attempt",
    explanation: "Mutable counts break the one-pass heap; lazy-deleting stale heap entries or a balanced map by (count,key) keeps it correct."
  },
  {
    id: "fu.top-k.incremental",
    version: 1,
    problemId: "iv.heap.top-k-hot-keys",
    parentVersion: 1,
    kind: "incremental_output",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 2,
    prompt: "Report the current top-k after every access, not just at the end.",
    affectedConstraints: "Output is continuous; recomputing from scratch each step is too slow.",
    expectedReasoningShift: "Maintain the top-k incrementally as counts change rather than a final pass.",
    targetRubricDimensions: ["complexity", "follow_up_adaptability"],
    timeBudgetMinutes: 7,
    revealPolicy: "after_attempt",
    explanation: "Maintain an incremental structure so each access is sublinear, not O(distinct) per step."
  },
  {
    id: "fu.service-init.witness",
    version: 1,
    problemId: "iv.graph.service-init-order",
    parentVersion: 1,
    kind: "return_witness",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "When no valid order exists, return the actual dependency cycle, not just 'no order'.",
    affectedConstraints: "Must reconstruct a witness, not only detect failure.",
    expectedReasoningShift: "Track parents / use DFS colors to recover a concrete cycle.",
    targetRubricDimensions: ["correctness", "follow_up_adaptability"],
    timeBudgetMinutes: 8,
    revealPolicy: "after_attempt",
    explanation: "A DFS with on-stack marking lets you walk back from the back-edge to print the cycle."
  },
  {
    id: "fu.service-init.updates",
    version: 1,
    problemId: "iv.graph.service-init-order",
    parentVersion: 1,
    kind: "support_updates",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 2,
    prompt: "Dependencies are added at runtime; keep a valid startup order available after each addition.",
    affectedConstraints: "Edges arrive online; recomputing a full topo sort each time may be too slow.",
    expectedReasoningShift: "Discuss incremental topological maintenance vs full recompute tradeoffs.",
    targetRubricDimensions: ["optimization", "follow_up_adaptability"],
    timeBudgetMinutes: 9,
    revealPolicy: "after_attempt",
    explanation: "Online topological order is hard in general; bound the recompute or detect when a cheap fix-up suffices."
  },
  {
    id: "fu.sliding.negatives",
    version: 1,
    problemId: "iv.sliding.longest-window-under-budget",
    parentVersion: 1,
    kind: "duplicates_or_negatives",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Costs can now be negative. Does your two-pointer window still work? If not, fix it.",
    affectedConstraints: "Window sum is no longer monotonic as the right edge moves.",
    expectedReasoningShift: "The sliding-window invariant breaks; switch to prefix sums + a monotonic structure or a different approach.",
    targetRubricDimensions: ["baseline_reasoning", "follow_up_adaptability"],
    timeBudgetMinutes: 9,
    revealPolicy: "after_attempt",
    explanation: "Negative costs void monotonicity; prefix sums with a deque/ordered set restores correctness."
  },
  {
    id: "fu.sliding.stream",
    version: 1,
    problemId: "iv.sliding.longest-window-under-budget",
    parentVersion: 1,
    kind: "stream",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 2,
    prompt: "Costs arrive as an unbounded stream; report the best window seen so far without storing everything.",
    affectedConstraints: "Cannot keep the whole array; bounded memory only.",
    expectedReasoningShift: "Keep only the active window and running aggregates rather than the full history.",
    targetRubricDimensions: ["complexity", "follow_up_adaptability"],
    timeBudgetMinutes: 7,
    revealPolicy: "after_attempt",
    explanation: "Non-negative costs let you keep just the window bounds and sum in O(1) memory."
  },
  {
    id: "fu.prefix.overflow",
    version: 1,
    problemId: "iv.prefix.balance-returns-to-zero",
    parentVersion: 1,
    kind: "integer_range",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 2,
    prompt: "Deltas can be up to 1e18 in magnitude. What breaks, and how do you fix it?",
    affectedConstraints: "The running total overflows 64-bit if accumulated naively across many large deltas.",
    expectedReasoningShift: "Reason about the maximum possible magnitude and choose a wide enough type or detect overflow.",
    targetRubricDimensions: ["cpp_implementation", "correctness"],
    timeBudgetMinutes: 6,
    revealPolicy: "after_attempt",
    explanation: "Bound the worst-case sum (n * max_delta) and pick the type accordingly, or use checked addition."
  },
  {
    id: "fu.prefix.updates",
    version: 1,
    problemId: "iv.prefix.balance-returns-to-zero",
    parentVersion: 1,
    kind: "operation_mix_change",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Support point updates to a delta interleaved with 'how many zero-balance prefixes now?' queries.",
    affectedConstraints: "A static one-pass scan no longer works; updates change many prefixes.",
    expectedReasoningShift: "Move from a single scan to a structure supporting updates (e.g. a Fenwick tree over prefix values).",
    targetRubricDimensions: ["optimization", "follow_up_adaptability"],
    timeBudgetMinutes: 9,
    revealPolicy: "after_attempt",
    explanation: "A point update shifts a suffix of prefix sums; a Fenwick/segment structure answers updated queries in O(log n)."
  },
  {
    id: "fu.intervals.witness",
    version: 1,
    problemId: "iv.intervals.max-concurrent-maintenance",
    parentVersion: 1,
    kind: "return_witness",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 2,
    prompt: "Also return an instant at which the peak concurrency occurs.",
    affectedConstraints: "Must capture where the maximum is reached, not just its value.",
    expectedReasoningShift: "Record the coordinate when the running count hits a new maximum during the sweep.",
    targetRubricDimensions: ["correctness", "communication"],
    timeBudgetMinutes: 5,
    revealPolicy: "after_attempt",
    explanation: "Track the event coordinate whenever the running counter sets a new max."
  },
  {
    id: "fu.intervals.diagnose-bug",
    version: 1,
    problemId: "iv.intervals.max-concurrent-maintenance",
    parentVersion: 1,
    kind: "diagnose_bug",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "A teammate's sweep processes start events before end events at equal coordinates and reports too-high concurrency for touching windows. Find and fix the bug.",
    affectedConstraints: "Half-open windows: a window ending at t does not overlap one starting at t.",
    expectedReasoningShift: "Order equal-coordinate events so ends are processed before starts (testing/debugging, not a new algorithm).",
    targetRubricDimensions: ["testing", "cpp_implementation"],
    timeBudgetMinutes: 6,
    revealPolicy: "after_attempt",
    explanation: "For half-open intervals, sort ends before starts at the same coordinate so touching windows are not counted as overlapping."
  }
];

export function getFollowUpsForProblem(problemId: string): FollowUp[] {
  return followUps.filter((f) => f.problemId === problemId);
}

export type FollowUpSelectionInput = {
  baseSolutionCorrect: boolean;
  minutesRemaining: number;
  /** Follow-up ids already delivered this session (not repeated). */
  excludeIds?: string[];
};

/**
 * Deterministically choose the next follow-up for a problem. Returns null when
 * the base solution is still incorrect (use a diagnostic/hint instead) or when no
 * reviewed follow-up fits the remaining time. Ties break by priority then id.
 */
export function selectFollowUp(problemId: string, input: FollowUpSelectionInput): FollowUp | null {
  if (!input.baseSolutionCorrect) {
    return null;
  }
  const exclude = new Set(input.excludeIds ?? []);
  const candidates = getFollowUpsForProblem(problemId)
    .filter((f) => !exclude.has(f.id) && f.timeBudgetMinutes <= input.minutesRemaining)
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
  return candidates[0] ?? null;
}

/** Whether a follow-up's parent problem exists and the parent version matches. */
export function followUpParentIsValid(followUp: FollowUp): boolean {
  const problem = getInterviewProblem(followUp.problemId);
  return problem !== null && problem.version === followUp.parentVersion;
}
