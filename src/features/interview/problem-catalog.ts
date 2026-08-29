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
  /**
   * Reviewed importance flag (#176): whether this problem belongs to the curated
   * high-signal interview-core set. Importance is stated explicitly here, never
   * derived from how many skills/items reference it. Omitted defaults to core,
   * since the whole catalog is the deliberately small core set; the field exists
   * to mark any future supplementary problem as non-core.
   */
  interviewCore?: boolean;
};

const CSES: ExternalLink = { url: "https://cses.fi/problemset/", annotation: "CSES: extra practice on this pattern." };
const CPALGO: ExternalLink = { url: "https://cp-algorithms.com/", annotation: "cp-algorithms: reference for the technique." };
const USACO: ExternalLink = { url: "https://usaco.guide/", annotation: "USACO Guide: topic-ordered explanation." };
const CPPREF: ExternalLink = { url: "https://en.cppreference.com/", annotation: "cppreference: language/library semantics for this construct." };

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
  },
  {
    id: "iv.bsearch.insert-position",
    version: 1,
    title: "Where does it belong in the sorted log?",
    prompt:
      "You keep timestamps in a sorted ascending array. For a new timestamp t, return the index of the first element that is greater than or equal to t — the position where t would be inserted to keep the array sorted. Solve it in O(log n).",
    group: "binary_search",
    roleRelevance: "systems",
    difficulty: "easy",
    primarySkillId: "dsa.searching.binary_search",
    secondarySkillIds: [],
    patternTags: ["binary-search", "lower-bound"],
    constraints: "0 <= n <= 2e5; the array is sorted ascending; values may repeat; t fits in a 64-bit integer.",
    targetComplexity: "O(log n) time, O(1) extra space.",
    requiredEdgeCases: ["t smaller than every element (index 0)", "t larger than every element (index n)", "duplicates of t (return the first)"],
    clarifyingQuestions: ["If t equals existing values, do I return the first such index?", "Is an empty array possible?"],
    hintLadder: [
      "Keep a half-open search range [lo, hi) over indices, starting at [0, n).",
      "When the midpoint value is less than t, the answer is to its right; otherwise it could be the midpoint or to its left.",
      "Converge until lo == hi; that index is the first element >= t (this is std::lower_bound)."
    ],
    visibleExamples: [
      { input: "a=[1,3,5,7], t=4", output: "2" },
      { input: "a=[1,3,5,7], t=8", output: "4", note: "belongs at the end" },
      { input: "a=[2,2,2], t=2", output: "0", note: "first index >= t" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.bsearch.rotated-min",
    version: 1,
    title: "Smallest id in a rotated ring",
    prompt:
      "A sorted ascending array of distinct ids was rotated at an unknown pivot (a ring buffer whose logical start moved). Return the smallest id without scanning every element — O(log n).",
    group: "binary_search",
    roleRelevance: "storage",
    difficulty: "medium",
    primarySkillId: "dsa.searching.binary_search",
    secondarySkillIds: [],
    patternTags: ["binary-search", "rotated-array", "monotonic-half"],
    constraints: "1 <= n <= 2e5; all ids distinct; the array is a rotation of a sorted ascending array (rotation may be zero).",
    targetComplexity: "O(log n) time, O(1) extra space.",
    requiredEdgeCases: ["no rotation (already sorted)", "single element", "pivot at the last position"],
    clarifyingQuestions: ["Are the ids guaranteed distinct?", "Could the rotation amount be zero?"],
    hintLadder: [
      "Compare the midpoint to the rightmost element to decide which half holds the wrap-around.",
      "If a[mid] > a[hi], the minimum is strictly to the right of mid; otherwise it is at mid or to its left.",
      "Shrink the range accordingly until it holds one element — the minimum."
    ],
    visibleExamples: [
      { input: "[4,5,6,7,0,1,2]", output: "0" },
      { input: "[11,13,15,17]", output: "11", note: "rotation is zero" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.bsearch.peak-index",
    version: 1,
    title: "Find any local peak",
    prompt:
      "Given an array where no two adjacent elements are equal, return the index of any peak — an element strictly greater than its neighbors (the two ends each have a single neighbor). A monitoring trace where you want any local maximum is the motivating case. Solve it in O(log n).",
    group: "binary_search",
    roleRelevance: "streaming",
    difficulty: "medium",
    primarySkillId: "dsa.searching.binary_search",
    secondarySkillIds: [],
    patternTags: ["binary-search", "peak", "slope"],
    constraints: "1 <= n <= 2e5; no two adjacent elements are equal; treat out-of-bounds neighbors as negative infinity.",
    targetComplexity: "O(log n) time, O(1) extra space.",
    requiredEdgeCases: ["single element (it is a peak)", "strictly increasing (peak at the end)", "strictly decreasing (peak at the start)"],
    clarifyingQuestions: ["Is it guaranteed that adjacent elements differ?", "May I return any peak when several exist?"],
    hintLadder: [
      "At a midpoint, compare it to its right neighbor to learn which way the slope rises.",
      "If the right neighbor is larger, a peak must exist to the right; otherwise mid itself is a peak or one lies to the left.",
      "Move toward the rising side until the range collapses to a single index."
    ],
    visibleExamples: [
      { input: "[1,3,2]", output: "1" },
      { input: "[1,2,3,1]", output: "2" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.bsearch.min-rate-before-deadline",
    version: 1,
    title: "Slowest rate that still meets the deadline",
    prompt:
      "You must drain q work queues with sizes[i] items each. You pick one integer processing rate r (items per hour); queue i then takes ceil(sizes[i] / r) hours, and the queues are processed back to back. Return the smallest r for which the total hours is at most H. The total time only decreases as r increases, so the feasibility is monotonic.",
    group: "binary_search",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.searching.binary_search",
    secondarySkillIds: [],
    patternTags: ["binary-search", "search-on-answer", "monotonic-predicate"],
    constraints: "1 <= q <= 2e5; 1 <= sizes[i] <= 1e9; q <= H <= 1e12; a feasible r always exists.",
    targetComplexity: "O(q log(max size)) time, O(1) extra space.",
    requiredEdgeCases: ["H equals q (need the largest size as the rate)", "one queue dominates", "very large sizes (use 64-bit for the hour total)"],
    clarifyingQuestions: ["Is the rate required to be an integer?", "Is a feasible rate guaranteed to exist within H?"],
    hintLadder: [
      "Binary search on the answer r, not on an index: the candidate range is 1..max(sizes).",
      "For a candidate r, sum ceil(sizes[i]/r) and compare to H — this feasibility test is monotonic in r.",
      "Find the smallest feasible r by shrinking toward the boundary between infeasible and feasible."
    ],
    visibleExamples: [
      { input: "sizes=[4,5,9], H=6", output: "4", note: "r=4 -> 1+2+3=6 hours; r=3 -> 2+2+3=7 > 6" },
      { input: "sizes=[10], H=2", output: "5", note: "ceil(10/5)=2" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.bsearch.balance-link-load",
    version: 1,
    title: "Balance load across links",
    prompt:
      "Given non-negative throughput demands in arrival order and m links, split the demands into m contiguous groups (you may not reorder them) and assign each group to a link. Return the smallest possible value of the largest group sum — the best worst-case link load. Larger allowed loads are easier to satisfy, so feasibility is monotonic in the cap.",
    group: "binary_search",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.searching.binary_search",
    secondarySkillIds: ["dsa.techniques.greedy"],
    patternTags: ["binary-search", "search-on-answer", "partition", "greedy-check"],
    constraints: "1 <= m <= n <= 2e5; 0 <= demand[i] <= 1e9; the total can exceed 32 bits.",
    targetComplexity: "O(n log(sum)) time, O(1) extra space.",
    requiredEdgeCases: ["m == n (each demand its own group)", "m == 1 (one group is the whole array)", "a single demand larger than the average group"],
    clarifyingQuestions: ["Must groups be contiguous (no reordering)?", "Can a demand be zero?"],
    hintLadder: [
      "Binary search the answer: the cap ranges from max(demand) up to sum(demand).",
      "For a candidate cap, greedily fill a group until adding the next demand would exceed the cap, then start a new group; count the groups needed.",
      "The cap is feasible when the greedy needs at most m groups; find the smallest feasible cap."
    ],
    visibleExamples: [
      { input: "demands=[2,3,1,2,4,3], m=3", output: "6", note: "[2,3,1] | [2,4] | [3] -> max 6" },
      { input: "demands=[5,5,5], m=3", output: "5" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.stack.balanced-delimiters",
    version: 1,
    title: "Are the delimiters balanced?",
    prompt:
      "A config language uses three delimiter pairs: (), [], and {}. Given a string of those six characters, return whether every opener is closed by the matching closer in the correct nesting order. Solve it in one pass.",
    group: "stacks_queues_monotonic",
    roleRelevance: "general",
    difficulty: "easy",
    primarySkillId: "dsa.stacks.basic_stack",
    secondarySkillIds: [],
    patternTags: ["stack", "matching", "single-pass"],
    constraints: "0 <= n <= 2e5; the string contains only the six delimiter characters.",
    targetComplexity: "O(n) time, O(n) worst-case stack space.",
    requiredEdgeCases: ["empty string (balanced)", "a lone closer", "correct counts but wrong order like ([)]"],
    clarifyingQuestions: ["Is an empty string considered balanced?", "Are only the six delimiter characters present?"],
    hintLadder: [
      "Push every opener onto a stack.",
      "On a closer, the stack top must be the matching opener; otherwise it is unbalanced.",
      "It is balanced only if the stack is empty at the end."
    ],
    visibleExamples: [
      { input: "\"()[]{}\"", output: "true" },
      { input: "\"([)]\"", output: "false", note: "right counts, wrong nesting" },
      { input: "\"(]\"", output: "false" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.stack.steps-to-higher-load",
    version: 1,
    title: "Steps until a higher load reading",
    prompt:
      "Given a list of load readings in time order, return for each reading how many steps forward you must look to find a strictly higher reading, or 0 if none follows. Aim for one linear pass rather than a quadratic scan.",
    group: "stacks_queues_monotonic",
    roleRelevance: "streaming",
    difficulty: "medium",
    primarySkillId: "dsa.stacks.basic_stack",
    secondarySkillIds: ["dsa.arrays.traversal"],
    patternTags: ["monotonic-stack", "next-greater"],
    constraints: "1 <= n <= 2e5; readings fit in a 32-bit integer.",
    targetComplexity: "O(n) time, O(n) stack space.",
    requiredEdgeCases: ["strictly increasing (each answer is 1)", "strictly decreasing (all zeros)", "plateaus of equal readings (equal is not strictly higher)"],
    clarifyingQuestions: ["Is the comparison strict (equal does not count)?", "Should the last element be 0?"],
    hintLadder: [
      "Keep a stack of indices whose answer is still unknown.",
      "When the current reading exceeds the reading at the stack top, you have found that index's next-greater; pop and record the distance.",
      "Indices left on the stack at the end have no higher reading and stay 0."
    ],
    visibleExamples: [
      { input: "[3,1,4,1,5]", output: "[2,1,2,1,0]", note: "index 0's next-greater (4) is 2 steps away" },
      { input: "[5,4,3]", output: "[0,0,0]" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.stack.min-stack-design",
    version: 1,
    title: "Stack with O(1) minimum",
    prompt:
      "Design a stack of integers supporting push, pop, top, and getMin — the smallest value currently on the stack — each in O(1) time. State the invariant that keeps getMin constant-time. Describe the API and how each operation maintains it.",
    group: "stacks_queues_monotonic",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.stacks.basic_stack",
    secondarySkillIds: [],
    patternTags: ["stack", "data-structure-design", "invariant"],
    constraints: "Up to 2e5 operations; pop/top/getMin are only called on a non-empty stack.",
    targetComplexity: "O(1) per operation, O(n) space.",
    requiredEdgeCases: ["getMin after popping the current minimum", "duplicate minima", "single element"],
    clarifyingQuestions: ["Are pop/top/getMin guaranteed to be called only when non-empty?", "Do duplicate values need to be handled for getMin?"],
    hintLadder: [
      "Alongside the value stack, keep a second stack of the minimum-so-far at each level.",
      "On push, push min(value, current overall min); on pop, pop both stacks together.",
      "getMin is then the top of the minimum stack — O(1)."
    ],
    visibleExamples: [
      {
        input: "push 5, push 2, getMin, push 7, getMin, pop, getMin, pop, getMin",
        output: "2 2 2 5",
        note: "getMin tracks the live minimum as values come and go"
      }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.queue.window-peak-load",
    version: 1,
    title: "Peak load over each rolling window",
    prompt:
      "Given load readings in time order and a window size k, return the maximum reading within each contiguous window of k readings as the window slides one step at a time. Aim for one linear pass overall, not O(n*k).",
    group: "stacks_queues_monotonic",
    roleRelevance: "streaming",
    difficulty: "hard",
    primarySkillId: "dsa.stacks.basic_stack",
    secondarySkillIds: ["dsa.techniques.sliding_window"],
    patternTags: ["monotonic-deque", "sliding-window", "max"],
    constraints: "1 <= k <= n <= 2e5; readings fit in a 32-bit integer.",
    targetComplexity: "O(n) time, O(k) deque space.",
    requiredEdgeCases: ["k = 1 (each reading is its own window)", "k = n (one window)", "strictly decreasing readings"],
    clarifyingQuestions: ["Is k guaranteed <= n?", "Are windows contiguous and shifted by one each step?"],
    hintLadder: [
      "Keep a deque of indices whose readings are candidates for the current window's maximum.",
      "Before adding index i, pop smaller readings from the back (they can never be the max while i is present), and drop the front if it has slid out of the window.",
      "The front of the deque is the maximum for each window once the first window is full."
    ],
    visibleExamples: [
      { input: "readings=[1,3,-1,-3,5,3,6,7], k=3", output: "[3,3,5,5,6,7]" },
      { input: "readings=[4,2,1], k=2", output: "[4,2]" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.dp.ways-to-reach-step",
    version: 1,
    title: "Ways to reach the top step",
    prompt:
      "You climb a staircase of n steps, taking either 1 or 2 steps at a time. Return the number of distinct ordered ways to reach step n. Aim for O(n) time and O(1) extra space.",
    group: "dp_backtracking",
    roleRelevance: "general",
    difficulty: "easy",
    primarySkillId: "dsa.techniques.dynamic_programming",
    secondarySkillIds: ["dsa.recursion.base_case"],
    patternTags: ["dynamic-programming", "1d-dp", "fibonacci-recurrence"],
    constraints: "0 <= n <= 90; the answer fits in a 64-bit integer for this range.",
    targetComplexity: "O(n) time, O(1) extra space.",
    requiredEdgeCases: ["n = 0 (one way: take no steps)", "n = 1", "large n where the count overflows 32 bits"],
    clarifyingQuestions: ["Is reaching n = 0 counted as one way?", "Do 1+2 and 2+1 count as different ways?"],
    hintLadder: [
      "The ways to reach step n equal the ways to reach n-1 (then a 1-step) plus the ways to reach n-2 (then a 2-step).",
      "That is the Fibonacci recurrence; you only need the last two values.",
      "Iterate from the base cases keeping a rolling pair instead of an array."
    ],
    visibleExamples: [
      { input: "n=4", output: "5", note: "1111, 112, 121, 211, 22" },
      { input: "n=1", output: "1" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.dp.max-contiguous-flow",
    version: 1,
    title: "Largest contiguous net flow",
    prompt:
      "Given signed net-flow readings in time order (credits positive, debits negative), return the largest sum of any non-empty contiguous run. A run that dips negative may still be worth keeping if a later surge more than recovers it. Solve it in one pass.",
    group: "dp_backtracking",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.techniques.dynamic_programming",
    secondarySkillIds: [],
    patternTags: ["dynamic-programming", "kadane", "running-best"],
    constraints: "1 <= n <= 2e5; readings fit in a 32-bit integer; the running sum may exceed 32 bits.",
    targetComplexity: "O(n) time, O(1) extra space.",
    requiredEdgeCases: ["all readings negative (answer is the largest single reading)", "single reading", "a dip that a later surge recovers"],
    clarifyingQuestions: ["Must the run be non-empty?", "Can all readings be negative?"],
    hintLadder: [
      "Track the best run ending at the current position: either extend the previous run or start fresh at the current reading.",
      "best_ending = max(reading, best_ending + reading).",
      "Keep the maximum best_ending seen so far; use a 64-bit accumulator for the sum."
    ],
    visibleExamples: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", note: "the run [4,-1,2,1]" },
      { input: "[-3,-1,-2]", output: "-1", note: "all negative -> the largest single reading" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.dp.fewest-coins",
    version: 1,
    title: "Fewest coins to make an amount",
    prompt:
      "Given coin denominations (each usable any number of times) and a target amount, return the fewest coins that sum exactly to the amount, or -1 if it cannot be made. Aim for O(amount * denominations) time.",
    group: "dp_backtracking",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.techniques.dp_design",
    secondarySkillIds: ["dsa.techniques.dynamic_programming"],
    patternTags: ["dynamic-programming", "unbounded-knapsack", "min-cost"],
    constraints: "1 <= denominations <= 50; 1 <= coin value <= 1e4; 0 <= amount <= 1e4.",
    targetComplexity: "O(amount * denominations) time, O(amount) space.",
    requiredEdgeCases: ["amount = 0 (zero coins)", "amount that no combination can make (-1)", "a single coin that does not divide the amount"],
    clarifyingQuestions: ["Can each denomination be used unlimited times?", "Should an impossible amount return -1?"],
    hintLadder: [
      "Let best[a] be the fewest coins to make amount a; best[0] = 0.",
      "For each amount a, try every coin c <= a: best[a] = min(best[a], best[a-c] + 1).",
      "If best[amount] was never updated from infinity, the amount is impossible -> -1."
    ],
    visibleExamples: [
      { input: "coins=[1,3,4], amount=6", output: "2", note: "3 + 3" },
      { input: "coins=[2], amount=3", output: "-1" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.backtracking.subset-sum-count",
    version: 1,
    title: "How many subsets exactly fill the capacity?",
    prompt:
      "Given distinct part sizes and a target capacity, return how many subsets of the parts sum to exactly the capacity (each part used at most once). Enumerate with backtracking and prune branches that overshoot; state how the pruning bounds the search.",
    group: "dp_backtracking",
    roleRelevance: "general",
    difficulty: "hard",
    primarySkillId: "dsa.recursion.base_case",
    secondarySkillIds: ["dsa.techniques.dynamic_programming"],
    patternTags: ["backtracking", "subset-sum", "pruning"],
    constraints: "1 <= parts <= 30; 1 <= size <= 1e6; 0 <= capacity <= 1e9; sizes are distinct.",
    targetComplexity: "O(2^n) worst case, pruned in practice; sorting enables early cutoff.",
    requiredEdgeCases: ["capacity = 0 (the empty subset counts as one)", "no subset reaches the capacity (0)", "a single part equal to the capacity"],
    clarifyingQuestions: ["Is each part usable at most once?", "Does the empty subset count when the capacity is 0?"],
    hintLadder: [
      "At each part decide include or exclude, recursing on the remaining parts and remaining capacity.",
      "Sort the sizes so that once a partial sum would overshoot, you can prune the rest of that branch.",
      "Count a success each time the remaining capacity reaches exactly 0."
    ],
    visibleExamples: [
      { input: "parts=[2,3,5,7], capacity=7", output: "2", note: "{2,5} and {7}" },
      { input: "parts=[1,2,3], capacity=3", output: "2", note: "{3} and {1,2}" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.dsu.count-clusters",
    version: 1,
    title: "How many clusters form?",
    prompt:
      "You have n nodes labeled 0..n-1 and a list of undirected connection pairs. Two nodes are in the same cluster if a path of connections links them. Return the number of distinct clusters. Use a disjoint-set so each pair is near-constant amortized.",
    group: "union_find",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.trees.disjoint_set",
    secondarySkillIds: ["dsa.graphs.connected_components"],
    patternTags: ["union-find", "connected-components"],
    constraints: "1 <= n <= 2e5; 0 <= pairs <= 2e5; pairs may be duplicated or self-loops.",
    targetComplexity: "O((n + pairs) * alpha(n)) time, O(n) space.",
    requiredEdgeCases: ["no pairs (n clusters)", "duplicate pairs", "a self-loop pair (a, a)"],
    clarifyingQuestions: ["Are the pairs undirected?", "Can a pair repeat or be a self-loop?"],
    hintLadder: [
      "Start with n singleton sets and a count of n.",
      "For each pair, union the two nodes; when a union actually merges two different sets, decrement the count.",
      "Use path compression and union by size/rank to keep operations near-constant."
    ],
    visibleExamples: [
      { input: "n=5, pairs=[(0,1),(1,2),(3,4)]", output: "2", note: "{0,1,2} and {3,4}" },
      { input: "n=4, pairs=[]", output: "4" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.dsu.redundant-link",
    version: 1,
    title: "Which link closes the loop?",
    prompt:
      "A network of n nodes was wired with n undirected links given in order; the links would form a tree except one extra link creates a single cycle. Return the link that, when removed, leaves a connected tree — when more than one qualifies, return the one that appears last in the input.",
    group: "union_find",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.trees.disjoint_set",
    secondarySkillIds: ["dsa.graphs.connected_components"],
    patternTags: ["union-find", "cycle-detection"],
    constraints: "3 <= n <= 2e5; exactly n links; the graph is connected with exactly one cycle.",
    targetComplexity: "O(n * alpha(n)) time, O(n) space.",
    requiredEdgeCases: ["the cycle-closing link is the last one", "a triangle (smallest cycle)", "the extra link connects already-joined nodes early"],
    clarifyingQuestions: ["Are links processed in input order?", "If several links could be removed, do I return the last one in the input?"],
    hintLadder: [
      "Process links in order, unioning their endpoints.",
      "The first link whose endpoints are already in the same set is the one closing the cycle.",
      "Because there is exactly one cycle, that link is the answer; scanning in order makes it the last cycle edge."
    ],
    visibleExamples: [
      { input: "n=3, links=[(0,1),(1,2),(0,2)]", output: "(0, 2)", note: "(0,2) closes the triangle" },
      { input: "n=4, links=[(0,1),(1,2),(2,3),(1,3)]", output: "(1, 3)" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.dsu.earliest-all-connected",
    version: 1,
    title: "Earliest time the fleet is fully connected",
    prompt:
      "You are given n machines and connection events, each with an increasing timestamp, that link two machines from that time on. Return the earliest timestamp at which every machine can reach every other (one connected component), or -1 if they never all connect.",
    group: "union_find",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.trees.disjoint_set",
    secondarySkillIds: ["dsa.graphs.connected_components"],
    patternTags: ["union-find", "connected-components", "timeline"],
    constraints: "1 <= n <= 2e5; 0 <= events <= 2e5; timestamps are non-decreasing in input order.",
    targetComplexity: "O((n + events) * alpha(n)) time, O(n) space.",
    requiredEdgeCases: ["n = 1 (already connected at time 0)", "events that never connect everyone (-1)", "the final merge happens on the last event"],
    clarifyingQuestions: ["Are events given in non-decreasing time order?", "If they never fully connect, do I return -1?"],
    hintLadder: [
      "Keep a component count starting at n; a single machine is trivially connected.",
      "Process events in time order, unioning endpoints and decrementing the count on a real merge.",
      "The moment the count reaches 1, that event's timestamp is the answer; if it never does, return -1."
    ],
    visibleExamples: [
      { input: "n=4, events=[(1,0,1),(2,1,2),(3,0,3)]", output: "3", note: "all four connected after the t=3 event" },
      { input: "n=3, events=[(5,0,1)]", output: "-1", note: "node 2 never connects" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.tree.max-depth",
    version: 1,
    title: "Height of a binary tree",
    prompt:
      "Given a binary tree (described in level order with null for missing children), return its maximum depth: the number of nodes on the longest path from the root down to a leaf. An empty tree has depth 0.",
    group: "trees_bst",
    roleRelevance: "general",
    difficulty: "easy",
    primarySkillId: "dsa.trees.traversal",
    secondarySkillIds: ["dsa.recursion.base_case"],
    patternTags: ["tree", "dfs", "recursion"],
    constraints: "0 <= nodes <= 2e5; the tree may be unbalanced (depth up to the node count).",
    targetComplexity: "O(n) time, O(h) recursion/stack space for height h.",
    requiredEdgeCases: ["empty tree (depth 0)", "single node (depth 1)", "a degenerate left/right chain"],
    clarifyingQuestions: ["Is depth measured in nodes or edges?", "Can the tree be empty?"],
    hintLadder: [
      "The depth of a node is 1 plus the larger of its two child depths.",
      "Recurse to the leaves; a null child contributes depth 0.",
      "For a very deep, unbalanced tree, prefer an explicit stack to avoid recursion limits."
    ],
    visibleExamples: [
      { input: "[3,9,20,null,null,15,7]", output: "3" },
      { input: "[]", output: "0" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.tree.right-side-view",
    version: 1,
    title: "What you see from the right",
    prompt:
      "Given a binary tree in level order, return the value of the last node at each depth — the nodes visible if you look at the tree from the right side, top to bottom.",
    group: "trees_bst",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.trees.traversal",
    secondarySkillIds: ["dsa.trees.traversal_techniques"],
    patternTags: ["tree", "bfs", "level-order"],
    constraints: "0 <= nodes <= 2e5.",
    targetComplexity: "O(n) time, O(width) queue space.",
    requiredEdgeCases: ["empty tree (empty result)", "a left-only chain (each node is its level's rightmost)", "complete tree"],
    clarifyingQuestions: ["Is the output ordered top to bottom?", "If a level's only node is a left child, is it still visible?"],
    hintLadder: [
      "Do a breadth-first traversal level by level.",
      "The last node dequeued at each level is the one visible from the right.",
      "Alternatively, a depth-first walk that visits the right child first records the first node seen at each new depth."
    ],
    visibleExamples: [
      { input: "[1,2,3,null,5,null,4]", output: "[1,3,4]" },
      { input: "[1,2,3,4]", output: "[1,3,4]", note: "level 2's rightmost is the left child 4" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.bst.kth-smallest",
    version: 1,
    title: "k-th smallest in a BST",
    prompt:
      "Given the root of a binary search tree and an integer k (1-indexed), return the k-th smallest value. Use the BST ordering rather than collecting and sorting all values.",
    group: "trees_bst",
    roleRelevance: "storage",
    difficulty: "medium",
    primarySkillId: "dsa.trees.bst_search",
    secondarySkillIds: ["dsa.trees.traversal"],
    patternTags: ["bst", "in-order", "tree"],
    constraints: "1 <= k <= nodes <= 2e5; all values distinct.",
    targetComplexity: "O(h + k) time, O(h) space for height h.",
    requiredEdgeCases: ["k = 1 (the minimum)", "k = nodes (the maximum)", "a right-leaning tree"],
    clarifyingQuestions: ["Is k 1-indexed?", "Are the values guaranteed distinct?"],
    hintLadder: [
      "An in-order traversal of a BST visits values in ascending order.",
      "Walk in-order and stop at the k-th visited node — you need not traverse the whole tree.",
      "An explicit stack lets you pause exactly when the count reaches k."
    ],
    visibleExamples: [
      { input: "BST=[5,3,7,2,4,6,8], k=3", output: "4", note: "in-order 2,3,4,5,6,7,8" },
      { input: "BST=[2,1,3], k=1", output: "1" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.tree.diameter",
    version: 1,
    title: "Longest path through a tree",
    prompt:
      "Given a binary tree in level order, return its diameter: the number of edges on the longest path between any two nodes. The path need not pass through the root.",
    group: "trees_bst",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.trees.tree_diameter",
    secondarySkillIds: ["dsa.trees.traversal"],
    patternTags: ["tree", "dfs", "diameter"],
    constraints: "0 <= nodes <= 2e5.",
    targetComplexity: "O(n) time, O(h) space.",
    requiredEdgeCases: ["single node (diameter 0)", "a straight chain (diameter = nodes - 1)", "the longest path not through the root"],
    clarifyingQuestions: ["Is the diameter counted in edges or nodes?", "Must the path go through the root?"],
    hintLadder: [
      "For each node compute the height of its left and right subtrees.",
      "A path through that node spans left height + right height edges.",
      "Track the maximum such span over all nodes while computing heights in one pass."
    ],
    visibleExamples: [
      { input: "[1,2,3,4,5]", output: "3", note: "4-2-1-3 (or 5-2-1-3) is 3 edges" },
      { input: "[1]", output: "0" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.bst.validate",
    version: 1,
    title: "Is this a valid BST?",
    prompt:
      "Given a binary tree in level order, decide whether it is a valid binary search tree: every node's value is greater than all values in its left subtree and less than all values in its right subtree (strict; no duplicates). Return true or false.",
    group: "trees_bst",
    roleRelevance: "storage",
    difficulty: "medium",
    primarySkillId: "dsa.trees.bst_search",
    secondarySkillIds: ["dsa.trees.traversal"],
    patternTags: ["bst", "tree", "bounds"],
    constraints: "0 <= nodes <= 2e5; values fit in a 64-bit integer.",
    targetComplexity: "O(n) time, O(h) space.",
    requiredEdgeCases: ["a node valid against its parent but not an ancestor bound", "single node (valid)", "values at the 64-bit extremes"],
    clarifyingQuestions: ["Are duplicate values allowed?", "Is an empty tree considered valid?"],
    hintLadder: [
      "Checking only parent-child order is not enough; a node must satisfy bounds from all its ancestors.",
      "Recurse carrying an open (low, high) interval; each node must lie strictly inside it.",
      "Going left tightens the upper bound to the node value; going right tightens the lower bound."
    ],
    visibleExamples: [
      { input: "[2,1,3]", output: "true" },
      { input: "[5,1,4,null,null,3,6]", output: "false", note: "3 and 4 are in 5's right subtree but below 5" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.bst.lowest-common-ancestor",
    version: 1,
    title: "Lowest common ancestor in a BST",
    prompt:
      "Given the root of a binary search tree and two present values a and b, return the value of their lowest common ancestor — the deepest node that has both in its subtrees. Use the BST ordering to avoid searching the whole tree.",
    group: "trees_bst",
    roleRelevance: "storage",
    difficulty: "medium",
    primarySkillId: "dsa.trees.bst_search",
    secondarySkillIds: [],
    patternTags: ["bst", "lca", "tree"],
    constraints: "Both a and b exist in the tree; 1 <= nodes <= 2e5; values distinct.",
    targetComplexity: "O(h) time, O(1) space for height h.",
    requiredEdgeCases: ["one value is an ancestor of the other", "a and b on opposite sides of the root", "a and b adjacent (parent/child)"],
    clarifyingQuestions: ["Are both values guaranteed to be present?", "Can a node be a descendant of itself for LCA purposes?"],
    hintLadder: [
      "Start at the root and compare both values to the current node.",
      "If both are larger, go right; if both are smaller, go left.",
      "The first node where they diverge (or that equals one of them) is the lowest common ancestor."
    ],
    visibleExamples: [
      { input: "BST=[6,2,8,0,4,7,9,null,null,3,5], a=2, b=8", output: "6" },
      { input: "BST=[6,2,8,0,4,7,9,null,null,3,5], a=2, b=4", output: "2", note: "2 is an ancestor of 4" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.list.reverse",
    version: 1,
    title: "Reverse a singly linked list",
    prompt:
      "Given the head of a singly linked list, reverse it in place and return the new head. Rewire the next pointers without allocating a second list.",
    group: "linked_cache",
    roleRelevance: "general",
    difficulty: "easy",
    primarySkillId: "dsa.trees.linked_list",
    secondarySkillIds: [],
    patternTags: ["linked-list", "pointer-rewiring", "in-place"],
    constraints: "0 <= n <= 2e5.",
    targetComplexity: "O(n) time, O(1) extra space.",
    requiredEdgeCases: ["empty list", "single node", "two nodes"],
    clarifyingQuestions: ["Should the reversal be in place (O(1) space)?", "May the list be empty?"],
    hintLadder: [
      "Walk the list keeping prev, curr, and the saved next.",
      "At each step point curr.next back to prev, then advance prev and curr.",
      "When curr becomes null, prev is the new head."
    ],
    visibleExamples: [
      { input: "1->2->3->4", output: "[4,3,2,1]" },
      { input: "(empty)", output: "[]" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.list.merge-sorted",
    version: 1,
    title: "Merge two sorted lists",
    prompt:
      "Given the heads of two ascending sorted singly linked lists, splice their nodes into one ascending sorted list and return its head. Reuse the existing nodes rather than copying values.",
    group: "linked_cache",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.trees.linked_list",
    secondarySkillIds: ["dsa.trees.list_vs_vector"],
    patternTags: ["linked-list", "merge", "two-pointer"],
    constraints: "0 <= total nodes <= 2e5; each input list is sorted ascending.",
    targetComplexity: "O(n + m) time, O(1) extra space.",
    requiredEdgeCases: ["one list empty", "both empty", "fully interleaved values"],
    clarifyingQuestions: ["Are both lists already sorted ascending?", "Should I reuse the nodes rather than copy?"],
    hintLadder: [
      "Use a dummy head and a tail pointer that you append to.",
      "Repeatedly attach the smaller of the two current nodes and advance that list.",
      "When one list runs out, attach the remainder of the other."
    ],
    visibleExamples: [
      { input: "1->3->5 and 2->4->6", output: "[1,2,3,4,5,6]" },
      { input: "(empty) and 1->2", output: "[1,2]" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.list.detect-cycle",
    version: 1,
    title: "Does the list loop back?",
    prompt:
      "Given the head of a singly linked list, determine whether following next pointers ever revisits a node (a cycle). Solve it in constant extra space rather than recording visited nodes.",
    group: "linked_cache",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.trees.linked_list",
    secondarySkillIds: [],
    patternTags: ["linked-list", "fast-slow-pointers", "cycle-detection"],
    constraints: "0 <= n <= 2e5; a cycle, if present, may start at any node.",
    targetComplexity: "O(n) time, O(1) extra space.",
    requiredEdgeCases: ["no cycle", "the whole list is one cycle", "a single node whose next points to itself"],
    clarifyingQuestions: ["Must I use O(1) extra space (no visited set)?", "Can the cycle begin partway through the list?"],
    hintLadder: [
      "Advance a slow pointer one step and a fast pointer two steps each iteration.",
      "If they ever meet, there is a cycle; if fast reaches the end (null), there is none.",
      "The pointers are guaranteed to meet inside a cycle because the gap closes by one each step."
    ],
    visibleExamples: [
      { input: "values=[3,2,0,-4], tail-points-to-index=1", output: "true" },
      { input: "values=[1,2], tail-points-to-index=-1", output: "false", note: "-1 means no cycle" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.cache.lru-design",
    version: 1,
    title: "Design an LRU cache",
    prompt:
      "Design a fixed-capacity cache with get(key) and put(key, value), both O(1). get returns the value or -1 if absent; put inserts or updates and, when over capacity, evicts the least-recently-used entry. Any get or put counts as a use. State the data structures and the invariant that keeps both operations O(1).",
    group: "linked_cache",
    roleRelevance: "storage",
    difficulty: "hard",
    primarySkillId: "dsa.trees.linked_list",
    secondarySkillIds: ["dsa.trees.list_vs_vector"],
    patternTags: ["cache", "doubly-linked-list", "hash-map", "data-structure-design"],
    constraints: "1 <= capacity <= 1e5; up to 2e5 operations; keys and values fit in a 32-bit integer.",
    targetComplexity: "O(1) per get/put, O(capacity) space.",
    requiredEdgeCases: ["get on a missing key (-1)", "put that updates an existing key (no eviction)", "eviction when inserting a new key at capacity"],
    clarifyingQuestions: ["Does a get also count as a recent use?", "On put of an existing key, do I update without evicting?"],
    hintLadder: [
      "Pair a hash map (key -> node) with a doubly linked list ordered by recency.",
      "On access, move the node to the most-recent end; the least-recent end is the eviction target.",
      "The map gives O(1) lookup; the doubly linked list gives O(1) move and evict."
    ],
    visibleExamples: [
      {
        input: "cap=2; put(1,1) put(2,2) get(1) put(3,3) get(2) put(4,4) get(1) get(3) get(4)",
        output: "1 -1 -1 3 4",
        note: "put(3) evicts key 2; put(4) evicts key 1"
      }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.graph.flood-fill",
    version: 1,
    title: "Recolor a connected region",
    prompt:
      "Given a grid of color codes, a start cell, and a new color, recolor the start cell and every cell reachable from it through 4-directional steps over cells of the same original color. Return the updated grid.",
    group: "graphs_paths",
    roleRelevance: "general",
    difficulty: "easy",
    primarySkillId: "dsa.graphs.bfs",
    secondarySkillIds: ["dsa.graphs.dfs"],
    patternTags: ["grid", "flood-fill", "bfs"],
    constraints: "1 <= rows, cols <= 1e3; the start cell is inside the grid.",
    targetComplexity: "O(rows * cols) time and space.",
    requiredEdgeCases: ["new color equals the original (avoid infinite recursion)", "single-cell region", "the whole grid one color"],
    clarifyingQuestions: ["Is connectivity 4-directional (not diagonal)?", "What if the new color already equals the start color?"],
    hintLadder: [
      "Record the start cell's original color, then traverse only same-colored 4-neighbors.",
      "Guard against re-visiting (especially when the new color equals the original) to avoid looping.",
      "BFS from a queue or DFS from a stack both work in O(rows*cols)."
    ],
    visibleExamples: [
      { input: "grid=[[1,1,0],[1,0,0],[0,0,1]], start=(0,0), color=2", output: "[[2,2,0],[2,0,0],[0,0,1]]" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.graph.fewest-hops",
    version: 1,
    title: "Fewest hops between two nodes",
    prompt:
      "Given an undirected unweighted graph and two nodes, return the minimum number of edges on a path between them, or -1 if they are not connected. Think hops in a flat network.",
    group: "graphs_paths",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.graphs.bfs",
    secondarySkillIds: ["dsa.graphs.representation"],
    patternTags: ["bfs", "shortest-path", "unweighted"],
    constraints: "1 <= nodes <= 2e5; 0 <= edges <= 4e5; the graph may be disconnected.",
    targetComplexity: "O(nodes + edges) time and space.",
    requiredEdgeCases: ["source equals destination (0 hops)", "unreachable destination (-1)", "multiple shortest paths"],
    clarifyingQuestions: ["Is the graph unweighted?", "Should unreachable return -1?"],
    hintLadder: [
      "Breadth-first search explores nodes in increasing distance from the source.",
      "Track each node's distance as you first reach it; the first time you pop the destination is its shortest hop count.",
      "If BFS finishes without reaching the destination, return -1."
    ],
    visibleExamples: [
      { input: "n=5, edges=[(0,1),(1,2),(2,3),(0,4),(4,3)], src=0, dst=3", output: "2", note: "0-4-3" },
      { input: "n=3, edges=[(0,1)], src=0, dst=2", output: "-1" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.graph.count-regions",
    version: 1,
    title: "How many regions in the grid?",
    prompt:
      "Given a grid of 1s (filled) and 0s (empty), return the number of regions of filled cells, where cells join through 4-directional adjacency. A region is a maximal connected blob of 1s.",
    group: "graphs_paths",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.graphs.connected_components",
    secondarySkillIds: ["dsa.graphs.dfs"],
    patternTags: ["grid", "connected-components", "dfs"],
    constraints: "1 <= rows, cols <= 1e3; cells are 0 or 1.",
    targetComplexity: "O(rows * cols) time and space.",
    requiredEdgeCases: ["all zeros (0 regions)", "all ones (1 region)", "diagonal-only touching cells (separate regions)"],
    clarifyingQuestions: ["Is adjacency 4-directional only?", "Do diagonally touching filled cells count as connected?"],
    hintLadder: [
      "Scan every cell; when you find an unvisited 1, you have found a new region.",
      "Flood that region (BFS/DFS) marking all its cells visited so it is counted once.",
      "The number of times you start a new flood is the region count."
    ],
    visibleExamples: [
      { input: "grid=[[1,1,0],[1,1,0],[0,0,1]]", output: "2" },
      { input: "grid=[[0,0],[0,0]]", output: "0" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.graph.two-colorable",
    version: 1,
    title: "Can the graph be two-colored?",
    prompt:
      "Given an undirected graph, decide whether the nodes can be split into two groups so that every edge connects nodes in different groups (the graph is bipartite). Return true or false.",
    group: "graphs_paths",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.graphs.bipartite_scc",
    secondarySkillIds: ["dsa.graphs.bfs"],
    patternTags: ["bipartite", "two-coloring", "bfs"],
    constraints: "1 <= nodes <= 2e5; 0 <= edges <= 4e5; the graph may be disconnected.",
    targetComplexity: "O(nodes + edges) time and space.",
    requiredEdgeCases: ["an odd cycle (not bipartite)", "an even cycle (bipartite)", "a disconnected graph (every component must be bipartite)"],
    clarifyingQuestions: ["Is the graph undirected?", "Must every connected component be checked?"],
    hintLadder: [
      "Color a starting node, then alternate colors as you traverse its neighbors.",
      "If you ever reach an already-colored node with the same color as the current node, it is not bipartite.",
      "Repeat for every uncolored component; an odd cycle is exactly what breaks two-coloring."
    ],
    visibleExamples: [
      { input: "n=4, edges=[(0,1),(1,2),(2,3),(3,0)]", output: "true", note: "even cycle" },
      { input: "n=3, edges=[(0,1),(1,2),(2,0)]", output: "false", note: "odd cycle" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.graph.has-directed-cycle",
    version: 1,
    title: "Is there a dependency cycle?",
    prompt:
      "Given a directed graph of tasks and 'must run before' edges, return whether the graph contains a cycle (which would make the dependencies impossible to satisfy). Return true if a cycle exists.",
    group: "graphs_paths",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.graphs.cycle_detection",
    secondarySkillIds: ["dsa.graphs.dfs", "dsa.graphs.topological_sort"],
    patternTags: ["directed-graph", "cycle-detection", "dfs"],
    constraints: "1 <= nodes <= 2e5; 0 <= edges <= 4e5; edges are directed and may repeat.",
    targetComplexity: "O(nodes + edges) time and space.",
    requiredEdgeCases: ["a self-loop (cycle)", "a DAG (no cycle)", "a back edge deep in the traversal"],
    clarifyingQuestions: ["Are the edges directed?", "Does a self-loop count as a cycle?"],
    hintLadder: [
      "Run DFS tracking three states per node: unvisited, on the current stack, and finished.",
      "A directed cycle exists exactly when DFS reaches a node currently on the recursion stack (a back edge).",
      "Equivalently, Kahn's topological sort that cannot place every node implies a cycle."
    ],
    visibleExamples: [
      { input: "n=3, edges=[(0,1),(1,2),(2,0)]", output: "true" },
      { input: "n=3, edges=[(0,1),(1,2)]", output: "false" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.graph.cheapest-route",
    version: 1,
    title: "Cheapest route with non-negative costs",
    prompt:
      "Given a weighted graph with non-negative edge costs, return the minimum total cost to travel from a source node to a destination, or -1 if unreachable. Edges model link latencies between machines.",
    group: "graphs_paths",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.graphs.shortest_path_algorithms",
    secondarySkillIds: ["dsa.graphs.shortest_path"],
    patternTags: ["dijkstra", "shortest-path", "weighted", "min-heap"],
    constraints: "1 <= nodes <= 2e5; 0 <= edges <= 4e5; 0 <= weight <= 1e9; totals may exceed 32 bits.",
    targetComplexity: "O((nodes + edges) log nodes) time with a binary heap.",
    requiredEdgeCases: ["unreachable destination (-1)", "source equals destination (0)", "multiple routes of equal cost"],
    clarifyingQuestions: ["Are all edge weights non-negative (so Dijkstra applies)?", "Should unreachable return -1?"],
    hintLadder: [
      "Keep the best known distance to each node; start the source at 0 and others at infinity.",
      "Use a min-heap to always expand the closest unfinalized node, relaxing its outgoing edges.",
      "Once the destination is popped its distance is final; use 64-bit sums to avoid overflow."
    ],
    visibleExamples: [
      { input: "n=4, edges=[(0,1,4),(0,2,1),(2,1,2),(1,3,1),(2,3,5)], src=0, dst=3", output: "4", note: "0-2-1-3 = 1+2+1" },
      { input: "n=2, edges=[], src=0, dst=1", output: "-1" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.graph.min-spanning-cost",
    version: 1,
    title: "Cheapest way to connect everything",
    prompt:
      "Given a connected undirected weighted graph, return the minimum total edge weight needed to keep every node connected (a minimum spanning tree). Think cheapest set of links that still connects the whole fleet.",
    group: "graphs_paths",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.graphs.mst",
    secondarySkillIds: ["dsa.trees.disjoint_set"],
    patternTags: ["mst", "kruskal", "greedy", "union-find"],
    constraints: "1 <= nodes <= 2e5; nodes-1 <= edges <= 4e5; 0 <= weight <= 1e9; the graph is connected.",
    targetComplexity: "O(edges log edges) time with Kruskal + union-find.",
    requiredEdgeCases: ["a single node (cost 0)", "parallel edges between the same pair", "ties in edge weight"],
    clarifyingQuestions: ["Is the graph guaranteed connected?", "Can there be parallel edges of different weights?"],
    hintLadder: [
      "Sort all edges by weight ascending.",
      "Add each edge whose endpoints are not already connected (union-find), skipping ones that would form a cycle.",
      "Stop once nodes-1 edges are chosen; their total weight is the MST cost."
    ],
    visibleExamples: [
      { input: "n=4, edges=[(0,1,1),(1,2,2),(0,2,2),(2,3,3)]", output: "6", note: "1 + 2 + 3" },
      { input: "n=1, edges=[]", output: "0" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.heap.kth-largest-stream",
    version: 1,
    title: "Running k-th largest reading",
    prompt:
      "Process readings one at a time and, after each, report the k-th largest reading seen so far, or -1 until at least k readings have arrived. Keep only what you need rather than re-sorting the whole history.",
    group: "heaps_topk_streaming",
    roleRelevance: "streaming",
    difficulty: "medium",
    primarySkillId: "dsa.trees.heap_applications",
    secondarySkillIds: ["dsa.trees.heap"],
    patternTags: ["min-heap", "top-k", "streaming"],
    constraints: "1 <= k; 1 <= readings <= 2e5; values fit in a 32-bit integer.",
    targetComplexity: "O(log k) per reading, O(k) space.",
    requiredEdgeCases: ["fewer than k readings so far (-1)", "duplicate values", "a new reading that does not enter the top k"],
    clarifyingQuestions: ["Is the k-th largest by value (duplicates counted)?", "What should be reported before k readings exist?"],
    hintLadder: [
      "Keep a size-k min-heap holding the k largest readings seen so far.",
      "On each reading, push it; if the heap exceeds k, pop the smallest.",
      "Once the heap holds k items, its smallest (the root) is the k-th largest."
    ],
    visibleExamples: [
      { input: "k=3, stream=[4,5,8,2]", output: "[-1,-1,4,4]", note: "3rd largest of {4,5,8} and {4,5,8,2} is 4" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.heap.merge-k-sorted",
    version: 1,
    title: "Merge k sorted streams",
    prompt:
      "Given k ascending-sorted sequences, merge them into one ascending sequence. Avoid concatenating then sorting; use the fact that each input is already sorted.",
    group: "heaps_topk_streaming",
    roleRelevance: "streaming",
    difficulty: "medium",
    primarySkillId: "dsa.trees.heap_applications",
    secondarySkillIds: ["dsa.sorting.comparator"],
    patternTags: ["min-heap", "k-way-merge"],
    constraints: "1 <= k <= 1e5; total elements N up to 2e5; each input sorted ascending.",
    targetComplexity: "O(N log k) time, O(k) heap space.",
    requiredEdgeCases: ["some sequences empty", "all sequences empty (empty result)", "duplicate values across sequences"],
    clarifyingQuestions: ["Are all inputs sorted ascending?", "Should equal values from different sequences both appear?"],
    hintLadder: [
      "Put the first element of each non-empty sequence into a min-heap keyed by value.",
      "Pop the smallest, append it, and push the next element from that same sequence.",
      "Repeat until the heap empties; the heap never exceeds k entries."
    ],
    visibleExamples: [
      { input: "[[1,4,7],[2,5],[3,6]]", output: "[1,2,3,4,5,6,7]" },
      { input: "[[],[2],[]]", output: "[2]" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.heap.k-closest-points",
    version: 1,
    title: "k closest points to the origin",
    prompt:
      "Given a list of 2D points and an integer k, return the k points nearest the origin (by Euclidean distance), ordered from closest to farthest. Compare squared distances to avoid floating point.",
    group: "heaps_topk_streaming",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.trees.heap",
    secondarySkillIds: ["dsa.sorting.comparator"],
    patternTags: ["max-heap", "top-k", "selection"],
    constraints: "1 <= k <= points <= 2e5; coordinates fit in a 32-bit integer (use 64-bit for squared distance).",
    targetComplexity: "O(n log k) time, O(k) space.",
    requiredEdgeCases: ["k equals the number of points", "ties in distance", "a point at the origin"],
    clarifyingQuestions: ["Should I compare squared distances to avoid floating point?", "How are distance ties ordered?"],
    hintLadder: [
      "Keep a size-k max-heap keyed by squared distance.",
      "Push each point; when the heap exceeds k, pop the farthest so only the k closest remain.",
      "Drain and reverse (or sort the k survivors) to list them closest-first."
    ],
    visibleExamples: [
      { input: "points=[(1,3),(-2,2),(5,8),(0,1)], k=2", output: "[(0,1),(-2,2)]", note: "squared distances 1 and 8" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.heap.running-median",
    version: 1,
    title: "Running median of a stream",
    prompt:
      "Process numeric readings one at a time and, after each, report the median of all readings so far. For an even count, the median is the average of the two middle values. Aim for logarithmic work per reading.",
    group: "heaps_topk_streaming",
    roleRelevance: "streaming",
    difficulty: "hard",
    primarySkillId: "dsa.trees.heap_applications",
    secondarySkillIds: ["dsa.trees.heap"],
    patternTags: ["two-heaps", "median", "streaming"],
    constraints: "1 <= readings <= 2e5; values fit in a 32-bit integer.",
    targetComplexity: "O(log n) per reading, O(n) space.",
    requiredEdgeCases: ["a single reading", "even count (average the two middles)", "all equal readings"],
    clarifyingQuestions: ["For an even count, is the median the average of the two middles?", "Can readings repeat?"],
    hintLadder: [
      "Keep a max-heap of the lower half and a min-heap of the upper half, balanced in size.",
      "Insert into the correct half, then rebalance so their sizes differ by at most one.",
      "The median is the larger heap's top, or the average of both tops when the sizes are equal."
    ],
    visibleExamples: [
      { input: "stream=[5,15,1,3]", output: "[5,10,5,4]", note: "medians of [5], [5,15], [1,5,15], [1,3,5,15]" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.heap.task-cooldown",
    version: 1,
    title: "Schedule tasks with a cooldown",
    prompt:
      "Given counts of task types and a cooldown of n time units required between two runs of the same type, return the minimum number of time units (each unit runs one task or idles) to finish every task. Run the most pressing type as often as the cooldown allows.",
    group: "heaps_topk_streaming",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.trees.heap_applications",
    secondarySkillIds: ["dsa.techniques.greedy"],
    patternTags: ["max-heap", "greedy", "scheduling"],
    constraints: "1 <= total tasks <= 2e5; 0 <= n <= 1e4; task types are a small alphabet.",
    targetComplexity: "O(total log types) time, O(types) space.",
    requiredEdgeCases: ["n = 0 (no idling, answer is the task count)", "one dominant type forcing idles", "many types so no idle is ever needed"],
    clarifyingQuestions: ["Does each time unit run exactly one task or an idle?", "Is the cooldown the minimum gap between identical types?"],
    hintLadder: [
      "Greedily run the type with the most remaining count, then the next most, cycling through a window of size n+1.",
      "A max-heap by remaining count picks the most pressing runnable type each step.",
      "Idle only when every remaining type is still cooling down; the busiest type's count drives any idling."
    ],
    visibleExamples: [
      { input: "tasks=[A,A,A,B,B,B], n=2", output: "8", note: "A B idle A B idle A B" },
      { input: "tasks=[A,A,A,B,B,B], n=0", output: "6" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.hash.pair-sums-to-target",
    version: 1,
    title: "Two values that hit the target",
    prompt:
      "Given an array of integers and a target, return the indices of the two distinct positions whose values sum to the target. Exactly one such pair exists. Solve it in one pass rather than checking every pair.",
    group: "arrays_hashing_prefix",
    roleRelevance: "general",
    difficulty: "easy",
    primarySkillId: "dsa.arrays.traversal",
    secondarySkillIds: ["dsa.arrays.indexing"],
    patternTags: ["hash-map", "single-pass"],
    constraints: "2 <= n <= 2e5; exactly one valid pair; values and target fit in a 64-bit integer.",
    targetComplexity: "O(n) time, O(n) space.",
    requiredEdgeCases: ["the pair includes the first element", "negative values", "two equal values forming the pair"],
    clarifyingQuestions: ["Is exactly one pair guaranteed?", "May the same index be used twice (no)?"],
    hintLadder: [
      "As you scan, remember each value's index in a hash map.",
      "For the current value v, check whether target - v was already seen.",
      "If so, return that stored index and the current index."
    ],
    visibleExamples: [
      { input: "nums=[2,7,11,15], target=9", output: "[0,1]" },
      { input: "nums=[3,2,4], target=6", output: "[1,2]" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.hash.most-frequent",
    version: 1,
    title: "Most frequent value",
    prompt:
      "Given an array of integers, return the value that occurs most often; if several tie for the highest count, return the smallest such value. One pass to count, then pick the winner.",
    group: "arrays_hashing_prefix",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.arrays.traversal",
    secondarySkillIds: ["dsa.sorting.comparator"],
    patternTags: ["hash-map", "counting", "tie-break"],
    constraints: "1 <= n <= 2e5; values fit in a 32-bit integer.",
    targetComplexity: "O(n) time, O(distinct) space.",
    requiredEdgeCases: ["all values distinct (smallest wins on a 1-1 tie)", "a single dominant value", "a tie broken by smaller value"],
    clarifyingQuestions: ["How are count ties broken?", "Can the array contain negatives?"],
    hintLadder: [
      "Build a value -> count map in one pass.",
      "Scan the map tracking the best (highest count, then smallest value).",
      "Return that value."
    ],
    visibleExamples: [
      { input: "[1,3,3,2,3,2]", output: "3" },
      { input: "[4,4,5,5]", output: "4", note: "tie on count -> smaller value" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.prefix.range-sum-queries",
    version: 1,
    title: "Answer many range-sum queries",
    prompt:
      "Given a fixed array and many queries (l, r), return the sum of elements from index l to r inclusive for each query. The array does not change, so precompute once and answer each query in O(1).",
    group: "arrays_hashing_prefix",
    roleRelevance: "storage",
    difficulty: "medium",
    primarySkillId: "dsa.techniques.prefix_sums",
    secondarySkillIds: ["dsa.techniques.range_structures"],
    patternTags: ["prefix-sum", "range-query"],
    constraints: "1 <= n <= 2e5; 1 <= queries <= 2e5; 0 <= l <= r < n; sums may exceed 32 bits.",
    targetComplexity: "O(n) precompute, O(1) per query.",
    requiredEdgeCases: ["single-element range (l == r)", "the whole array", "sums that overflow 32 bits"],
    clarifyingQuestions: ["Is the array immutable between queries?", "Are query bounds inclusive?"],
    hintLadder: [
      "Build prefix[i] = sum of the first i elements (prefix[0] = 0).",
      "The sum of [l, r] is prefix[r+1] - prefix[l].",
      "Use a 64-bit prefix array so large totals do not overflow."
    ],
    visibleExamples: [
      { input: "a=[2,4,1,3], queries=[(0,2),(1,3)]", output: "[7,8]", note: "2+4+1 and 4+1+3" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.prefix.subarrays-sum-k",
    version: 1,
    title: "Count subarrays summing to k",
    prompt:
      "Given an array of integers (which may be negative) and a target k, return the number of contiguous subarrays whose elements sum to exactly k. Aim for one pass rather than checking every subarray.",
    group: "arrays_hashing_prefix",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.techniques.prefix_sums",
    secondarySkillIds: ["dsa.arrays.traversal"],
    patternTags: ["prefix-sum", "hash-map", "counting"],
    constraints: "1 <= n <= 2e5; values fit in a 32-bit integer; running sums may exceed 32 bits.",
    targetComplexity: "O(n) time, O(n) space.",
    requiredEdgeCases: ["negative values", "k = 0", "overlapping qualifying subarrays"],
    clarifyingQuestions: ["Can values be negative (so the window is not monotonic)?", "Do overlapping subarrays each count?"],
    hintLadder: [
      "Track the running prefix sum and a map from prefix value to how many times it has occurred.",
      "A subarray ending here sums to k exactly when a prior prefix equals current - k.",
      "Add the count of that prior prefix, then record the current prefix; start the map with prefix 0 seen once."
    ],
    visibleExamples: [
      { input: "nums=[1,1,1], k=2", output: "2" },
      { input: "nums=[1,2,3], k=3", output: "2", note: "[1,2] and [3]" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.hash.longest-consecutive-run",
    version: 1,
    title: "Longest run of consecutive integers",
    prompt:
      "Given an unsorted array of integers, return the length of the longest set of consecutive integers present (order in the array does not matter). Aim for linear time using a hash set rather than sorting.",
    group: "arrays_hashing_prefix",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.arrays.traversal",
    secondarySkillIds: ["dsa.strings.hashing"],
    patternTags: ["hash-set", "sequence"],
    constraints: "0 <= n <= 2e5; values fit in a 32-bit integer; duplicates may appear.",
    targetComplexity: "O(n) time, O(n) space.",
    requiredEdgeCases: ["empty array (0)", "duplicates", "negative values bridging a run"],
    clarifyingQuestions: ["Does the run need to be contiguous in the array or just present?", "Do duplicates affect the length?"],
    hintLadder: [
      "Put all values in a hash set for O(1) membership.",
      "Only start counting a run at a value whose predecessor (v - 1) is absent — that is a run's left end.",
      "Extend rightward while v + 1 is present, tracking the longest run."
    ],
    visibleExamples: [
      { input: "[100,4,200,1,3,2]", output: "4", note: "1,2,3,4" },
      { input: "[0,0,-1]", output: "2", note: "-1,0" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.prefix.longest-equal-binary",
    version: 1,
    title: "Longest balanced 0/1 stretch",
    prompt:
      "Given an array of 0s and 1s, return the length of the longest contiguous subarray containing equal numbers of 0s and 1s. Map 0 to -1 and use prefix sums so a balanced stretch is one where a prefix value repeats.",
    group: "arrays_hashing_prefix",
    roleRelevance: "streaming",
    difficulty: "medium",
    primarySkillId: "dsa.techniques.prefix_sums",
    secondarySkillIds: ["dsa.arrays.traversal"],
    patternTags: ["prefix-sum", "hash-map", "balance"],
    constraints: "0 <= n <= 2e5; elements are 0 or 1.",
    targetComplexity: "O(n) time, O(n) space.",
    requiredEdgeCases: ["no balanced stretch (0)", "the whole array balanced", "ties in length"],
    clarifyingQuestions: ["Are elements strictly 0 or 1?", "Is a length-0 answer acceptable when none balances?"],
    hintLadder: [
      "Treat 0 as -1; then a balanced subarray is one whose elements sum to 0.",
      "A zero-sum subarray ends here when the current prefix equals a prefix seen earlier.",
      "Store the first index each prefix value appears; the distance to a later repeat is a balanced length."
    ],
    visibleExamples: [
      { input: "[0,1]", output: "2" },
      { input: "[0,1,1,0]", output: "4" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.twoptr.pair-sum-sorted",
    version: 1,
    title: "Target pair in a sorted array",
    prompt:
      "Given an array sorted ascending and a target, return the indices of the two distinct positions whose values sum to the target, or [-1,-1] if none. Use the sorted order to avoid a hash map or nested loops.",
    group: "two_pointers_sliding_window",
    roleRelevance: "general",
    difficulty: "easy",
    primarySkillId: "dsa.arrays.two_pointers",
    secondarySkillIds: ["dsa.arrays.indexing"],
    patternTags: ["two-pointer", "sorted", "converging"],
    constraints: "0 <= n <= 2e5; array sorted ascending; values and target fit in a 64-bit integer.",
    targetComplexity: "O(n) time, O(1) extra space.",
    requiredEdgeCases: ["no valid pair ([-1,-1])", "the pair is the two ends", "negative values"],
    clarifyingQuestions: ["Is the array guaranteed sorted ascending?", "What to return when no pair exists?"],
    hintLadder: [
      "Place one pointer at the start and one at the end.",
      "If the current sum is too small move the left pointer right; if too large move the right pointer left.",
      "Because the array is sorted, this scans each element at most once."
    ],
    visibleExamples: [
      { input: "a=[1,2,4,7,11], target=15", output: "[2,4]", note: "4 + 11" },
      { input: "a=[2,3,4], target=10", output: "[-1,-1]" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.twoptr.is-palindrome",
    version: 1,
    title: "Palindrome after cleaning",
    prompt:
      "Given a string, decide whether it reads the same forward and backward when you ignore case and any non-alphanumeric characters. Return true or false using two converging pointers without building a cleaned copy.",
    group: "two_pointers_sliding_window",
    roleRelevance: "general",
    difficulty: "easy",
    primarySkillId: "dsa.arrays.two_pointers",
    secondarySkillIds: [],
    patternTags: ["two-pointer", "string", "converging"],
    constraints: "0 <= length <= 2e5; characters are printable ASCII.",
    targetComplexity: "O(n) time, O(1) extra space.",
    requiredEdgeCases: ["empty string (true)", "only punctuation (true)", "mixed case and spaces"],
    clarifyingQuestions: ["Do I ignore case and punctuation?", "Is an empty string a palindrome?"],
    hintLadder: [
      "Start a pointer at each end.",
      "Skip characters that are not alphanumeric, then compare the two in a case-insensitive way.",
      "If any compared pair differs it is not a palindrome; stop when the pointers cross."
    ],
    visibleExamples: [
      { input: "\"Race car!\"", output: "true", note: "cleans to racecar" },
      { input: "\"hello\"", output: "false" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.sliding.longest-distinct",
    version: 1,
    title: "Longest window with all distinct",
    prompt:
      "Given a sequence, return the length of the longest contiguous window in which no element repeats. Grow and shrink a window rather than re-scanning each start.",
    group: "two_pointers_sliding_window",
    roleRelevance: "streaming",
    difficulty: "medium",
    primarySkillId: "dsa.techniques.sliding_window",
    secondarySkillIds: ["dsa.arrays.two_pointers"],
    patternTags: ["sliding-window", "hash-set", "distinct"],
    constraints: "0 <= n <= 2e5; elements drawn from a comparable alphabet.",
    targetComplexity: "O(n) time, O(window) space.",
    requiredEdgeCases: ["all elements equal (length 1)", "all distinct (length n)", "empty input (0)"],
    clarifyingQuestions: ["Is the window contiguous?", "Should an empty input return 0?"],
    hintLadder: [
      "Expand the right edge, recording the last index of each element.",
      "When a repeat appears inside the window, move the left edge just past the previous occurrence.",
      "Track the maximum width while the window stays free of repeats."
    ],
    visibleExamples: [
      { input: "\"abcabcbb\"", output: "3", note: "abc" },
      { input: "\"bbbb\"", output: "1" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.twoptr.most-water",
    version: 1,
    title: "Most water between two lines",
    prompt:
      "Given vertical line heights at successive positions, pick two lines so that they and the x-axis hold the most water. The area is the shorter height times the horizontal distance. Return the maximum area.",
    group: "two_pointers_sliding_window",
    roleRelevance: "general",
    difficulty: "hard",
    primarySkillId: "dsa.arrays.two_pointers",
    secondarySkillIds: [],
    patternTags: ["two-pointer", "greedy", "converging"],
    constraints: "2 <= n <= 2e5; 0 <= height[i] <= 1e9; areas may exceed 32 bits.",
    targetComplexity: "O(n) time, O(1) extra space.",
    requiredEdgeCases: ["two lines only", "all equal heights", "a single tall line that cannot be paired well"],
    clarifyingQuestions: ["Is the area bounded by the shorter of the two lines?", "Do the lines have zero width?"],
    hintLadder: [
      "Start a pointer at each end; the width is largest here.",
      "The area is limited by the shorter line, so move the pointer at the shorter line inward.",
      "Moving the taller line in could only lose width without raising the limiting height; track the best area as you converge."
    ],
    visibleExamples: [
      { input: "heights=[1,8,6,2,5,4,8,3,7]", output: "49", note: "lines at index 1 and 8: min(8,7)*7" },
      { input: "heights=[1,1]", output: "1" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.intervals.merge-overlapping",
    version: 1,
    title: "Merge overlapping intervals",
    prompt:
      "Given a list of closed intervals [start, end], merge every set that overlaps or touches into the fewest disjoint intervals and return them sorted by start. Two intervals merge when one's start is <= the other's end.",
    group: "intervals_sweepline",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.techniques.interval_scheduling",
    secondarySkillIds: ["dsa.sorting.comparator"],
    patternTags: ["intervals", "sort", "merge"],
    constraints: "0 <= n <= 2e5; start <= end; coordinates fit in a 64-bit integer.",
    targetComplexity: "O(n log n) time (sort), O(n) output.",
    requiredEdgeCases: ["fully nested intervals", "touching intervals like [1,2] and [2,3]", "already disjoint input"],
    clarifyingQuestions: ["Do touching intervals ([1,2],[2,3]) merge?", "Is the input already sorted?"],
    hintLadder: [
      "Sort the intervals by start.",
      "Walk them keeping the current merged interval; if the next start is <= the current end, extend the end to the max.",
      "Otherwise emit the current interval and start a new one."
    ],
    visibleExamples: [
      { input: "[(1,3),(2,6),(8,10),(15,18)]", output: "[(1,6),(8,10),(15,18)]" },
      { input: "[(1,4),(4,5)]", output: "[(1,5)]", note: "touching merges" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.intervals.insert",
    version: 1,
    title: "Insert into a disjoint interval set",
    prompt:
      "Given a list of disjoint closed intervals sorted by start, insert a new interval and merge any it overlaps, returning the result still sorted and disjoint. Do it in one linear pass over the existing intervals.",
    group: "intervals_sweepline",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.techniques.interval_scheduling",
    secondarySkillIds: [],
    patternTags: ["intervals", "merge", "single-pass"],
    constraints: "0 <= n <= 2e5; existing intervals disjoint and sorted; coordinates fit in a 64-bit integer.",
    targetComplexity: "O(n) time, O(n) output.",
    requiredEdgeCases: ["new interval before all / after all", "new interval spanning several existing ones", "no overlap (simple insert)"],
    clarifyingQuestions: ["Are the existing intervals guaranteed disjoint and sorted?", "Do touching intervals merge?"],
    hintLadder: [
      "Copy intervals that end before the new one starts.",
      "Merge every interval that overlaps the new one by widening the new interval's start/end.",
      "Append the merged interval, then copy the intervals that start after it ends."
    ],
    visibleExamples: [
      { input: "existing=[(1,3),(6,9)], new=(2,5)", output: "[(1,5),(6,9)]" },
      { input: "existing=[(1,2),(7,9)], new=(3,5)", output: "[(1,2),(3,5),(7,9)]" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.intervals.min-rooms",
    version: 1,
    title: "Fewest rooms for all meetings",
    prompt:
      "Given meeting half-open intervals [start, end) (a meeting frees its room exactly at end), return the minimum number of rooms needed so no two meetings sharing a room overlap. Think peak simultaneous occupancy.",
    group: "intervals_sweepline",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.techniques.range_structures",
    secondarySkillIds: ["dsa.techniques.interval_scheduling"],
    patternTags: ["intervals", "sweep-line", "min-heap"],
    constraints: "0 <= n <= 2e5; start < end; coordinates fit in a 64-bit integer.",
    targetComplexity: "O(n log n) time, O(n) space.",
    requiredEdgeCases: ["a meeting that ends exactly when another starts (shares a room)", "all meetings overlap", "no meetings (0)"],
    clarifyingQuestions: ["Are intervals half-open so end == next start can reuse a room?", "Can there be zero meetings?"],
    hintLadder: [
      "Separate the start and end times and sweep them in increasing order.",
      "Each start needs a room (+1); each end frees one (-1); process an end before a start at the same coordinate.",
      "The running maximum of concurrent meetings is the room count (a min-heap of end times gives the same answer)."
    ],
    visibleExamples: [
      { input: "[(0,30),(5,10),(15,20)]", output: "2", note: "(0,30) overlaps each of the others" },
      { input: "[(1,5),(5,9)]", output: "1", note: "second starts as the first ends" }
    ],
    externalLinks: [CPALGO]
  },
  {
    id: "iv.intervals.max-non-overlapping",
    version: 1,
    title: "Most activities without conflict",
    prompt:
      "Given activities as closed intervals [start, end], return the maximum number you can select so that no two selected activities overlap (sharing only an endpoint is allowed). This is the classic activity-selection problem.",
    group: "intervals_sweepline",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.techniques.greedy",
    secondarySkillIds: ["dsa.techniques.interval_scheduling"],
    patternTags: ["intervals", "greedy", "activity-selection"],
    constraints: "0 <= n <= 2e5; start <= end; coordinates fit in a 64-bit integer.",
    targetComplexity: "O(n log n) time (sort by end), O(1) extra space.",
    requiredEdgeCases: ["all intervals overlap (select 1)", "all disjoint (select all)", "intervals touching at endpoints (both selectable)"],
    clarifyingQuestions: ["Does sharing only an endpoint count as non-overlapping?", "Do I return the count, not the set?"],
    hintLadder: [
      "Sort the activities by end time.",
      "Greedily take an activity whenever its start is >= the end of the last one taken.",
      "Each taken activity frees the most future room, maximizing the count."
    ],
    visibleExamples: [
      { input: "[(1,2),(2,3),(3,4),(1,3)]", output: "3", note: "take (1,2),(2,3),(3,4); drop (1,3)" },
      { input: "[(1,10),(2,3),(4,5)]", output: "2" }
    ],
    externalLinks: [USACO]
  },
  {
    id: "iv.cpp.iterator-invalidation",
    version: 1,
    title: "Why does this vector loop crash?",
    prompt:
      "A function walks a std::vector<int> v and, for every even value, appends value*2 to the same vector while iterating: `for (auto it = v.begin(); it != v.end(); ++it) { if (*it % 2 == 0) v.push_back(*it * 2); }`. It sometimes crashes or skips elements. Explain the defect and give a fix that does not read freed memory.",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "cpp.stl.iterators",
    secondarySkillIds: ["dsa.arrays.traversal"],
    patternTags: ["debugging", "cpp", "iterator-invalidation"],
    constraints: "Standard C++17/20; v may need to grow beyond its current capacity.",
    targetComplexity: "Explanation plus an O(n)-pass fix; reasoning, not new algorithms.",
    requiredEdgeCases: ["push_back triggers reallocation (it is dangling)", "no reallocation by luck (latent bug)", "appended elements re-processed if end is recomputed naively"],
    clarifyingQuestions: ["Does push_back ever exceed the current capacity?", "Should newly appended values themselves be processed?"],
    hintLadder: [
      "push_back can reallocate the vector's buffer, which invalidates all existing iterators (including it and end()).",
      "After a reallocation, ++it and *it touch freed memory — undefined behavior.",
      "Fix by collecting the new values into a separate vector and appending after the loop, or by indexing up to the original size captured before the loop."
    ],
    visibleExamples: [
      {
        input: "v=[2,4]; append value*2 while iterating",
        output: "iterator invalidated on reallocation (undefined behavior)",
        note: "capture the original size or buffer the additions instead"
      }
    ],
    externalLinks: [CPPREF]
  },
  {
    id: "iv.cpp.dangling-reference",
    version: 1,
    title: "Spot the dangling reference",
    prompt:
      "A helper builds a label and returns a reference to it: `const std::string& makeLabel(int id) { std::string s = \"node-\" + std::to_string(id); return s; }`, and callers later read the returned reference. Reads return garbage. Explain the lifetime bug and the correct fix.",
    group: "cpp_implementation",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "cpp.references.pointers",
    secondarySkillIds: ["cpp.raii.resource_lifetime"],
    patternTags: ["debugging", "cpp", "lifetime"],
    constraints: "Standard C++17/20; the local string is destroyed when the function returns.",
    targetComplexity: "Explanation plus the fix; reasoning, not new algorithms.",
    requiredEdgeCases: ["returning a reference to a local", "returning a reference to a function parameter by value", "binding a reference to a temporary that then dies"],
    clarifyingQuestions: ["What is the lifetime of the local string s?", "Is returning by value acceptable here?"],
    hintLadder: [
      "The local s is destroyed when makeLabel returns, so the returned reference dangles.",
      "Reading through a reference to a destroyed object is undefined behavior.",
      "Return by value (return std::string) — copy elision/move makes this cheap — rather than returning a reference to a local."
    ],
    visibleExamples: [
      {
        input: "const std::string& makeLabel(int id) { std::string s = ...; return s; }",
        output: "returns a reference to a destroyed local (dangling); return by value instead"
      }
    ],
    externalLinks: [CPPREF]
  },
  {
    id: "iv.cpp.missing-virtual-destructor",
    version: 1,
    title: "Deleting through a base pointer leaks",
    prompt:
      "A factory returns owned objects as a base pointer: `Base* make();` where Derived adds members that own resources, and callers `delete` the returned Base*. Base's destructor is not virtual. Resources leak and behavior is undefined. Explain why, and give the fix and a safer ownership approach.",
    group: "cpp_implementation",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "cpp.oop.polymorphic_ownership",
    secondarySkillIds: ["cpp.smart_pointers.unique_ptr"],
    patternTags: ["debugging", "cpp-design", "ownership", "polymorphism"],
    constraints: "Standard C++17/20; Derived owns resources released in its destructor.",
    targetComplexity: "Explanation plus the fix; reasoning, not new algorithms.",
    requiredEdgeCases: ["deleting Derived through Base* with a non-virtual ~Base", "Derived with no extra resources (still UB)", "ownership handed across an API boundary"],
    clarifyingQuestions: ["Is Base meant to be used polymorphically and deleted through a base pointer?", "Who owns the returned pointer?"],
    hintLadder: [
      "Deleting a Derived through a Base* whose destructor is not virtual is undefined behavior; typically only ~Base runs, so Derived's resources leak.",
      "Declare virtual ~Base() (often = default) so the correct derived destructor is dispatched.",
      "Safer still: return std::unique_ptr<Base> so ownership and correct destruction are explicit and automatic."
    ],
    visibleExamples: [
      {
        input: "Base* p = make(); delete p;  // ~Base not virtual, Derived owns resources",
        output: "undefined behavior; Derived's destructor does not run (leak). Make ~Base virtual."
      }
    ],
    externalLinks: [CPPREF]
  },
  // ---- #690: curated C++ interview-question expansion (30 problems). Every
  // problem is an original, executable cppFan task judged through the existing
  // interview judge (visible + hidden fixtures live in the server-held catalog).
  {
    id: "iv.cpp.move-only-buffer",
    version: 1,
    title: "Implement a move-only owning buffer",
    prompt:
      "Design a buffer type that uniquely owns its storage: copying must be disabled, but moving must transfer ownership and leave the source in a valid empty state. Read n integers into a buffer, move it into a second buffer, and report the second buffer's contents followed by the moved-from buffer's size.",
    group: "cpp_implementation",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "cpp.value_semantics.move",
    secondarySkillIds: ["cpp.value_semantics.special_members", "cpp.smart_pointers.unique_ptr"],
    patternTags: ["cpp", "move-semantics", "ownership", "implementation"],
    constraints: "0 <= n <= 1e5; values fit in int. Copying the buffer must not compile; the moved-from buffer must be empty and destructible.",
    targetComplexity: "O(1) move (pointer/handle steal), O(n) construction.",
    requiredEdgeCases: ["move from an empty buffer", "single element", "self-move must not corrupt state"],
    clarifyingQuestions: ["Should the moved-from object be reusable, or only destructible?", "Is copy construction ever needed, or is the type strictly move-only?"],
    hintLadder: [
      "Delete the copy constructor and copy assignment so accidental copies are compile errors.",
      "In the move constructor, take the source's storage (e.g. std::move the underlying vector) and then clear the source so it is a valid empty buffer.",
      "A moved-from object must still be safe to destroy and assign to — leave it empty rather than in a half-owned state."
    ],
    visibleExamples: [
      { input: "3\n1 2 3", output: "1 2 3\n0", note: "moved-to holds the data; moved-from size is 0" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.rule-of-five-buffer",
    version: 1,
    title: "Repair a raw-resource owner with the Rule of Five",
    prompt:
      "A type owns a raw heap array but defines none of its special members, so copies share and then double-free the same buffer. Give it correct copy and move construction/assignment plus a destructor (Rule of Five) so each owner has an independent buffer. Read n integers, deep-copy the owner, mutate the copy's first element to 999, and print the original then the copy to prove the copy is independent.",
    group: "cpp_implementation",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "cpp.value_semantics.rule_of_zero_five",
    secondarySkillIds: ["cpp.value_semantics.deep_copy", "cpp.raii.resource_lifetime"],
    patternTags: ["cpp", "rule-of-five", "resource-owner", "debugging"],
    constraints: "0 <= n <= 1e5. The default (shallow) copy would double-free; a correct deep copy must leave the source untouched.",
    targetComplexity: "O(n) copy, O(1) move.",
    requiredEdgeCases: ["copy of an empty owner", "self-assignment", "mutating the copy must not change the original"],
    clarifyingQuestions: ["Can this type be redesigned to the Rule of Zero with a std::vector member instead?", "Must moves leave the source empty and safe to destroy?"],
    hintLadder: [
      "The compiler-generated copy is shallow: two owners point at the same buffer and both delete it — a double free.",
      "Copy construction/assignment must allocate a new buffer and copy the elements; the destructor frees exactly once.",
      "Prefer the Rule of Zero (hold a std::vector) when you can; implement the Rule of Five only when you must own a raw resource directly."
    ],
    visibleExamples: [
      { input: "3\n5 6 7", output: "5 6 7\n999 6 7", note: "original unchanged after the copy is mutated" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.special-member-dispatch",
    version: 1,
    title: "Which special member runs?",
    prompt:
      "Instrument a class so its copy constructor prints C, move constructor prints M, copy assignment prints c, and move assignment prints m. Given a sequence of operations (copyctor, movector, copyassign, moveassign), perform each and output the single-line log of which special member was invoked.",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "cpp.value_semantics.special_members",
    secondarySkillIds: ["cpp.value_semantics.copy", "cpp.value_semantics.move"],
    constraints: "1 <= number of operations <= 100. Only the four measured special members print; construction and destruction are silent.",
    patternTags: ["cpp", "special-members", "copy", "move"],
    targetComplexity: "Reasoning about overload resolution; O(1) per operation.",
    requiredEdgeCases: ["copy from an lvalue selects the copy operation", "std::move selects the move operation", "assignment to an existing object vs constructing a new one"],
    clarifyingQuestions: ["Does binding to an rvalue always pick the move overload if one exists?", "Should a noexcept move be preferred by the standard library?"],
    hintLadder: [
      "Constructing a new object from an existing one is a constructor; assigning into an already-constructed object is an assignment.",
      "An lvalue argument selects the copy overload; an rvalue (including std::move(x)) selects the move overload.",
      "Print inside each of the four special members so the emitted log reflects overload resolution exactly."
    ],
    visibleExamples: [
      { input: "4\ncopyctor movector copyassign moveassign", output: "CMcm", note: "copy/move ctor then copy/move assign" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.return-by-value",
    version: 1,
    title: "Fix an API that returns a dangling local",
    prompt:
      "A helper builds a greeting in a local std::string and returns a reference to it, so callers read freed memory. Change the API to return the string by value and rely on copy elision/move. Read a name line and print \"Hello, <name>!\".",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "cpp.value_semantics.copy_elision",
    secondarySkillIds: ["cpp.references.return_semantics", "cpp.references.dangling"],
    patternTags: ["cpp", "copy-elision", "return-by-value", "lifetime"],
    constraints: "The name may contain spaces; it is a single input line. The local string is destroyed when the function returns.",
    targetComplexity: "O(length of name); a single owned string is returned.",
    requiredEdgeCases: ["empty name", "name containing spaces", "name with punctuation"],
    clarifyingQuestions: ["Is returning by value acceptable for performance here?", "Should the whole line (including spaces) be treated as the name?"],
    hintLadder: [
      "The local string is destroyed at return, so a returned reference to it dangles.",
      "Return std::string by value; guaranteed copy elision (C++17) or a move makes this cheap.",
      "Read the whole line so names with spaces are preserved."
    ],
    visibleExamples: [
      { input: "World", output: "Hello, World!", note: "greeting returned by value" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.raii-file-wrapper",
    version: 1,
    title: "Release a resource exactly once with RAII",
    prompt:
      "Write an RAII wrapper that prints \"open <name>\" on acquisition and \"close <name>\" on destruction, so the resource is released on every exit path — normal return or exception. Read n (name action) pairs; when action is fail, throw inside the scope and catch it, printing \"caught <name>\" after cleanup.",
    group: "cpp_implementation",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "cpp.raii.resource_lifetime",
    secondarySkillIds: ["cpp.raii.destructor_cleanup", "cpp.raii.exception_safety_intro"],
    patternTags: ["cpp", "raii", "resource-lifetime", "implementation"],
    constraints: "0 <= n <= 1000. Cleanup must run exactly once whether the scope exits normally or by exception.",
    targetComplexity: "O(1) per resource; deterministic acquire/release ordering.",
    requiredEdgeCases: ["normal exit closes the resource", "an exception still closes the resource before the catch", "zero resources"],
    clarifyingQuestions: ["Should the wrapper be movable, or is single-scope ownership enough here?", "Must close run before the catch handler observes the failure?"],
    hintLadder: [
      "Acquire in the constructor and release in the destructor so scope exit guarantees cleanup.",
      "During stack unwinding the destructor runs before the surrounding catch handler, so close is printed before caught.",
      "Do not release manually in the body — the destructor is the single release point."
    ],
    visibleExamples: [
      { input: "2\ndb ok cache fail", output: "open db\nclose db\nopen cache\nclose cache\ncaught cache", note: "the failing scope still closes before it is caught" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.unique-ptr-transfer",
    version: 1,
    title: "Transfer unique ownership across a boundary",
    prompt:
      "A sink function consumes a std::unique_ptr<int> by value. Read n integers into a vector of unique_ptr, transfer each into the sink to accumulate a sum, and report the sum followed by the number of source pointers that are now null.",
    group: "cpp_implementation",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "cpp.smart_pointers.ownership_transfer",
    secondarySkillIds: ["cpp.smart_pointers.unique_ptr", "cpp.value_semantics.move"],
    patternTags: ["cpp", "unique-ptr", "ownership-transfer", "move"],
    constraints: "0 <= n <= 1e5. unique_ptr is move-only; passing by value requires std::move at the call site.",
    targetComplexity: "O(n); each transfer is O(1).",
    requiredEdgeCases: ["empty input", "single pointer", "all sources become null after transfer"],
    clarifyingQuestions: ["Should the sink take the unique_ptr by value (owning) or by reference (borrowing)?", "After std::move, what value does the source pointer hold?"],
    hintLadder: [
      "unique_ptr cannot be copied; use std::move to pass it into a by-value parameter.",
      "After the move, the source pointer is null — that is how ownership transfer is observable.",
      "Sum inside the sink so the caller no longer owns the integers."
    ],
    visibleExamples: [
      { input: "3\n10 20 30", output: "60\n3", note: "sum, then count of nulled sources" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.shared-ptr-cycle",
    version: 1,
    title: "Break a shared_ptr ownership cycle",
    prompt:
      "Two nodes reference each other. If both links are std::shared_ptr, the reference counts never reach zero and the nodes leak. Redesign so the back-edge is a std::weak_ptr, then create two named nodes, link them, drop the owners, and print \"alive <n>\" where n is the number of nodes still alive (0 when the cycle is broken).",
    group: "cpp_implementation",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "cpp.smart_pointers.cyclic_reference",
    secondarySkillIds: ["cpp.smart_pointers.shared_ptr", "cpp.smart_pointers.weak_ptr"],
    patternTags: ["cpp", "shared-ptr", "weak-ptr", "ownership-cycle"],
    constraints: "Exactly two nodes; O(1) object graph. A shared/shared cycle leaks; exactly one edge must be weak.",
    targetComplexity: "O(1) ownership/lifetime correctness.",
    requiredEdgeCases: ["both owners released frees both nodes", "the weak edge does not keep its target alive", "accessing through the weak edge must lock() before use"],
    clarifyingQuestions: ["Which direction is the true owner and which is the back-reference?", "Should the weak side lock() the pointer before dereferencing?"],
    hintLadder: [
      "A shared_ptr<->shared_ptr cycle keeps both use counts >= 1 forever.",
      "Make the non-owning back-edge a weak_ptr so it does not contribute to the reference count.",
      "When the external owners are reset, both nodes' destructors run and nothing leaks."
    ],
    visibleExamples: [
      { input: "A B", output: "alive 0", note: "weak back-edge lets both nodes be freed" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.ownership-boundary",
    version: 1,
    title: "Design a clear owner / non-owner boundary",
    prompt:
      "A registry uniquely owns its widgets (std::unique_ptr), while lookups should borrow without transferring ownership. Read n (id value) widgets, then q lookup ids; for each, return the widget's value through a non-owning pointer, or \"absent\" if not found.",
    group: "cpp_implementation",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "cpp.smart_pointers.ownership_choice",
    secondarySkillIds: ["cpp.references.non_owning", "cpp.smart_pointers.unique_ptr"],
    patternTags: ["cpp", "api-design", "ownership", "non-owning"],
    constraints: "0 <= n, q <= 1e5. The registry keeps ownership; a lookup returns a borrowed view, never a new owner.",
    targetComplexity: "O(n) storage; lookup as implemented (linear here).",
    requiredEdgeCases: ["lookup of an absent id", "empty registry", "repeated lookups of the same id do not transfer ownership"],
    clarifyingQuestions: ["Should a lookup return a raw pointer/reference (borrow) or a shared_ptr (co-own)?", "May the caller outlive the registry?"],
    hintLadder: [
      "Store owners as unique_ptr so the registry has sole ownership.",
      "Return a raw pointer (or reference) for lookups — a borrow that does not change ownership.",
      "Return nullptr / \"absent\" for a miss rather than inserting a default entry."
    ],
    visibleExamples: [
      { input: "2\n1 100 2 200\n3\n2 1 9", output: "200\n100\nabsent", note: "borrowed lookups; last id is absent" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.exception-safe-resource",
    version: 1,
    title: "Make multi-step acquisition exception-safe",
    prompt:
      "A routine acquires two resources in sequence. If the second step fails, the first must still be released. Using RAII for the first resource, read (first second mode); when mode is fail, throw before acquiring the second and catch it, printing \"recovered\". Emit the acquire/release lines so the ordering proves the first resource was released on failure.",
    group: "cpp_implementation",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "cpp.raii.exception_safety_intro",
    secondarySkillIds: ["cpp.raii.resource_lifetime", "cpp.tooling.error_handling"],
    patternTags: ["cpp", "raii", "exception-safety", "cleanup"],
    constraints: "Two resources. On failure of the second acquisition, the first must be released exactly once during unwinding.",
    targetComplexity: "O(1); deterministic acquire/release ordering.",
    requiredEdgeCases: ["both steps succeed (both released in reverse order)", "second step fails (first still released)", "no leak on the failure path"],
    clarifyingQuestions: ["Is the first resource owned by an RAII guard so unwinding releases it?", "Should partial success roll back the already-acquired resource?"],
    hintLadder: [
      "Wrap the first resource in an RAII guard so an exception during the second step unwinds it automatically.",
      "Throwing before the second acquisition triggers the first guard's destructor before the catch handler runs.",
      "Never rely on manual cleanup after a throw — the guard's destructor is the guaranteed release."
    ],
    visibleExamples: [
      { input: "conn txn fail", output: "acquire conn\nrelease conn\nrecovered", note: "first resource released when the second step fails" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.object-slicing",
    version: 1,
    title: "Avoid object slicing",
    prompt:
      "Storing polymorphic objects by base value slices away the derived part, so virtual calls resolve to the base. Store the objects so polymorphism is preserved (e.g. std::unique_ptr<Base>). Read n shape tokens (circle/square) and print each shape's polymorphic name().",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "cpp.oop.slicing",
    secondarySkillIds: ["cpp.oop.virtual_polymorphism", "cpp.smart_pointers.unique_ptr"],
    patternTags: ["cpp", "oop", "slicing", "polymorphism"],
    constraints: "0 <= n <= 1e5. Storing Base by value would slice; store via pointer/reference to keep the dynamic type.",
    targetComplexity: "O(n); each virtual call is O(1).",
    requiredEdgeCases: ["a single derived object", "a mix of derived types", "all elements the same derived type"],
    clarifyingQuestions: ["Should the container own the objects polymorphically (unique_ptr<Base>)?", "Is copying the base sufficient, or must the dynamic type survive?"],
    hintLadder: [
      "A std::vector<Base> copies only the Base subobject — the derived part is sliced off.",
      "Hold std::unique_ptr<Base> (or Base&) so the dynamic type and its vtable are preserved.",
      "Virtual dispatch then selects the derived override at run time."
    ],
    visibleExamples: [
      { input: "3\ncircle square circle", output: "circle\nsquare\ncircle", note: "polymorphic name() preserved" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.polymorphic-clone",
    version: 1,
    title: "Deep-copy owned polymorphic objects",
    prompt:
      "You own a container of std::unique_ptr<Base>, but unique_ptr is not copyable, and copying Base* would slice. Add a virtual clone() that returns a unique_ptr<Base> so each derived type duplicates itself. Read n animal tokens (dog/cat), clone the whole container, and print each clone's sound().",
    group: "cpp_implementation",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "cpp.oop.polymorphic_ownership",
    secondarySkillIds: ["cpp.smart_pointers.unique_ptr", "cpp.oop.abstract_interfaces"],
    patternTags: ["cpp", "polymorphism", "unique-ptr", "api-design"],
    constraints: "0 <= n <= 1e5. Cloning must produce an independent object of the correct dynamic type.",
    targetComplexity: "O(n) clones, each O(1).",
    requiredEdgeCases: ["clone a single object", "clone a mix of derived types", "the clone is independent of the original"],
    clarifyingQuestions: ["Should clone() be pure virtual on the base?", "Must each derived clone return its own dynamic type?"],
    hintLadder: [
      "unique_ptr<Base> is move-only, so you cannot copy the container directly.",
      "Add virtual unique_ptr<Base> clone() const and override it in each derived class to make_unique<Derived>(*this).",
      "Copy the container by calling clone() on each element."
    ],
    visibleExamples: [
      { input: "2\ndog cat", output: "woof\nmeow", note: "clones keep their dynamic type" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.override-mismatch",
    version: 1,
    title: "Catch an accidental non-override",
    prompt:
      "A derived class meant to override a virtual method has a slightly different signature, so it silently hides rather than overrides — calls through the base pointer run the base version. Fix the signature and mark it override so the compiler enforces the match. Read n integers and print each scaled through a base pointer to a Doubler (which returns x*2).",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "cpp.oop.override_final",
    secondarySkillIds: ["cpp.oop.virtual_polymorphism", "cpp.tooling.warnings"],
    patternTags: ["cpp", "virtual", "override", "debugging"],
    constraints: "0 <= n <= 1e5. A const/parameter mismatch makes the derived method hide, not override.",
    targetComplexity: "O(n); each virtual call is O(1).",
    requiredEdgeCases: ["zero and negative inputs", "a single value", "call resolves to the derived override, not the base"],
    clarifyingQuestions: ["Does the base method's const-qualification match the derived one?", "Would marking it override have surfaced the bug at compile time?"],
    hintLadder: [
      "A signature difference (e.g. missing const) means the derived method hides the base method instead of overriding it.",
      "Add the override specifier so the compiler rejects a non-matching signature.",
      "Once the signatures match, calls through Base* dispatch to Doubler::scale."
    ],
    visibleExamples: [
      { input: "3\n3 5 7", output: "6\n10\n14", note: "override dispatches to Doubler" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.self-assignment-safe",
    version: 1,
    title: "Make assignment self-assignment-safe",
    prompt:
      "An owning type's copy assignment frees its buffer and then copies from the source — which corrupts data when the source is the same object (a = a). Repair it with a self-assignment guard or copy-and-swap. Read n integers, self-assign the owner, and print its elements, which must be intact.",
    group: "cpp_implementation",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "cpp.value_semantics.self_assignment",
    secondarySkillIds: ["cpp.value_semantics.operators", "cpp.value_semantics.deep_copy"],
    patternTags: ["cpp", "assignment", "copy-swap", "ownership"],
    constraints: "0 <= n <= 1e5. Self-assignment must not free the buffer before copying from it.",
    targetComplexity: "O(n) assignment.",
    requiredEdgeCases: ["self-assignment of a non-empty owner", "self-assignment of an empty owner", "normal assignment between two owners still works"],
    clarifyingQuestions: ["Should you guard with if (this != &other), or use copy-and-swap?", "Does copy-and-swap also give you the strong exception guarantee?"],
    hintLadder: [
      "The naive 'delete then copy' corrupts data when other is *this.",
      "Guard with if (this == &other) return *this; or implement copy-and-swap which is inherently self-assignment safe.",
      "Copy-and-swap also provides the strong exception guarantee as a bonus."
    ],
    visibleExamples: [
      { input: "3\n8 9 10", output: "8 9 10", note: "data intact after a = a" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.erase-while-iterating",
    version: 1,
    title: "Erase while traversing a container",
    prompt:
      "Removing elements from a vector during a range/index loop invalidates iterators or skips elements. Safely erase every multiple of k while traversing (use the iterator returned by erase, or erase-remove). Read n integers then k, and print the remaining elements.",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "cpp.stl.iterators",
    secondarySkillIds: ["cpp.stl.vector", "cpp.stl.algorithms"],
    patternTags: ["cpp", "stl", "iterators", "erase"],
    constraints: "0 <= n <= 1e5; k may be 0 (then erase nothing to avoid division by zero).",
    targetComplexity: "O(n) with erase-remove; naive repeated erase is O(n^2).",
    requiredEdgeCases: ["erase every element", "erase none", "k = 0 removes nothing"],
    clarifyingQuestions: ["Should the relative order of the kept elements be preserved?", "Is std::erase / erase-remove acceptable, or must it be a manual loop?"],
    hintLadder: [
      "vector::erase invalidates the erased iterator and everything after it; do not ++it after erasing.",
      "Assign it = v.erase(it) on removal and only ++it when you keep an element.",
      "The idiomatic O(n) solution is erase-remove (std::remove_if then erase)."
    ],
    visibleExamples: [
      { input: "6\n1 2 3 4 5 6\n2", output: "1 3 5", note: "multiples of 2 removed safely" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.unordered-map-no-insert",
    version: 1,
    title: "Look up without accidental insertion",
    prompt:
      "Using operator[] to read a key inserts a default entry when the key is missing, silently growing the map and corrupting counts. Use find/count/at for read-only lookups. Read n (key value) entries, then q query keys; print the value or \"absent\" for each, then print \"size <n>\" to prove no accidental insertions occurred.",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "cpp.stl.map",
    secondarySkillIds: ["cpp.stl.set", "cpp.references.optional_overloads"],
    patternTags: ["cpp", "unordered-map", "lookup", "api-semantics"],
    constraints: "0 <= n, q <= 1e5. A read-only lookup must not change the map's size.",
    targetComplexity: "O(1) average per lookup.",
    requiredEdgeCases: ["query a missing key does not insert", "empty map", "size unchanged after all queries"],
    clarifyingQuestions: ["Should a missing key report absent rather than a default value?", "Is it acceptable for the map to grow from reads?"],
    hintLadder: [
      "map[key] default-inserts when the key is absent — never use it for read-only access.",
      "Use find (and compare against end()) or count/at instead.",
      "The final size must equal the number of inserted keys, proving lookups did not insert."
    ],
    visibleExamples: [
      { input: "2\na 1 b 2\n3\na c b", output: "1\nabsent\n2\nsize 2", note: "lookups do not grow the map" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.lambda-capture-lifetime",
    version: 1,
    title: "Capture lambdas by value to avoid dangling",
    prompt:
      "Storing lambdas that capture a loop variable by reference leaves them referring to a variable that changes or dies, so later calls read stale/garbage values. Capture by value so each stored callable is self-contained. Read n integers, build one lambda per value that returns its square, then invoke them all after the loop and print each result.",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "hard",
    primarySkillId: "cpp.stl.lambdas",
    secondarySkillIds: ["cpp.references.dangling", "cpp.value_semantics.copy"],
    patternTags: ["cpp", "lambda", "capture", "lifetime"],
    constraints: "0 <= n <= 1e5. Values captured by reference would dangle or alias after the loop; capture by value.",
    targetComplexity: "O(n); each stored call is O(1).",
    requiredEdgeCases: ["a single value", "negative values", "results correct after the source loop ends"],
    clarifyingQuestions: ["Should the lambda own a copy of the value or reference the loop variable?", "Do the callables outlive the loop scope?"],
    hintLadder: [
      "Capturing the loop variable by reference means every lambda sees the same (final/destroyed) variable.",
      "Capture by value ([x]) so each lambda holds its own copy.",
      "Invoke after the loop to confirm each captured value survived."
    ],
    visibleExamples: [
      { input: "3\n2 3 4", output: "4\n9\n16", note: "values captured by value survive the loop" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.string-view-lifetime",
    version: 1,
    title: "Fix a dangling std::string_view",
    prompt:
      "Returning a std::string_view into a temporary std::string leaves the view pointing at freed memory. Redesign the function to return an owning std::string (or extend the source's lifetime). Read a line and print its first whitespace-delimited token.",
    group: "cpp_implementation",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "cpp.references.views",
    secondarySkillIds: ["cpp.templates.view_lifetime", "cpp.references.dangling"],
    patternTags: ["cpp", "string-view", "borrowed-view", "lifetime"],
    constraints: "The input line may be empty or have leading spaces. A string_view into a temporary dangles once the temporary dies.",
    targetComplexity: "O(length of the token).",
    requiredEdgeCases: ["leading whitespace before the token", "a single token", "an empty line yields an empty token"],
    clarifyingQuestions: ["Does the returned view outlive the string it points into?", "Should the function return an owning std::string instead?"],
    hintLadder: [
      "A string_view is a non-owning borrow; if the backing string is a temporary, the view dangles.",
      "Return std::string (owning) so the caller holds the data, or keep the source alive for the view's lifetime.",
      "Skip leading whitespace, then copy up to the next whitespace into an owned string."
    ],
    visibleExamples: [
      { input: "  hello world foo", output: "hello", note: "first token returned as an owning string" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.strict-weak-comparator",
    version: 1,
    title: "Repair a comparator that breaks sort",
    prompt:
      "A comparator that uses <= (or is otherwise not a strict weak ordering) causes undefined behavior in std::sort and ordered containers. Provide a correct comparator that orders records by priority ascending, breaking ties by name ascending. Read n (name priority) records and print them in sorted order.",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "hard",
    primarySkillId: "cpp.stl.algorithms",
    secondarySkillIds: ["cpp.stl.vector", "cpp.functions.basics"],
    patternTags: ["cpp", "comparator", "sort", "stl"],
    constraints: "0 <= n <= 1e5. The comparator must be a strict weak ordering (irreflexive, consistent tie-breaking).",
    targetComplexity: "O(n log n) sort.",
    requiredEdgeCases: ["ties broken deterministically by name", "a single record", "all equal priorities"],
    clarifyingQuestions: ["Must the comparator be irreflexive (return false for equal elements)?", "How are ties broken to keep the ordering total?"],
    hintLadder: [
      "A comparator using <= is not irreflexive (comp(a,a) is true), which is undefined behavior for std::sort.",
      "Compare the primary key with <, and on equality fall through to a secondary key with < — never <=.",
      "Order by priority, then by name, both with strict <."
    ],
    visibleExamples: [
      { input: "3\nbob 2\nann 2\ncy 1", output: "cy 1\nann 2\nbob 2", note: "priority asc, ties by name asc" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.reserve-vs-resize",
    version: 1,
    title: "Distinguish vector capacity from size",
    prompt:
      "Calling resize(n) to 'pre-size' a vector before push_back creates n default elements and then appends after them — doubling the data. Use reserve(n) to allocate capacity without changing size. Read n integers, reserve capacity, push each back, then print \"size <n>\" followed by the elements.",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "cpp.stl.vector",
    secondarySkillIds: ["cpp.stl.iterators", "cpp.tooling.debugging"],
    patternTags: ["cpp", "vector", "capacity", "debugging"],
    constraints: "0 <= n <= 1e5. reserve changes capacity only; size stays 0 until you push_back.",
    targetComplexity: "O(n) with a single allocation.",
    requiredEdgeCases: ["empty input", "a single element", "final size equals the count pushed"],
    clarifyingQuestions: ["Do you want to pre-allocate capacity (reserve) or create elements (resize)?", "What size should the vector report after the pushes?"],
    hintLadder: [
      "resize(n) creates n value-initialized elements; a following push_back appends beyond them.",
      "reserve(n) only allocates storage — size stays 0 until you push_back.",
      "After reserving and pushing n items, size() is exactly n."
    ],
    visibleExamples: [
      { input: "4\n1 2 3 4", output: "size 4\n1 2 3 4", note: "reserve keeps size at the count pushed" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.template-deduction",
    version: 1,
    title: "Reason about template argument deduction",
    prompt:
      "Implement a function template that returns the larger of two values and another that reports a container's size, letting the compiler deduce the element type T. Read two integers a and b, then a vector of n integers, and print max(a, b) followed by the vector's size.",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "hard",
    primarySkillId: "cpp.templates.deduction",
    secondarySkillIds: ["cpp.templates.function_templates", "cpp.references.parameter_passing"],
    patternTags: ["cpp", "templates", "type-deduction"],
    constraints: "0 <= n <= 1e5; values fit in 64-bit. Both arguments to the max template share one deduced type T.",
    targetComplexity: "O(1) for max, O(1) for size.",
    requiredEdgeCases: ["a greater than b", "a equal to b", "empty vector reports size 0"],
    clarifyingQuestions: ["Should both parameters deduce to the same T, or allow mixed types?", "Does taking parameters by const reference change the deduced type?"],
    hintLadder: [
      "template<class T> T tmax(T a, T b) deduces T from the arguments; both must be the same type.",
      "A separate template<class T> deduces T from the vector's element type for size().",
      "Return the larger value and the container size."
    ],
    visibleExamples: [
      { input: "7 3\n4\n9 1 8 2", output: "7\n4", note: "max(a,b), then the container size" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.if-constexpr-dispatch",
    version: 1,
    title: "Compile-time branch selection with if constexpr",
    prompt:
      "Write one function template that behaves differently by type: for an integral value it returns \"int:<2*value>\", for a std::string it returns \"str:<value>!\". A plain if would try to compile both branches for each type and fail; use if constexpr so only the valid branch is instantiated. Read n (tag value) pairs where tag i is integral and tag s is a string, and print each described result.",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "hard",
    primarySkillId: "cpp.templates.if_constexpr",
    secondarySkillIds: ["cpp.templates.function_templates", "cpp.templates.constexpr"],
    patternTags: ["cpp", "templates", "if-constexpr", "compile-time"],
    constraints: "1 <= n <= 1000. The integral branch (value*2) must not be instantiated for std::string, and vice versa.",
    targetComplexity: "O(1) per item; branch chosen at compile time.",
    requiredEdgeCases: ["only integral inputs", "only string inputs", "a mix of both"],
    clarifyingQuestions: ["Which type trait distinguishes the branches (is_integral)?", "Why would a runtime if fail to compile here?"],
    hintLadder: [
      "A runtime if would compile value*2 even when value is a std::string, which is ill-formed.",
      "if constexpr (std::is_integral_v<T>) discards the false branch at compile time so only valid code is instantiated.",
      "Return the int form for integrals and the string form otherwise."
    ],
    visibleExamples: [
      { input: "3\ni 5\ns hi\ni 10", output: "int:10\nstr:hi!\nint:20", note: "integral vs string branch chosen at compile time" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.generic-static-contract",
    version: 1,
    title: "Constrain a template with static_assert",
    prompt:
      "Write a reusable function template sumSquares that computes the sum of squares of a container's elements, and constrain it with static_assert(std::is_arithmetic_v<T>) so a misuse on a non-arithmetic type fails at compile time with a clear message. Read n integers and print the sum of their squares.",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "cpp.templates.static_assert",
    secondarySkillIds: ["cpp.templates.function_templates", "cpp.templates.concepts"],
    patternTags: ["cpp", "templates", "static-assert", "generic-programming"],
    constraints: "0 <= n <= 1e5; values fit so the sum of squares fits in 64-bit. Non-arithmetic T must be rejected at compile time.",
    targetComplexity: "O(n).",
    requiredEdgeCases: ["empty container sums to 0", "negative values (squares are positive)", "single element"],
    clarifyingQuestions: ["Should the constraint be a static_assert or a concept?", "What clear message should a misuse produce?"],
    hintLadder: [
      "Place static_assert(std::is_arithmetic_v<T>, \"...\") at the top of the template body.",
      "Accumulate x*x over the elements in a value of type T.",
      "A non-arithmetic instantiation now fails with your message instead of a deep template error."
    ],
    visibleExamples: [
      { input: "3\n2 3 4", output: "29", note: "4 + 9 + 16" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.sanitizer-use-after-free",
    version: 1,
    title: "Repair a use-after-free caught by the sanitizer",
    prompt:
      "Code saves a reference (or pointer) to a vector element, then push_back reallocates the buffer, leaving the saved reference dangling — AddressSanitizer flags a heap-use-after-free. Fix it by indexing the vector after the appends rather than holding a stale reference. Read n integers, then a number of appended values, then an index, and print the element at that index (or \"oob\").",
    group: "cpp_implementation",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "cpp.tooling.sanitizers",
    secondarySkillIds: ["cpp.references.dangling", "cpp.stl.vector"],
    patternTags: ["cpp", "debugging", "asan", "ub", "lifetime"],
    constraints: "0 <= n, appends <= 1e5. push_back may reallocate, invalidating references/pointers/iterators into the vector.",
    targetComplexity: "O(n + appends).",
    requiredEdgeCases: ["index valid only after the appends", "index out of bounds", "reallocation actually occurs before the read"],
    clarifyingQuestions: ["Could push_back reallocate and invalidate the saved reference?", "Should the read use the current buffer via indexing?"],
    hintLadder: [
      "push_back can reallocate; any reference/pointer/iterator taken before it may dangle afterward.",
      "Do not cache a reference across a push_back — index the vector by position after the appends.",
      "Bounds-check the index and report oob when out of range."
    ],
    visibleExamples: [
      { input: "2\n5 6\n3\n7 8 9\n4", output: "9", note: "index read after the appends, not via a stale reference" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.signed-unsigned-loop",
    version: 1,
    title: "Fix a signed/unsigned size bug",
    prompt:
      "A loop written as for (size_t i = 0; i <= v.size() - 1; ++i) wraps around to a huge value when the vector is empty (0u - 1), causing out-of-bounds access. Write a correct loop that counts adjacent increasing pairs (v[i] > v[i-1]) and handles the empty case safely. Read n integers and print the count.",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "cpp.values_types.signed_unsigned",
    secondarySkillIds: ["cpp.control_flow.loops", "cpp.stl.vector"],
    patternTags: ["cpp", "integer", "signed-unsigned", "debugging"],
    constraints: "0 <= n <= 1e5. size() is unsigned; size()-1 underflows when the container is empty.",
    targetComplexity: "O(n).",
    requiredEdgeCases: ["empty input must not underflow", "strictly increasing sequence", "no increases"],
    clarifyingQuestions: ["What is size_t(0) - 1 for an empty vector?", "Should the loop start at index 1 and compare with the previous element?"],
    hintLadder: [
      "v.size() is unsigned, so size()-1 wraps to a huge number when the vector is empty.",
      "Loop from i = 1 while i < v.size() (no subtraction), or cast size() to a signed type.",
      "Count positions where v[i] > v[i-1]."
    ],
    visibleExamples: [
      { input: "5\n1 3 2 4 4", output: "2", note: "adjacent increases: 1->3 and 2->4" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.optional-parse",
    version: 1,
    title: "Model a recoverable parse with std::optional",
    prompt:
      "Instead of a sentinel like -1 (ambiguous with real data) or throwing, model a parse that may fail using std::optional<long long>. Read n tokens; parse each as an integer, summing the successes and counting the failures. Print the sum, then the failure count.",
    group: "cpp_implementation",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "cpp.tooling.optional_expected",
    secondarySkillIds: ["cpp.tooling.error_handling", "cpp.utilities.variant"],
    patternTags: ["cpp", "optional", "error-handling", "api-design"],
    constraints: "0 <= n <= 1e5. A failed parse must be distinguishable from a parsed 0 or -1.",
    targetComplexity: "O(total input length).",
    requiredEdgeCases: ["all tokens valid", "all tokens invalid", "a mix, including a negative number"],
    clarifyingQuestions: ["Should the API return std::optional rather than a sentinel value?", "Is a negative sign valid, but an empty/non-digit token a failure?"],
    hintLadder: [
      "Return std::optional<long long> — nullopt for failure, a value for success — so 0/-1 are not overloaded as errors.",
      "Validate the token (optional sign, then digits) before converting.",
      "Sum only the engaged optionals and count the nullopt results."
    ],
    visibleExamples: [
      { input: "4\n10 x -5 12", output: "17\n1", note: "sum of parsed values, then failure count" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.thread-safe-counter",
    version: 1,
    title: "Fix a data race on a shared counter",
    prompt:
      "Multiple threads increment a shared counter without synchronization, so the final value is nondeterministic and too low (a data race, undefined behavior). Protect the increment with a std::mutex (or use std::atomic). Read T and K; run T threads that each increment the counter K times, and print the final count, which must equal T*K.",
    group: "cpp_implementation",
    roleRelevance: "concurrency-adjacent",
    difficulty: "hard",
    primarySkillId: "cpp.concurrency.data_races",
    secondarySkillIds: ["cpp.concurrency.mutexes", "cpp.concurrency.threads"],
    patternTags: ["cpp", "concurrency", "data-race", "synchronization"],
    constraints: "1 <= T <= 32; 1 <= K <= 1e6. The unsynchronized version has a data race; the result must be deterministic T*K.",
    targetComplexity: "O(T*K) increments; correctness independent of interleaving.",
    requiredEdgeCases: ["a single thread", "many threads with small K", "final count is exactly T*K regardless of scheduling"],
    clarifyingQuestions: ["Is a std::mutex + lock_guard or a std::atomic more appropriate here?", "Why is ++counter from multiple threads undefined behavior without synchronization?"],
    hintLadder: [
      "Concurrent unsynchronized ++counter is a data race — undefined behavior, and typically loses updates.",
      "Guard the increment with std::lock_guard<std::mutex>, or make the counter std::atomic.",
      "Join all threads before reading; the total must be exactly T*K."
    ],
    visibleExamples: [
      { input: "8 10000", output: "80000", note: "T*K with a synchronized increment" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.mutex-protected-state",
    version: 1,
    title: "Protect a multi-field invariant with a mutex",
    prompt:
      "An account tracks a balance and an operation count that must always agree. Concurrent deposits without locking break the invariant. Protect the whole update with std::mutex and std::lock_guard so both fields advance atomically together. Read T, K, and amount; run T threads that each perform K deposits, and print the final balance (T*K*amount) then the operation count (T*K).",
    group: "cpp_implementation",
    roleRelevance: "concurrency-adjacent",
    difficulty: "hard",
    primarySkillId: "cpp.concurrency.mutexes",
    secondarySkillIds: ["cpp.concurrency.data_races", "cpp.structs_classes.invariants_intro"],
    patternTags: ["cpp", "concurrency", "mutex", "invariant"],
    constraints: "1 <= T <= 32; 1 <= K <= 1e6. Both fields must be updated under one critical section so the invariant always holds.",
    targetComplexity: "O(T*K) updates; deterministic final state.",
    requiredEdgeCases: ["a single thread", "balance and count stay consistent", "large T and K"],
    clarifyingQuestions: ["Should both fields be updated inside one locked section?", "Would separate atomics preserve the cross-field invariant?"],
    hintLadder: [
      "Two atomics do not make a multi-field update atomic as a whole; the invariant can still be observed broken.",
      "Take a std::lock_guard over both updates so balance and count advance together.",
      "Final balance is T*K*amount and the count is T*K."
    ],
    visibleExamples: [
      { input: "4 1000 5", output: "20000\n4000", note: "balance T*K*amount, then op count T*K" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.deadlock-safe-transfer",
    version: 1,
    title: "Fix a two-lock transfer deadlock",
    prompt:
      "Transfers between two accounts lock account A then account B in one direction and B then A in the other, so concurrent transfers can deadlock. Fix it by acquiring both locks together with std::scoped_lock (or a consistent lock order). Read a, b, T, K, amt; run transfers back and forth and print the conserved total (a+b).",
    group: "cpp_implementation",
    roleRelevance: "concurrency-adjacent",
    difficulty: "hard",
    primarySkillId: "cpp.concurrency.deadlock",
    secondarySkillIds: ["cpp.concurrency.mutexes", "cpp.concurrency.lock_granularity"],
    patternTags: ["cpp", "concurrency", "deadlock", "lock-order"],
    constraints: "1 <= T <= 16; 1 <= K <= 1e5. Inconsistent lock ordering can deadlock; the total must always be conserved.",
    targetComplexity: "O(T*K) transfers; no deadlock, total invariant preserved.",
    requiredEdgeCases: ["a single pair of threads", "transfers in both directions", "total conserved regardless of interleaving"],
    clarifyingQuestions: ["Should both mutexes be acquired atomically with std::scoped_lock?", "Would a global lock ordering also prevent the deadlock?"],
    hintLadder: [
      "Locking A-then-B in one thread and B-then-A in another is the classic deadlock pattern.",
      "Use std::scoped_lock(mA, mB) to acquire both without a fixed order (deadlock-avoiding), or always lock in a consistent global order.",
      "The sum of the two balances is invariant, so the output equals a+b."
    ],
    visibleExamples: [
      { input: "100 200 4 1000 3", output: "300", note: "total conserved (a+b)" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.bounded-blocking-queue",
    version: 1,
    title: "Implement a bounded blocking queue",
    prompt:
      "Build a small bounded producer/consumer queue: a producer pushes items 0..N-1 but must block when the queue is full, and a consumer blocks when it is empty. Use std::mutex and std::condition_variable with predicate waits (not sleeps). Read N and cap; print the sum of consumed items, which is N*(N-1)/2.",
    group: "cpp_implementation",
    roleRelevance: "concurrency-adjacent",
    difficulty: "hard",
    primarySkillId: "cpp.concurrency.condition_variables",
    secondarySkillIds: ["cpp.concurrency.mutexes", "cpp.concurrency.shared_state_design"],
    patternTags: ["cpp", "concurrency", "condition-variable", "producer-consumer"],
    constraints: "1 <= N <= 1e5; 1 <= cap <= N. Waits must use predicates; correctness must not depend on sleeps or timing.",
    targetComplexity: "O(N) items passed; bounded memory O(cap).",
    requiredEdgeCases: ["capacity of 1", "a single item", "no lost or duplicated items"],
    clarifyingQuestions: ["Should waits use a predicate to guard against spurious wakeups?", "How does the consumer learn that production is finished?"],
    hintLadder: [
      "The producer waits on cv until size < cap; the consumer waits until the queue is non-empty or production is done.",
      "Always wait with a predicate (cv.wait(lk, pred)) so spurious wakeups are handled.",
      "notify after each push/pop; the consumer's total equals 0+1+...+(N-1)."
    ],
    visibleExamples: [
      { input: "1000 4", output: "499500", note: "sum 0..999" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.cpp.atomic-counter",
    version: 1,
    title: "Use std::atomic correctly",
    prompt:
      "For a simple shared counter and a completion flag, a lock is unnecessary — std::atomic provides lock-free, race-free updates, and volatile is NOT a synchronization tool. Read T and K; run T threads that each fetch_add the atomic counter K times, set an atomic flag when done, and print the final count (T*K) then the flag (1).",
    group: "cpp_implementation",
    roleRelevance: "concurrency-adjacent",
    difficulty: "hard",
    primarySkillId: "cpp.concurrency.atomics",
    secondarySkillIds: ["cpp.concurrency.memory_ordering", "cpp.concurrency.data_races"],
    patternTags: ["cpp", "concurrency", "atomic", "memory-model"],
    constraints: "1 <= T <= 32; 1 <= K <= 1e6. volatile does not provide atomicity or ordering; use std::atomic.",
    targetComplexity: "O(T*K) atomic increments.",
    requiredEdgeCases: ["a single thread", "many threads", "final count is exactly T*K"],
    clarifyingQuestions: ["Why is volatile not a substitute for std::atomic here?", "Is relaxed memory ordering sufficient for a plain counter?"],
    hintLadder: [
      "volatile prevents some compiler optimizations but gives neither atomicity nor cross-thread ordering.",
      "Use std::atomic<long long> with fetch_add; relaxed ordering suffices for a pure counter.",
      "Join all threads, then read the count (T*K) and the flag."
    ],
    visibleExamples: [
      { input: "8 50000", output: "400000\n1", note: "count T*K, then flag set" }
    ],
    externalLinks: [CPPREF],
    interviewCore: true
  },
  {
    id: "iv.trie.prefix-index",
    version: 1,
    title: "Prefix index for service names",
    prompt: "Maintain an in-memory prefix index of service names. Process insert, exact-search, and prefix-query operations in order, returning whether each query is present. Design the structure so each operation depends on the query length rather than the number of stored names.",
    group: "trees_bst",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.strings.trie",
    secondarySkillIds: ["dsa.strings.manipulation","dsa.strings.hashing"],
    patternTags: ["trie","prefix-search","data-structure-design"],
    constraints: "1 <= operations <= 2e5; names contain lowercase ASCII letters; duplicate inserts do not change query results.",
    targetComplexity: "O(L) per insert/search/prefix query, where L is the word or prefix length.",
    requiredEdgeCases: ["query before any insert","a word that is also a prefix of a longer word","duplicate inserts"],
    clarifyingQuestions: ["Are names lowercase only?","Should duplicate inserts create duplicate entries?"],
    hintLadder: ["Store one edge per next character instead of scanning all names.","Track an end-of-word marker separately from the existence of a prefix.","A trie walk answers both exact and prefix queries; exact search additionally checks the terminal marker."],
    visibleExamples: [{ input: "7\nI cat\nI car\nS cat\nP ca\nS cap\nI cap\nS cap", output: "1\n1\n0\n1" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.stack.decode-nested-string",
    version: 1,
    title: "Decode nested repetition blocks",
    prompt: "Decode a compact string where k[text] means repeat text k times and repetition blocks may nest. Return the fully decoded string while correctly restoring the outer partial result after each closing bracket.",
    group: "stacks_queues_monotonic",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.strings.parsing",
    secondarySkillIds: ["dsa.stacks.basic_stack"],
    patternTags: ["stack","parsing","nested-state"],
    constraints: "Input is a valid encoding; repeat counts are positive integers; decoded output is at most 1e6 characters.",
    targetComplexity: "O(output length) time and O(nesting depth + output length) space.",
    requiredEdgeCases: ["multi-digit repeat count","nested blocks","literal suffix after a block"],
    clarifyingQuestions: ["Is the encoding guaranteed valid?","Can repeat counts contain multiple digits?"],
    hintLadder: ["A closing bracket needs both the previous partial string and its repeat count.","Push state when entering a bracket and restore it when leaving.","Accumulate multi-digit counts before the opening bracket; repeat the current fragment when the matching bracket closes."],
    visibleExamples: [{ input: "3[a2[c]]", output: "accaccacc" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.strings.palindromic-substrings",
    version: 1,
    title: "Count mirrored substrings",
    prompt: "Given a string, count how many contiguous substrings read the same forward and backward. Different start/end positions count separately even when their text is identical.",
    group: "dp_backtracking",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.strings.palindrome_substrings",
    secondarySkillIds: ["dsa.strings.palindrome"],
    patternTags: ["palindrome","center-expansion","dynamic-programming"],
    constraints: "0 <= length <= 4000; input is one line of ASCII characters.",
    targetComplexity: "O(n^2) time and O(1) extra space with center expansion.",
    requiredEdgeCases: ["empty string","all characters equal","even-length palindrome"],
    clarifyingQuestions: ["Do equal substrings at different positions count separately?","Does a one-character substring count?"],
    hintLadder: ["Every palindrome has either one center character or one center gap.","Expand outward while the two characters match and count each valid expansion.","Visit all 2n-1 possible centers to cover odd and even lengths without an O(n^2) table."],
    visibleExamples: [{ input: "aaa", output: "6" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.twoptr.three-sum-target",
    version: 1,
    title: "Count unique three-value target combinations",
    prompt: "Given integer values and a target, return the number of unique value triplets whose sum equals the target. Triplets are unique by their three values, not by source indices.",
    group: "two_pointers_sliding_window",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.arrays.two_pointers",
    secondarySkillIds: ["dsa.sorting.comparator","dsa.arrays.traversal"],
    patternTags: ["two-pointer","sorting","deduplication","three-sum"],
    constraints: "0 <= n <= 4000; values and target fit 32-bit signed integers; sums may require 64-bit arithmetic.",
    targetComplexity: "O(n^2) time after O(n log n) sorting, O(1) extra space apart from the sort.",
    requiredEdgeCases: ["duplicate values that form the same triplet","no solution","zeros and negative values"],
    clarifyingQuestions: ["Are triplets unique by values or indices?","May I sort the input?"],
    hintLadder: ["Sort first so duplicate values become adjacent.","Fix one value, then search the remaining suffix with two converging pointers.","Skip equal pivot/left/right values after finding a solution so each value triplet is counted once."],
    visibleExamples: [{ input: "6 0\n-1 0 1 2 -1 -4", output: "2" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.prefix.multiple-of-k-subarray",
    version: 1,
    title: "Count windows aligned to a modulus",
    prompt: "Given signed integer deltas and a positive modulus k, count contiguous subarrays whose total is divisible by k. Use the modular relationship between two prefix sums instead of enumerating every window.",
    group: "arrays_hashing_prefix",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.techniques.prefix_sums",
    secondarySkillIds: ["dsa.hashing.lookup"],
    patternTags: ["prefix-sum","modulo","hash-map"],
    constraints: "0 <= n <= 2e5; 1 <= k <= 1e9; prefix sums require 64-bit arithmetic; values may be negative.",
    targetComplexity: "O(n) expected time and O(min(n,k)) remainder-count space.",
    requiredEdgeCases: ["negative values","zero-valued windows","many prefixes with the same remainder"],
    clarifyingQuestions: ["Is k always positive?","Can array values be negative?"],
    hintLadder: ["A subarray sum is divisible by k when its two surrounding prefix sums have the same remainder.","Count how many times each normalized remainder has appeared.","Normalize negative remainders into [0,k) and seed remainder 0 once for windows starting at index 0."],
    visibleExamples: [{ input: "5 5\n4 5 0 -2 -3", output: "6" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.bsearch.rotated-target",
    version: 1,
    title: "Find a target in a rotated index",
    prompt: "A strictly increasing array was rotated at an unknown pivot. Return the index of a requested target, or -1 if absent, without linearly scanning the array.",
    group: "binary_search",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.searching.binary_search",
    secondarySkillIds: ["dsa.arrays.traversal"],
    patternTags: ["binary-search","rotated-array","monotonic-half"],
    constraints: "0 <= n <= 2e5; all values are distinct; the rotation may be zero.",
    targetComplexity: "O(log n) time and O(1) extra space.",
    requiredEdgeCases: ["target at the pivot","target absent","single-element array"],
    clarifyingQuestions: ["Are all values distinct?","Can the array be unrotated?"],
    hintLadder: ["At least one side of every midpoint is still sorted.","Use the sorted side's endpoint values to decide whether the target lies inside it.","Discard the side that cannot contain the target and continue ordinary binary-search convergence."],
    visibleExamples: [{ input: "7 0\n4 5 6 7 0 1 2", output: "4" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.bsearch.single-unpaired",
    version: 1,
    title: "Find the unpaired record",
    prompt: "A sorted array contains every value exactly twice except one value that appears once. Return the single value in logarithmic time by exploiting how pair alignment changes across the unique element.",
    group: "binary_search",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.searching.binary_search",
    secondarySkillIds: ["dsa.arrays.indexing"],
    patternTags: ["binary-search","parity","sorted-array"],
    constraints: "n is odd; 1 <= n <= 2e5; array is sorted; exactly one value occurs once and all others occur twice.",
    targetComplexity: "O(log n) time and O(1) extra space.",
    requiredEdgeCases: ["single value is first","single value is last","array length one"],
    clarifyingQuestions: ["Is the input guaranteed sorted?","Do all non-unique values occur exactly twice?"],
    hintLadder: ["Before the unique value, pairs start at even indices; after it, that alignment shifts.","Force the midpoint to an even index and compare it with the next item.","A matching pair means the single item is to the right; a mismatch means it is at or left of the midpoint."],
    visibleExamples: [{ input: "9\n1 1 2 2 3 4 4 5 5", output: "3" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.twoptr.trapped-water",
    version: 1,
    title: "Measure retained capacity between barriers",
    prompt: "Given non-negative barrier heights, return how many unit cells of capacity are trapped after filling from above. Use a two-sided invariant so you do not need per-position prefix/suffix arrays.",
    group: "two_pointers_sliding_window",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.arrays.two_pointers",
    secondarySkillIds: ["dsa.arrays.traversal"],
    patternTags: ["two-pointer","invariant","water-trapping"],
    constraints: "0 <= n <= 2e5; 0 <= height[i] <= 1e9; answer may exceed 32-bit.",
    targetComplexity: "O(n) time and O(1) extra space.",
    requiredEdgeCases: ["monotonic heights","deep basin","fewer than three barriers"],
    clarifyingQuestions: ["Are heights non-negative?","Should the answer use 64-bit arithmetic?"],
    hintLadder: ["Water over a position is limited by the smaller of the best barrier on each side.","Move the side whose current maximum is smaller; the opposite side is already high enough to bound it.","Track leftMax and rightMax while converging the two pointers and accumulate max - height on the chosen side."],
    visibleExamples: [{ input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", output: "6" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.tree.lca-general",
    version: 1,
    title: "Lowest common ancestor in a general tree",
    prompt: "Given a binary tree with unique node values and two values present in the tree, return the value of their lowest common ancestor. The tree has no BST ordering, so use its recursive structure rather than comparisons.",
    group: "trees_bst",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.trees.traversal",
    secondarySkillIds: ["dsa.recursion.base_case"],
    patternTags: ["tree","dfs","recursion","lca"],
    constraints: "0 <= nodes <= 2e5; query values are unique and present; tree input uses level-order tokens with # for null.",
    targetComplexity: "O(n) time and O(h) recursion space.",
    requiredEdgeCases: ["one query node is an ancestor of the other","query nodes lie in different root subtrees","both nodes are siblings"],
    clarifyingQuestions: ["Are both query nodes guaranteed present?","Are node values unique?"],
    hintLadder: ["If the current node is either query node, it can be part of the answer.","Search both subtrees; if each returns a non-null match, the current node is the LCA.","Otherwise propagate the one non-null result upward."],
    visibleExamples: [{ input: "7\n3 5 1 6 2 0 8\n5 1", output: "3" }],
    externalLinks: [USACO],
    interviewCore: true
  },
  {
    id: "iv.tree.max-path-sum",
    version: 1,
    title: "Best path through a tree",
    prompt: "Each binary-tree node has a signed score. Return the maximum score of any non-empty path whose adjacent nodes are connected by tree edges. The path may start and end anywhere but cannot revisit a node.",
    group: "trees_bst",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.trees.traversal",
    secondarySkillIds: ["dsa.techniques.dp_design"],
    patternTags: ["tree-dp","dfs","postorder"],
    constraints: "1 <= nodes <= 2e5; values may be negative; result requires 64-bit arithmetic.",
    targetComplexity: "O(n) time and O(h) recursion space.",
    requiredEdgeCases: ["all values negative","best path crosses a node using both children","single node"],
    clarifyingQuestions: ["May the path start and end anywhere?","Can the path include both child branches through one node?"],
    hintLadder: ["A parent can continue through at most one child branch, so return one best downward contribution.","Negative child contributions should be discarded when extending a path.","At each node, separately update a global answer with node + best-left + best-right."],
    visibleExamples: [{ input: "7\n-10 9 20 # # 15 7", output: "42" }],
    externalLinks: [USACO],
    interviewCore: true
  },
  {
    id: "iv.tree.build-from-traversals",
    version: 1,
    title: "Reconstruct a tree from traversal logs",
    prompt: "Reconstruct a binary tree whose node values are unique from its preorder and inorder traversals, then emit the canonical level-order representation. Avoid repeatedly scanning inorder ranges.",
    group: "trees_bst",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.trees.traversal",
    secondarySkillIds: ["dsa.hashing.lookup","dsa.recursion.base_case"],
    patternTags: ["tree","recursion","reconstruction","hash-map"],
    constraints: "0 <= n <= 2e5; values are unique; traversals describe the same valid tree.",
    targetComplexity: "O(n) time with an inorder index map and O(n) auxiliary space.",
    requiredEdgeCases: ["single node","fully skewed tree","empty tree"],
    clarifyingQuestions: ["Are node values unique?","Are preorder and inorder guaranteed consistent?"],
    hintLadder: ["The first preorder value is the root of the current subtree.","An inorder position splits the current subtree into left and right sizes.","Build a value-to-inorder-index map once, then recurse using index ranges instead of slicing arrays."],
    visibleExamples: [{ input: "5\n3 9 20 15 7\n9 3 15 20 7", output: "3 9 20 # # 15 7" }],
    externalLinks: [USACO],
    interviewCore: true
  },
  {
    id: "iv.tree.path-sum",
    version: 1,
    title: "Does any root-to-leaf path hit the target?",
    prompt: "Given a binary tree with signed values and a target, return whether at least one root-to-leaf path has exactly that sum. A partial path ending at an internal node does not count.",
    group: "trees_bst",
    roleRelevance: "general",
    difficulty: "easy",
    primarySkillId: "dsa.trees.traversal",
    secondarySkillIds: ["dsa.recursion.base_case"],
    patternTags: ["tree","dfs","path-state"],
    constraints: "0 <= nodes <= 2e5; sums require 64-bit arithmetic.",
    targetComplexity: "O(n) time and O(h) recursion space.",
    requiredEdgeCases: ["empty tree","negative values","target reached only at an internal node"],
    clarifyingQuestions: ["Must the path end at a leaf?","Can values be negative?"],
    hintLadder: ["Carry the remaining target or accumulated sum down the DFS.","Only compare for success when the current node is a leaf.","Recurse into either child with the target reduced by the current value."],
    visibleExamples: [{ input: "7\n5 4 8 11 # 13 4\n20", output: "1" }],
    externalLinks: [USACO],
    interviewCore: true
  },
  {
    id: "iv.tree.invert",
    version: 1,
    title: "Mirror a binary topology",
    prompt: "Mirror a binary tree in place by swapping every node's left and right subtrees, then emit its canonical level-order representation.",
    group: "trees_bst",
    roleRelevance: "general",
    difficulty: "easy",
    primarySkillId: "dsa.trees.traversal",
    secondarySkillIds: ["dsa.recursion.base_case"],
    patternTags: ["tree","dfs","transformation"],
    constraints: "0 <= nodes <= 2e5; input uses level-order # null markers.",
    targetComplexity: "O(n) time and O(h) recursion space (or O(w) iterative queue space).",
    requiredEdgeCases: ["empty tree","one-sided tree","single node"],
    clarifyingQuestions: ["Should the original nodes be reused?","Is either recursive or iterative traversal acceptable?"],
    hintLadder: ["Every node performs the same local transformation: swap its two child pointers.","After swapping, recursively mirror both subtrees.","The order of mirroring before or after the swap is fine if both children are processed exactly once."],
    visibleExamples: [{ input: "7\n4 2 7 1 3 6 9", output: "4 7 2 9 6 3 1" }],
    externalLinks: [USACO],
    interviewCore: true
  },
  {
    id: "iv.tree.same-structure-values",
    version: 1,
    title: "Compare two tree snapshots",
    prompt: "Given two binary trees, return whether they have identical shape and the same value at every corresponding node.",
    group: "trees_bst",
    roleRelevance: "systems",
    difficulty: "easy",
    primarySkillId: "dsa.trees.traversal",
    secondarySkillIds: ["dsa.recursion.base_case"],
    patternTags: ["tree","recursion","structural-comparison"],
    constraints: "Each tree has at most 2e5 nodes; values fit 64-bit signed integers.",
    targetComplexity: "O(n) time over corresponding nodes and O(h) recursion space.",
    requiredEdgeCases: ["both trees empty","same values but different structure","mismatch near a leaf"],
    clarifyingQuestions: ["Must both shape and values match?","Can both inputs be empty?"],
    hintLadder: ["Compare the two current nodes as a pair.","Two nulls match; exactly one null does not.","For non-null nodes, require equal values and recursive equality of both left and right child pairs."],
    visibleExamples: [{ input: "3\n1 2 3\n3\n1 2 3", output: "1" }],
    externalLinks: [USACO],
    interviewCore: true
  },
  {
    id: "iv.bst.range-sum",
    version: 1,
    title: "Aggregate a bounded BST range",
    prompt: "Given a binary search tree and inclusive bounds [low, high], return the sum of all node values inside the range. Use BST ordering to skip subtrees that cannot contribute.",
    group: "trees_bst",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.trees.bst_search",
    secondarySkillIds: ["dsa.trees.traversal"],
    patternTags: ["bst","dfs","pruning"],
    constraints: "0 <= nodes <= 2e5; BST values are distinct; sum may exceed 32-bit.",
    targetComplexity: "O(v) time for visited nodes, with pruning; O(h) recursion space.",
    requiredEdgeCases: ["range contains no nodes","range contains all nodes","bounds equal a node value"],
    clarifyingQuestions: ["Is the tree guaranteed to be a BST?","Are low and high inclusive?"],
    hintLadder: ["If node.value < low, its entire left subtree is too small.","If node.value > high, its entire right subtree is too large.","Only recurse toward subtrees that can still contain values in the requested interval."],
    visibleExamples: [{ input: "7\n10 5 15 3 7 13 18\n7 15", output: "45" }],
    externalLinks: [USACO],
    interviewCore: true
  },
  {
    id: "iv.tree.longest-univalue-path",
    version: 1,
    title: "Longest same-value connection chain",
    prompt: "Return the maximum number of edges on any path whose nodes all hold the same value. The path may pass through a node using both child branches but cannot revisit nodes.",
    group: "trees_bst",
    roleRelevance: "general",
    difficulty: "hard",
    primarySkillId: "dsa.trees.traversal",
    secondarySkillIds: ["dsa.techniques.dp_design"],
    patternTags: ["tree-dp","postorder","path"],
    constraints: "0 <= nodes <= 2e5; result counts edges, not nodes.",
    targetComplexity: "O(n) time and O(h) recursion space.",
    requiredEdgeCases: ["single node returns zero","best path crosses a node","equal values separated by a different value do not connect"],
    clarifyingQuestions: ["Does length count edges or nodes?","May the best path start below the root?"],
    hintLadder: ["Return the longest one-direction same-value arm from each node to its parent.","A child arm can be extended only when the child value equals the current value.","Update the global best with leftArm + rightArm, while returning max(leftArm,rightArm)."],
    visibleExamples: [{ input: "7\n5 4 5 1 1 # 5", output: "2" }],
    externalLinks: [USACO],
    interviewCore: true
  },
  {
    id: "iv.tree.enumerate-root-leaf-paths",
    version: 1,
    title: "Enumerate terminal tree routes",
    prompt: "Enumerate every root-to-leaf value path in a binary tree. Format each path with -> between values and return the paths in lexicographic order so output is deterministic.",
    group: "trees_bst",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.trees.traversal",
    secondarySkillIds: ["dsa.recursion.base_case"],
    patternTags: ["tree","dfs","backtracking","return-witness"],
    constraints: "0 <= nodes <= 1e5; total output size is bounded by 1e6 characters.",
    targetComplexity: "O(n + output size) traversal plus sorting of emitted paths.",
    requiredEdgeCases: ["empty tree","single leaf","one-sided branch"],
    clarifyingQuestions: ["What deterministic ordering should paths use?","Should internal-node prefixes be emitted?"],
    hintLadder: ["Maintain the current path while descending DFS.","Emit only when both children are null, then backtrack before exploring the sibling.","Sort the completed path strings before output so tree shape does not make the contract ambiguous."],
    visibleExamples: [{ input: "5\n1 2 3 # 5", output: "1->2->5|1->3" }],
    externalLinks: [USACO],
    interviewCore: true
  },
  {
    id: "iv.tree.serialize-roundtrip",
    version: 1,
    title: "Canonical tree serialization round trip",
    prompt: "Implement a deterministic binary-tree serializer/deserializer pair. Given a level-order tree with # null markers, deserialize it and serialize it back canonically, removing only redundant trailing null markers.",
    group: "trees_bst",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.trees.traversal",
    secondarySkillIds: ["dsa.strings.parsing"],
    patternTags: ["tree","serialization","bfs","api-design"],
    constraints: "0 <= nodes <= 2e5; values fit 64-bit signed integers; # denotes null.",
    targetComplexity: "O(n) time and O(w) queue space for serialization/deserialization.",
    requiredEdgeCases: ["empty tree","one-sided sparse tree","negative node values"],
    clarifyingQuestions: ["Must serialization be deterministic?","May redundant trailing null markers be omitted?"],
    hintLadder: ["Breadth-first order naturally preserves where missing children occur.","When deserializing, assign tokens to left/right child slots of queued parents in order.","When serializing, keep # placeholders for internal gaps but trim # values only from the very end."],
    visibleExamples: [{ input: "7\n1 2 3 # # 4 5", output: "1 2 3 # # 4 5" }],
    externalLinks: [USACO],
    interviewCore: true
  },
  {
    id: "iv.dp.edit-distance",
    version: 1,
    title: "Minimum edits between configuration strings",
    prompt: "Return the minimum number of single-character insertions, deletions, and replacements needed to transform one string into another. Define a two-prefix DP state and make all three edit choices explicit.",
    group: "dp_backtracking",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.techniques.dp_design",
    secondarySkillIds: ["dsa.techniques.dp_forms"],
    patternTags: ["dynamic-programming","sequence-dp","edit-distance"],
    constraints: "0 <= each length <= 2000; input strings occupy separate lines.",
    targetComplexity: "O(n*m) time; O(min(n,m)) space is preferred after deriving the full DP.",
    requiredEdgeCases: ["one string empty","strings already equal","replacement versus insert/delete tradeoff"],
    clarifyingQuestions: ["Do insert, delete, and replace each cost one?","Can either string be empty?"],
    hintLadder: ["Let dp[i][j] describe the best cost for prefixes of lengths i and j.","Equal final characters carry dp[i-1][j-1] forward unchanged.","For unequal characters take 1 + min(delete dp[i-1][j], insert dp[i][j-1], replace dp[i-1][j-1])."],
    visibleExamples: [{ input: "horse\nros", output: "3" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.backtracking.generate-balanced-parentheses",
    version: 1,
    title: "Generate only valid delimiter sequences",
    prompt: "Generate all balanced parenthesis strings containing n pairs. Build only prefixes that can still become valid rather than generating all 2^(2n) strings and filtering afterward.",
    group: "dp_backtracking",
    roleRelevance: "general",
    difficulty: "medium",
    primarySkillId: "dsa.complexity.recursion_choice",
    secondarySkillIds: ["dsa.stacks.basic_stack"],
    patternTags: ["backtracking","constraint-pruning","generation"],
    constraints: "0 <= n <= 8; output strings must be in lexicographic order with '(' explored before ')'.",
    targetComplexity: "O(C_n * n) output-sensitive time and O(n) recursion depth.",
    requiredEdgeCases: ["n = 0","n = 1","never close more pairs than have been opened"],
    clarifyingQuestions: ["What order should results use?","For n=0 is the only conceptual result the empty string?"],
    hintLadder: ["Track how many opening and closing parentheses have been placed.","You may add '(' while opens < n, and ')' only while closes < opens.","DFS with '(' before ')' naturally emits the requested lexicographic order."],
    visibleExamples: [{ input: "3", output: "((())) (()()) (())() ()(()) ()()()" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.dp.longest-increasing-subsequence",
    version: 1,
    title: "Longest increasing trend length",
    prompt: "Return the length of the longest strictly increasing subsequence. After deriving the O(n^2) DP, optimize to O(n log n) by maintaining the smallest possible tail value for each subsequence length.",
    group: "dp_backtracking",
    roleRelevance: "streaming",
    difficulty: "hard",
    primarySkillId: "dsa.techniques.dp_forms",
    secondarySkillIds: ["dsa.searching.binary_search"],
    patternTags: ["dynamic-programming","binary-search","subsequence","lis"],
    constraints: "0 <= n <= 2e5; values fit 64-bit signed integers; increasing means strictly greater.",
    targetComplexity: "O(n log n) time and O(n) space.",
    requiredEdgeCases: ["strictly decreasing input","duplicate values","empty input"],
    clarifyingQuestions: ["Is the subsequence required to be contiguous?","Is increasing strict or non-decreasing?"],
    hintLadder: ["For each possible subsequence length, only the smallest tail seen so far matters for future extension.","Keep these tails sorted and binary-search the first tail >= current value.","Replace that tail, or append when current value exceeds all tails; the tails array length is the LIS length."],
    visibleExamples: [{ input: "8\n10 9 2 5 3 7 101 18", output: "4" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.design.snapshot-array",
    version: 1,
    title: "Versioned array snapshots",
    prompt: "Design a fixed-length integer array that supports point set, snap, and get(index, snapId). A snapshot freezes the logical values without copying the entire array; historical reads should search only the changed history for that index.",
    group: "arrays_hashing_prefix",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.searching.binary_search",
    secondarySkillIds: ["dsa.arrays.indexing"],
    patternTags: ["data-structure-design","versioning","binary-search","history"],
    constraints: "1 <= length <= 1e5; 1 <= operations <= 2e5; values fit 32-bit signed integers.",
    targetComplexity: "O(1) amortized set/snap and O(log changes_at_index) get, with O(number of sets) history space.",
    requiredEdgeCases: ["get an index never set","multiple sets before one snapshot","read an old snapshot after later writes"],
    clarifyingQuestions: ["What is the initial value of every index?","Does snap return the id it just created?"],
    hintLadder: ["Store history only when a value changes instead of copying all indices on snap.","For each index keep sorted (snapshotId,value) pairs; overwrite the latest pair if multiple sets happen in one current snapshot.","get uses upper_bound for the requested snapshot id and returns the preceding value, defaulting to zero."],
    visibleExamples: [{ input: "3 7\nset 0 5\nsnap\nset 0 6\nget 0 0\nsnap\nget 0 1\nget 1 0", output: "0\n5\n1\n6\n0" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.design.time-key-value",
    version: 1,
    title: "Historical key-value reads",
    prompt: "Build an in-memory key-value history. set(key,value,timestamp) appends a value at an increasing timestamp for that key; get(key,timestamp) returns the value from the greatest stored timestamp <= the query, or '-' when none exists.",
    group: "arrays_hashing_prefix",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.hashing.lookup",
    secondarySkillIds: ["dsa.searching.binary_search"],
    patternTags: ["hash-map","binary-search","time-indexed","data-structure-design"],
    constraints: "1 <= operations <= 2e5; timestamps for each key arrive in strictly increasing order; keys and values contain no spaces.",
    targetComplexity: "O(1) amortized set and O(log versions_per_key) get.",
    requiredEdgeCases: ["query before first value","query between two versions","missing key"],
    clarifyingQuestions: ["Are set timestamps increasing per key?","What should get return when no historical value exists?"],
    hintLadder: ["Hash the key to its own chronological vector of versions.","Because timestamps are appended in sorted order, no insertion sort is needed.","Binary-search the first stored timestamp greater than the query, then step back one version."],
    visibleExamples: [{ input: "7\nset foo bar 1\nset foo baz 4\nget foo 1\nget foo 3\nget foo 4\nget foo 5\nget nope 5", output: "bar\nbar\nbaz\nbaz\n-" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.list.clone-random-links",
    version: 1,
    title: "Clone a list with cross-links",
    prompt: "Deep-copy a linked list where every node has next plus an optional random pointer to any node in the same list. The clone must preserve all random relationships while sharing no node objects with the original.",
    group: "linked_cache",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.hashing.lookup",
    secondarySkillIds: ["dsa.arrays.traversal"],
    patternTags: ["linked-list","hash-map","deep-copy","graph-like"],
    constraints: "0 <= n <= 2e5; random indices are -1 or in [0,n); values may repeat.",
    targetComplexity: "O(n) time; O(n) map space is acceptable (or O(1) with the interleaving technique).",
    requiredEdgeCases: ["null random pointers","self-random pointer","empty list"],
    clarifyingQuestions: ["May random point to the same node?","Must the clone share no nodes with the original?"],
    hintLadder: ["You need a mapping from each original identity to its clone identity before wiring arbitrary cross-links.","First create all clone nodes, then make a second pass to assign next/random through the map.","An O(1)-extra alternative temporarily interleaves clone nodes with originals, but a map is the clearest baseline."],
    visibleExamples: [{ input: "3\n10 20 30\n2 -1 0", output: "10 2\n20 -1\n30 0" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.graph.robot-room-exploration",
    version: 1,
    title: "Explore an unknown room with reversible moves",
    prompt: "A robot starts on an open cell of a blocked grid and can conceptually move/turn while remembering only discovered coordinates. Return how many open cells are reachable. Structure the DFS so every recursive move has an explicit backtrack to restore position/orientation for the caller.",
    group: "graphs_paths",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.graphs.dfs",
    secondarySkillIds: [],
    patternTags: ["dfs","backtracking","state-machine","grid"],
    constraints: "1 <= rows,cols <= 200; grid uses . for open and # for blocked; start coordinates are inside the grid.",
    targetComplexity: "O(reachable cells) time and O(reachable cells) visited/recursion space.",
    requiredEdgeCases: ["blocked start","one-cell room","disconnected open regions"],
    clarifyingQuestions: ["Can the robot directly inspect the full map in the conceptual solution?","Must each recursive call restore the caller's position/orientation?"],
    hintLadder: ["Assign discovered cells relative coordinates and mark them visited before exploring neighbors.","For each direction: attempt a move, recurse on success, then perform the inverse move/turn sequence to return.","The judge provides the grid only to make the interactive behavior deterministic; the transferable invariant is restoring state after every branch."],
    visibleExamples: [{ input: "4 5 0 0\n..#..\n.##..\n.....\n#....", output: "16" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.graph.k-stop-cheapest-route",
    version: 1,
    title: "Cheapest route with a hop budget",
    prompt: "Given directed weighted links, source, destination, and k allowed intermediate stops, return the cheapest route price using at most k+1 edges. The edge-count constraint is part of the state, so ordinary one-distance-per-node Dijkstra reasoning is insufficient.",
    group: "graphs_paths",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.graphs.shortest_path",
    secondarySkillIds: ["dsa.techniques.dp_design"],
    patternTags: ["shortest-path","state-augmentation","bounded-edges"],
    constraints: "1 <= n <= 500; 0 <= edges <= 2e4; weights are non-negative; 0 <= k < n.",
    targetComplexity: "O((k+1)E) with layered Bellman-Ford, or an equivalent state-augmented shortest-path method.",
    requiredEdgeCases: ["destination unreachable","cheapest unrestricted route uses too many stops","direct edge beats constrained alternatives"],
    clarifyingQuestions: ["Does k count intermediate stops or edges?","Are edge weights non-negative?"],
    hintLadder: ["Treat solutions using 0,1,...,k+1 edges as separate layers.","For each layer, relax edges from a copy of the previous layer so one iteration cannot accidentally use multiple new edges.","After k+1 relaxation rounds, the destination distance is the best route respecting the stop budget."],
    visibleExamples: [{ input: "4 5 0 3 1\n0 1 100\n1 2 100\n2 3 100\n0 2 500\n0 3 700", output: "600" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.graph.reconstruct-itinerary",
    version: 1,
    title: "Consume every route edge exactly once",
    prompt: "Given directed route tickets that together admit an itinerary starting at JFK and using every ticket exactly once, return the lexicographically smallest complete itinerary. Multiple tickets between the same airports are distinct edges.",
    group: "graphs_paths",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.graphs.dfs",
    secondarySkillIds: ["dsa.sorting.comparator"],
    patternTags: ["eulerian-path","hierholzer","graph","ordering"],
    constraints: "1 <= tickets <= 2e5; airport codes contain uppercase letters; a valid itinerary from JFK is guaranteed.",
    targetComplexity: "O(E log E) sorting/heap work and O(E) traversal space.",
    requiredEdgeCases: ["multiple outgoing choices","duplicate edges","route must defer a tempting lexical edge to consume all tickets"],
    clarifyingQuestions: ["Is a valid itinerary guaranteed?","Should lexical order break ties among valid full itineraries?"],
    hintLadder: ["A greedy forward walk can get stranded even when its next edge is lexicographically smallest.","Hierholzer consumes outgoing edges recursively and appends a node only when it has no unused edge left.","Choose outgoing edges in lexical order, build the route in reverse postorder, then reverse it once."],
    visibleExamples: [{ input: "4\nJFK SFO\nJFK ATL\nSFO ATL\nATL JFK", output: "JFK ATL JFK SFO ATL" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.graph.alien-order",
    version: 1,
    title: "Infer symbol precedence from sorted records",
    prompt: "A list of words is sorted according to an unknown alphabet over the characters that appear. Infer one valid character order from the first differing character of adjacent words. Return the lexicographically smallest valid order, or INVALID for an impossible prefix relation or precedence cycle.",
    group: "graphs_paths",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.graphs.topological_sort",
    secondarySkillIds: ["dsa.strings.parsing"],
    patternTags: ["topological-sort","graph-construction","strings","cycle-detection"],
    constraints: "1 <= words <= 2e4; total characters <= 2e5; words use lowercase ASCII letters.",
    targetComplexity: "O(total characters + E log alphabet) using graph construction plus min-heap topological sort.",
    requiredEdgeCases: ["longer word before its exact prefix is invalid","cycle in inferred precedence","characters with no edges still appear"],
    clarifyingQuestions: ["Should characters with no constraints be included?","What deterministic order should be returned when several topological orders are valid?"],
    hintLadder: ["Only the first differing character of each adjacent word pair creates an ordering edge.","If no differing position exists and the earlier word is longer, the input is impossible.","Run Kahn's algorithm with a min-heap of zero-indegree characters; if output omits any seen character, a cycle exists."],
    visibleExamples: [{ input: "5\nwrt\nwrf\ner\nett\nrftt", output: "wertf" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.graph.multi-source-spread",
    version: 1,
    title: "Propagate from all active sources",
    prompt: "A grid contains active sources (2), inactive targets (1), empty cells (0), and blocked cells (-1). Every minute, activity spreads from active cells to orthogonally adjacent inactive targets. Return minutes until every target is active, or -1 if some target can never be reached.",
    group: "graphs_paths",
    roleRelevance: "systems",
    difficulty: "medium",
    primarySkillId: "dsa.graphs.bfs",
    secondarySkillIds: ["dsa.arrays.traversal"],
    patternTags: ["multi-source","bfs","grid","distance-layers"],
    constraints: "1 <= rows,cols <= 500; four-neighbor movement only.",
    targetComplexity: "O(rows*cols) time and space.",
    requiredEdgeCases: ["multiple initial sources","unreachable target","no inactive targets"],
    clarifyingQuestions: ["Do all initial sources spread simultaneously?","Are blocked and empty cells traversable?"],
    hintLadder: ["Starting separate BFS runs would repeat work; enqueue every source before time begins.","A multi-source BFS assigns each cell its minimum distance to any source.","Process the queue in distance layers (or store distances) and count how many inactive targets remain."],
    visibleExamples: [{ input: "3 3\n2 1 1\n1 1 0\n0 1 1", output: "4" }],
    externalLinks: [CPALGO],
    interviewCore: true
  },
  {
    id: "iv.graph.zero-one-grid-route",
    version: 1,
    title: "Shortest grid route with zero-one costs",
    prompt: "Each grid cell costs either 0 or 1 to enter. Starting at the top-left, return the minimum total entry cost needed to reach the bottom-right, excluding the starting cell's cost. Exploit the two possible edge weights instead of using a general heap.",
    group: "graphs_paths",
    roleRelevance: "systems",
    difficulty: "hard",
    primarySkillId: "dsa.graphs.shortest_path",
    secondarySkillIds: ["dsa.graphs.bfs"],
    patternTags: ["zero-one-bfs","shortest-path","deque","grid"],
    constraints: "1 <= rows,cols <= 500; every cell cost is 0 or 1; four-neighbor movement.",
    targetComplexity: "O(V+E) with 0-1 BFS and a deque.",
    requiredEdgeCases: ["single-cell grid","all costs one","zero-cost detour beats a shorter geometric route"],
    clarifyingQuestions: ["Does the starting cell cost count?","Are weights always exactly 0 or 1?"],
    hintLadder: ["Model moving into a neighbor as an edge weighted by that neighbor's cell cost.","When a relaxation has weight 0, its new distance is as urgent as the current frontier; weight 1 belongs after it.","Use a deque: push_front for weight 0 and push_back for weight 1, relaxing exactly like shortest paths."],
    visibleExamples: [{ input: "3 3\n0 1 1\n0 0 1\n1 0 0", output: "0" }],
    externalLinks: [CPALGO],
    interviewCore: true
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

/**
 * Whether a problem is in the reviewed interview-core set (#176). Reads the
 * explicit flag, defaulting to core — importance is never inferred from item
 * count or skill references.
 */
export function isInterviewCoreProblem(problem: InterviewProblem): boolean {
  return problem.interviewCore ?? true;
}

/** The reviewed interview-core problems (#176). */
export function getInterviewCoreProblems(): InterviewProblem[] {
  return interviewProblems.filter(isInterviewCoreProblem);
}
