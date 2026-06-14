// Curated Google-style coding-interview problem catalog (#176 / #174). A
// deliberately small, high-signal set of ORIGINAL cppFan prompts that test
// transferable interview patterns, several with systems framing. External
// resources are linked and annotated only — no third-party statements, solutions,
// or company-frequency claims are copied. Typed catalog (read model); per-user
// prior-exposure state, hidden test suites, and the judge (#178) are separate.

export type ProblemGroup =
  | "arrays_hashing_prefix"
  | "two_pointers_sliding_window"
  | "binary_search"
  | "intervals_sweepline"
  | "stacks_queues_monotonic"
  | "heaps_topk_streaming"
  | "linked_cache"
  | "trees_bst"
  | "graphs_paths"
  | "union_find"
  | "dp_backtracking"
  | "cpp_implementation";

export type RoleRelevance = "general" | "systems" | "storage" | "streaming" | "concurrency-adjacent";

export type ProblemDifficulty = "easy" | "medium" | "hard";

export type ExternalLink = { url: string; annotation: string };

export type VisibleExample = { input: string; output: string; note?: string };

export type InterviewProblem = {
  /** Stable id and a version so changed wording does not silently rewrite history. */
  id: string;
  version: number;
  title: string;
  /** Original cppFan prompt — never copied from a third party. */
  prompt: string;
  group: ProblemGroup;
  roleRelevance: RoleRelevance;
  difficulty: ProblemDifficulty;
  primarySkillId: string;
  secondarySkillIds: string[];
  patternTags: string[];
  /** Input constraints and the target complexity to aim for. */
  constraints: string;
  targetComplexity: string;
  requiredEdgeCases: string[];
  clarifyingQuestions: string[];
  /** Progressive hints, least to most revealing. */
  hintLadder: string[];
  visibleExamples: VisibleExample[];
  externalLinks: ExternalLink[];
};

const CSES: ExternalLink = { url: "https://cses.fi/problemset/", annotation: "CSES: extra practice on this pattern." };
const CPALGO: ExternalLink = { url: "https://cp-algorithms.com/", annotation: "cp-algorithms: reference for the technique." };
const USACO: ExternalLink = { url: "https://usaco.guide/", annotation: "USACO Guide: topic-ordered explanation." };

export const interviewProblems: InterviewProblem[] = [
  {
    id: "iv.prefix.balance-returns-to-zero",
    version: 1,
    title: "When does the running balance return to its start?",
    prompt:
      "You are given a list of signed integer deltas applied in order to a counter that starts at 0 (think: a stream of credit/debit events on an account). Return the number of distinct prefixes after which the running total equals 0. Solve it in one pass.",
    group: "arrays_hashing_prefix",
    roleRelevance: "systems",
    difficulty: "easy",
    primarySkillId: "dsa.techniques.prefix_sums",
    secondarySkillIds: [],
    patternTags: ["prefix-sum", "single-pass"],
    constraints: "1 <= n <= 2e5; each delta fits in a 64-bit integer; the running total may overflow 32 bits.",
    targetComplexity: "O(n) time, O(1) extra space.",
    requiredEdgeCases: ["all zero deltas", "total never returns to 0", "values that overflow 32-bit"],
    clarifyingQuestions: ["Does the empty prefix count?", "Can deltas be zero?"],
    hintLadder: [
      "Track the running total as you scan; you do not need the individual deltas afterward.",
      "Count the positions where the running total is exactly 0.",
      "Use a 64-bit accumulator so large sums do not overflow."
    ],
    visibleExamples: [
      { input: "[1, -1, 2, -2]", output: "2", note: "after index 1 and after index 3" },
      { input: "[5, -2, -3, 4]", output: "1" }
    ],
    externalLinks: [CSES]
  },
  {
    id: "iv.sliding.longest-window-under-budget",
    version: 1,
    title: "Longest window that stays under a budget",
    prompt:
      "Given an array of non-negative request costs in arrival order and a budget B, return the length of the longest contiguous window whose total cost is at most B (the longest stretch of time a monitored service stays under a load cap).",
    group: "two_pointers_sliding_window",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.techniques.sliding_window",
    secondarySkillIds: ["dsa.arrays.two_pointers"],
    patternTags: ["sliding-window", "two-pointer"],
    constraints: "1 <= n <= 2e5; 0 <= cost[i]; 0 <= B; sums can exceed 32 bits.",
    targetComplexity: "O(n) time, O(1) extra space.",
    requiredEdgeCases: ["a single cost exceeds B", "all costs zero", "B = 0"],
    clarifyingQuestions: ["Are costs guaranteed non-negative?", "Is the empty window (length 0) a valid answer?"],
    hintLadder: [
      "Grow a window to the right, adding cost; shrink from the left when the sum exceeds B.",
      "Because costs are non-negative, the window sum is monotonic as you move the right edge.",
      "Track the best width seen while the window is valid."
    ],
    visibleExamples: [
      { input: "costs=[2,1,5,1,3], B=7", output: "3", note: "[1,5,1] = 7" },
      { input: "costs=[4,4,4], B=3", output: "0" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.heap.top-k-hot-keys",
    version: 1,
    title: "Top-k hottest keys in a stream",
    prompt:
      "Process a stream of key accesses and, at the end, return the k keys with the highest access counts, breaking ties by smaller key. You may not assume the stream fits in memory beyond the per-key counts. Aim to keep only what you need to report the top k.",
    group: "heaps_topk_streaming",
    roleRelevance: "streaming",
    difficulty: "medium",
    primarySkillId: "dsa.trees.heap_applications",
    secondarySkillIds: ["dsa.trees.heap", "dsa.sorting.comparator"],
    patternTags: ["top-k", "min-heap", "streaming"],
    constraints: "Up to 2e5 distinct keys; 1 <= k <= number of distinct keys.",
    targetComplexity: "O(n log k) time, O(k) heap space (plus the per-key count map).",
    requiredEdgeCases: ["k equals the number of distinct keys", "ties on count", "a single key dominates"],
    clarifyingQuestions: ["Is k guaranteed <= distinct keys?", "How are ties broken?"],
    hintLadder: [
      "First reduce the stream to a count per key.",
      "Keep a size-k min-heap of (count, key); push each key and pop when the heap exceeds k.",
      "Order the heap comparator so the weakest candidate (lowest count, then larger key) is on top to be evicted."
    ],
    visibleExamples: [{ input: "accesses=[a,b,a,c,b,a], k=2", output: "[a, b]" }],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.graph.service-init-order",
    version: 1,
    title: "Service initialization order",
    prompt:
      "Given services and a list of 'A must start before B' dependencies, return any valid startup order, or report that no order exists (a dependency cycle). Model it as a directed graph and produce a topological order.",
    group: "graphs_paths",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.graphs.topological_sort",
    secondarySkillIds: [],
    patternTags: ["topological-sort", "cycle-detection", "kahn"],
    constraints: "1 <= services <= 2e5; dependencies may contain duplicates; the graph may be disconnected.",
    targetComplexity: "O(V + E) time and space.",
    requiredEdgeCases: ["a cycle exists (no valid order)", "no dependencies", "disconnected components"],
    clarifyingQuestions: ["If several orders are valid, is any one acceptable?", "Can a dependency be listed twice?"],
    hintLadder: [
      "Compute the in-degree of every service.",
      "Repeatedly start services with in-degree 0, decrementing their dependents (Kahn's algorithm).",
      "If you cannot place every service, the remaining ones form a cycle."
    ],
    visibleExamples: [
      { input: "edges: a->b, a->c, c->d", output: "a, b, c, d (or a, c, b, d)" },
      { input: "edges: a->b, b->a", output: "no valid order (cycle)" }
    ],
    externalLinks: [CPALGO, USACO]
  },
  {
    id: "iv.intervals.max-concurrent-maintenance",
    version: 1,
    title: "Peak concurrent maintenance windows",
    prompt:
      "Given a set of half-open maintenance windows [start, end), return the maximum number that are active at the same instant (the peak concurrency you must plan capacity for).",
    group: "intervals_sweepline",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.sorting.comparator",
    secondarySkillIds: [],
    patternTags: ["sweep-line", "sort-events"],
    constraints: "1 <= n <= 2e5; coordinates fit in 64 bits; windows may share endpoints.",
    targetComplexity: "O(n log n) time, O(n) space.",
    requiredEdgeCases: ["a window that ends exactly when another starts (half-open: not overlapping)", "identical windows", "single window"],
    clarifyingQuestions: ["Are windows half-open [start, end)?", "Do touching endpoints count as overlapping?"],
    hintLadder: [
      "Turn each window into a +1 event at start and a -1 event at end.",
      "Sort events by coordinate; process ends before starts at the same coordinate for half-open windows.",
      "Track a running count and its maximum."
    ],
    visibleExamples: [{ input: "[(1,4),(2,5),(7,9)]", output: "2" }],
    externalLinks: [CSES]
  }
];

export function getInterviewProblems(): InterviewProblem[] {
  return interviewProblems;
}

export function getInterviewProblem(id: string): InterviewProblem | null {
  return interviewProblems.find((problem) => problem.id === id) ?? null;
}

export function getInterviewProblemsByGroup(group: ProblemGroup): InterviewProblem[] {
  return interviewProblems.filter((problem) => problem.group === group);
}
