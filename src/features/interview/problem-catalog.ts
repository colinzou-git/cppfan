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
