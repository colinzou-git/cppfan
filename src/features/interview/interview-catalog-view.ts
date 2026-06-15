// Pure view model for the interview problem catalog UI (#176/#174): the typed
// problems grouped by pattern, in a fixed display order, with readable group
// labels. DB-independent and unit-testable.
import { getInterviewProblemsByGroup, type InterviewProblem, type ProblemGroup } from "./problem-catalog";

const GROUP_ORDER: ProblemGroup[] = [
  "arrays_hashing_prefix",
  "two_pointers_sliding_window",
  "binary_search",
  "intervals_sweepline",
  "stacks_queues_monotonic",
  "heaps_topk_streaming",
  "linked_cache",
  "trees_bst",
  "graphs_paths",
  "union_find",
  "dp_backtracking",
  "cpp_implementation"
];

export const GROUP_LABELS: Record<ProblemGroup, string> = {
  arrays_hashing_prefix: "Arrays, hashing & prefix sums",
  two_pointers_sliding_window: "Two pointers & sliding window",
  binary_search: "Binary search",
  intervals_sweepline: "Intervals & sweep line",
  stacks_queues_monotonic: "Stacks, queues & monotonic",
  heaps_topk_streaming: "Heaps, top-k & streaming",
  linked_cache: "Linked lists & caches",
  trees_bst: "Trees & BST",
  graphs_paths: "Graphs & paths",
  union_find: "Union-find",
  dp_backtracking: "DP & backtracking",
  cpp_implementation: "C++ implementation"
};

export type InterviewGroupView = { group: ProblemGroup; label: string; problems: InterviewProblem[] };

/** Interview problems grouped by pattern, in display order; empty groups omitted. */
export function groupInterviewProblems(): InterviewGroupView[] {
  return GROUP_ORDER.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    problems: getInterviewProblemsByGroup(group)
  })).filter((entry) => entry.problems.length > 0);
}
