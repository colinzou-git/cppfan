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
  },
  {
    id: "fu.min-rate.stricter-target",
    version: 1,
    problemId: "iv.bsearch.min-rate-before-deadline",
    parentVersion: 1,
    kind: "stricter_target",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "The deadline H is suddenly halved. Does your search still find the answer, and what changes in the feasible range?",
    affectedConstraints: "A tighter deadline raises the minimum feasible rate and may make some inputs infeasible.",
    expectedReasoningShift: "The monotonic predicate is unchanged; only the boundary moves — confirm the search still brackets it and handle the now-infeasible case.",
    targetRubricDimensions: ["follow_up_adaptability", "correctness"],
    timeBudgetMinutes: 6,
    revealPolicy: "after_attempt",
    explanation: "Halving H shifts the infeasible/feasible boundary upward; the same binary search applies, plus an explicit check when even the max rate cannot meet H."
  },
  {
    id: "fu.cheapest-route.compare-approaches",
    version: 1,
    problemId: "iv.graph.cheapest-route",
    parentVersion: 1,
    kind: "compare_approaches",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "A few edges now have negative weights (but no negative cycle). Why can Dijkstra give a wrong answer, and what would you use instead?",
    affectedConstraints: "Negative edges break Dijkstra's greedy finalization invariant.",
    expectedReasoningShift: "Recognize that a finalized node can later be improved; switch to Bellman-Ford (or SPFA), trading the log factor for O(V*E).",
    targetRubricDimensions: ["optimization", "complexity"],
    timeBudgetMinutes: 8,
    revealPolicy: "after_attempt",
    explanation: "Dijkstra assumes once-popped distances are final, which negative edges violate; Bellman-Ford relaxes all edges V-1 times and tolerates negative weights."
  },
  {
    id: "fu.fewest-hops.support-updates",
    version: 1,
    problemId: "iv.graph.fewest-hops",
    parentVersion: 1,
    kind: "support_updates",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 1,
    prompt: "Edges are now added over time and you must answer connectivity/hop queries interleaved with the additions. What changes?",
    affectedConstraints: "The graph mutates between queries; a single BFS per query may be too slow at scale.",
    expectedReasoningShift: "For connectivity, incremental union-find handles additions; exact shortest hops under updates needs recomputation or a different structure — discuss the tradeoff.",
    targetRubricDimensions: ["follow_up_adaptability", "optimization"],
    timeBudgetMinutes: 8,
    revealPolicy: "after_attempt",
    explanation: "Edge additions are exactly what union-find handles incrementally for connectivity; recomputing BFS per query is the simple fallback when exact distances are required."
  },
  {
    id: "fu.kth-smallest.support-updates",
    version: 1,
    problemId: "iv.bst.kth-smallest",
    parentVersion: 1,
    kind: "support_updates",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Now values are inserted and deleted between k-th-smallest queries. How do you keep each query fast?",
    affectedConstraints: "A plain in-order walk is O(n) per query and ignores mutations.",
    expectedReasoningShift: "Augment each node with its subtree size so k-th smallest is an O(h) descent maintained across inserts/deletes (an order-statistics tree).",
    targetRubricDimensions: ["optimization", "follow_up_adaptability"],
    timeBudgetMinutes: 9,
    revealPolicy: "after_attempt",
    explanation: "Subtree-size augmentation turns k-th-smallest into an O(h) walk and updates in O(h) on insert/delete — an order-statistics tree."
  },
  {
    id: "fu.running-median.out-of-memory",
    version: 1,
    problemId: "iv.heap.running-median",
    parentVersion: 1,
    kind: "out_of_memory",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "The stream is far too large to keep every value in two heaps. How would you report an approximate median in bounded memory?",
    affectedConstraints: "O(n) heap memory is no longer affordable for an unbounded stream.",
    expectedReasoningShift: "Move from exact two-heaps to a bounded-memory approximation (reservoir sampling, t-digest, or histogram quantiles) and discuss the accuracy tradeoff.",
    targetRubricDimensions: ["optimization", "communication"],
    timeBudgetMinutes: 9,
    revealPolicy: "after_attempt",
    explanation: "Exact median needs O(n) memory; bounded-memory sketches (t-digest/histograms) trade exactness for constant space."
  },
  {
    id: "fu.merge-k-sorted.stream",
    version: 1,
    problemId: "iv.heap.merge-k-sorted",
    parentVersion: 1,
    kind: "stream",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 1,
    prompt: "Each of the k inputs is now an unbounded stream rather than a finite list. Does your approach still work, and what must you be careful about?",
    affectedConstraints: "Inputs never end; you cannot load them fully and must emit lazily.",
    expectedReasoningShift: "The k-way min-heap still works as a pull-based merge; discuss back-pressure and that the merge itself is unbounded.",
    targetRubricDimensions: ["follow_up_adaptability", "communication"],
    timeBudgetMinutes: 6,
    revealPolicy: "after_attempt",
    explanation: "A k-entry min-heap pulling one element per source streams the merge in O(log k) per output without materializing the inputs."
  },
  {
    id: "fu.subarrays-sum-k.support-updates",
    version: 1,
    problemId: "iv.prefix.subarrays-sum-k",
    parentVersion: 1,
    kind: "support_updates",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "The array values now change between queries (point updates), and you must answer range sums after each. What structure fits?",
    affectedConstraints: "A static prefix-sum array is invalidated by every update.",
    expectedReasoningShift: "Replace the static prefix array with a Fenwick/segment tree giving O(log n) point update and prefix query.",
    targetRubricDimensions: ["optimization", "follow_up_adaptability"],
    timeBudgetMinutes: 8,
    revealPolicy: "after_attempt",
    explanation: "Point updates break a static prefix array; a Fenwick tree supports O(log n) updates and prefix sums."
  },
  {
    id: "fu.lru.thread-safety",
    version: 1,
    problemId: "iv.cache.lru-design",
    parentVersion: 1,
    kind: "thread_safety_discussion",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Multiple threads now call get and put concurrently. Where are the races, and how would you make it safe without requiring lock-free code?",
    affectedConstraints: "The map and the recency list are mutated by get as well as put, so reads are not read-only.",
    expectedReasoningShift: "Identify that get mutates recency (so a shared lock is insufficient); discuss a single mutex, or sharding by key to reduce contention.",
    targetRubricDimensions: ["communication", "cpp_implementation"],
    timeBudgetMinutes: 8,
    revealPolicy: "after_attempt",
    explanation: "Because get reorders the recency list, it is a writer; a single mutex is correct, and sharding the cache by key bucket reduces contention."
  },
  {
    id: "fu.count-clusters.operation-mix-change",
    version: 1,
    problemId: "iv.dsu.count-clusters",
    parentVersion: 1,
    kind: "operation_mix_change",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Connections can now also be REMOVED between queries, not just added. Why does plain union-find struggle, and what would you do?",
    affectedConstraints: "Union-find supports merges but has no efficient undo/split for arbitrary deletions.",
    expectedReasoningShift: "Recognize deletion is the hard case; discuss offline processing in reverse (turn deletions into additions) or a link-cut/Euler-tour structure.",
    targetRubricDimensions: ["optimization", "follow_up_adaptability"],
    timeBudgetMinutes: 9,
    revealPolicy: "after_attempt",
    explanation: "DSU cannot delete edges efficiently; processing queries offline in reverse converts removals into unions, or use dynamic-connectivity structures."
  },
  {
    id: "fu.fewest-coins.return-witness",
    version: 1,
    problemId: "iv.dp.fewest-coins",
    parentVersion: 1,
    kind: "return_witness",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 1,
    prompt: "In addition to the minimum count, return the actual multiset of coins used.",
    affectedConstraints: "The DP currently stores only counts, not the choice that achieved them.",
    expectedReasoningShift: "Record the chosen coin (parent pointer) per amount and reconstruct by walking back from the target.",
    targetRubricDimensions: ["correctness", "cpp_implementation"],
    timeBudgetMinutes: 6,
    revealPolicy: "after_attempt",
    explanation: "Store which coin minimized each amount, then backtrack from the target to list the coins."
  },
  {
    id: "fu.min-rooms.return-witness",
    version: 1,
    problemId: "iv.intervals.min-rooms",
    parentVersion: 1,
    kind: "return_witness",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 1,
    prompt: "Besides the room count, output an assignment of each meeting to a specific room number.",
    affectedConstraints: "The sweep currently tracks only the peak count, not which room each meeting uses.",
    expectedReasoningShift: "Keep a pool of free room ids; on a start pop a free room, on an end return it — recording the assignment.",
    targetRubricDimensions: ["correctness", "follow_up_adaptability"],
    timeBudgetMinutes: 7,
    revealPolicy: "after_attempt",
    explanation: "A min-heap of free room ids (or a free-list) lets each start claim a room and each end release one, yielding a concrete assignment."
  },
  {
    id: "fu.iterator-invalidation.make-reusable",
    version: 1,
    problemId: "iv.cpp.iterator-invalidation",
    parentVersion: 1,
    kind: "make_reusable_testable",
    trigger: "after_remediation",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Turn the fixed logic into a small reusable, unit-tested transform (input vector -> output vector) with a couple of cases that would have caught the original bug.",
    affectedConstraints: "The fix must be packaged as a pure function with tests, not inline loop edits.",
    expectedReasoningShift: "Extract a pure transform, add a test where appended elements force reallocation, and assert the result and no UB.",
    targetRubricDimensions: ["testing", "cpp_implementation"],
    timeBudgetMinutes: 8,
    revealPolicy: "after_attempt",
    explanation: "A pure function plus a test that forces reallocation (e.g. many even values) would have caught the iterator-invalidation defect."
  },
  {
    id: "fu.pair-sum-sorted.stricter-target",
    version: 1,
    problemId: "iv.twoptr.pair-sum-sorted",
    parentVersion: 1,
    kind: "stricter_target",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 1,
    prompt: "Now there may be no exact match; return the pair whose sum is closest to the target.",
    affectedConstraints: "An exact hit is no longer guaranteed; you must track the best near-miss.",
    expectedReasoningShift: "Keep the same converging pointers but record the minimum |sum - target| seen, updating as you move.",
    targetRubricDimensions: ["follow_up_adaptability", "correctness"],
    timeBudgetMinutes: 6,
    revealPolicy: "after_attempt",
    explanation: "The two-pointer sweep still applies; track the closest absolute difference while deciding which pointer to move."
  },
  {
    id: "fu.most-water.compare-approaches",
    version: 1,
    problemId: "iv.twoptr.most-water",
    parentVersion: 1,
    kind: "compare_approaches",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Argue why moving the pointer at the shorter line never skips a larger area, versus the brute-force O(n^2).",
    affectedConstraints: "Correctness now hinges on a justification, not just a passing run.",
    expectedReasoningShift: "Show that the shorter line caps any area at the current width, so moving it is the only way to possibly improve.",
    targetRubricDimensions: ["baseline_reasoning", "communication"],
    timeBudgetMinutes: 7,
    revealPolicy: "after_attempt",
    explanation: "Holding the shorter line and shrinking width can only lose area, so discarding it loses no optimal pair — the greedy is safe."
  },
  {
    id: "fu.is-palindrome.diagnose-bug",
    version: 1,
    problemId: "iv.twoptr.is-palindrome",
    parentVersion: 1,
    kind: "diagnose_bug",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 1,
    prompt: "A teammate's version loops `while (i < j)` but never advances i/j when skipping non-alphanumeric characters, hanging on inputs like \",,\". Find and fix it.",
    affectedConstraints: "Skipping must still make progress or the loop never terminates.",
    expectedReasoningShift: "Advance the pointer when skipping a non-alphanumeric character; only compare when both point at alphanumerics.",
    targetRubricDimensions: ["testing", "cpp_implementation"],
    timeBudgetMinutes: 6,
    revealPolicy: "after_attempt",
    explanation: "The skip branch must increment i (or decrement j); otherwise the loop spins forever on punctuation."
  },
  {
    id: "fu.longest-distinct.stricter-target",
    version: 1,
    problemId: "iv.sliding.longest-distinct",
    parentVersion: 1,
    kind: "stricter_target",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Now allow each element to repeat at most K times within the window. Find the longest such window.",
    affectedConstraints: "The window is valid while every element's count stays <= K, not just distinct.",
    expectedReasoningShift: "Track per-element counts and shrink from the left when any count exceeds K, generalizing the distinct case (K=1).",
    targetRubricDimensions: ["follow_up_adaptability", "optimization"],
    timeBudgetMinutes: 7,
    revealPolicy: "after_attempt",
    explanation: "Keep counts in the window; expand right, and shrink left whenever an element's count passes K — K=1 recovers all-distinct."
  },
  {
    id: "fu.window-peak.stream",
    version: 1,
    problemId: "iv.queue.window-peak-load",
    parentVersion: 1,
    kind: "stream",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 1,
    prompt: "Readings now arrive as an unbounded stream; emit each window's max as soon as it is complete, in O(1) amortized.",
    affectedConstraints: "You cannot store the whole array; only the current window's candidates.",
    expectedReasoningShift: "The monotonic deque already holds only window candidates; confirm it is O(1) amortized and bounded by k.",
    targetRubricDimensions: ["complexity", "follow_up_adaptability"],
    timeBudgetMinutes: 6,
    revealPolicy: "after_attempt",
    explanation: "The monotonic deque keeps at most k indices and amortizes O(1) per reading, so it streams without storing history."
  },
  {
    id: "fu.balanced-delimiters.operation-mix-change",
    version: 1,
    problemId: "iv.stack.balanced-delimiters",
    parentVersion: 1,
    kind: "operation_mix_change",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Add a wildcard character that may stand for any single opener OR any single closer. Decide if a valid matching exists.",
    affectedConstraints: "A wildcard's role is ambiguous, so a single deterministic stack pass no longer suffices.",
    expectedReasoningShift: "Move from a stack to a range-DP or balanced-count interval check, since each wildcard branches.",
    targetRubricDimensions: ["optimization", "follow_up_adaptability"],
    timeBudgetMinutes: 9,
    revealPolicy: "after_attempt",
    explanation: "Wildcards introduce choices a single stack can't resolve; interval DP over substrings (or careful low/high open-count bounds) decides feasibility."
  },
  {
    id: "fu.steps-to-higher-load.return-witness",
    version: 1,
    problemId: "iv.stack.steps-to-higher-load",
    parentVersion: 1,
    kind: "return_witness",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 1,
    prompt: "Return the index of the next higher reading (or -1), not just the distance.",
    affectedConstraints: "You must report a position, so storing only the count is insufficient.",
    expectedReasoningShift: "Pop indices from the monotonic stack and record the resolving index directly instead of a difference.",
    targetRubricDimensions: ["correctness", "cpp_implementation"],
    timeBudgetMinutes: 5,
    revealPolicy: "after_attempt",
    explanation: "When the current reading resolves a stacked index, store the current index as that index's answer."
  },
  {
    id: "fu.min-stack.operation-mix-change",
    version: 1,
    problemId: "iv.stack.min-stack-design",
    parentVersion: 1,
    kind: "operation_mix_change",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Also support getMax in O(1) alongside getMin.",
    affectedConstraints: "A single min-tracking side stack does not track the maximum.",
    expectedReasoningShift: "Maintain a parallel running-max stack (or store (min,max) per level) updated on push/pop.",
    targetRubricDimensions: ["optimization", "cpp_implementation"],
    timeBudgetMinutes: 6,
    revealPolicy: "after_attempt",
    explanation: "Keep a second side stack of running maxima (symmetric to the min stack); both stay O(1)."
  },
  {
    id: "fu.tree-max-depth.out-of-memory",
    version: 1,
    problemId: "iv.tree.max-depth",
    parentVersion: 1,
    kind: "out_of_memory",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 1,
    prompt: "The tree is a 100k-node left chain, so naive recursion overflows the stack. Make it safe.",
    affectedConstraints: "Recursion depth equals the height, which can be the node count.",
    expectedReasoningShift: "Convert to an explicit stack/queue (iterative DFS or BFS) so depth lives on the heap, not the call stack.",
    targetRubricDimensions: ["cpp_implementation", "complexity"],
    timeBudgetMinutes: 6,
    revealPolicy: "after_attempt",
    explanation: "An iterative traversal with an explicit container avoids call-stack overflow on a degenerate (chain) tree."
  },
  {
    id: "fu.right-side-view.compare-approaches",
    version: 1,
    problemId: "iv.tree.right-side-view",
    parentVersion: 1,
    kind: "compare_approaches",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Compare level-order BFS (last per level) with a right-first DFS that records the first node seen at each new depth. When is each preferable?",
    affectedConstraints: "Both are O(n); the choice trades queue width for recursion depth.",
    expectedReasoningShift: "BFS uses O(width) memory; right-first DFS uses O(height) — pick by the tree's shape.",
    targetRubricDimensions: ["complexity", "communication"],
    timeBudgetMinutes: 6,
    revealPolicy: "after_attempt",
    explanation: "Wide trees favor the DFS (less memory than a huge queue); deep trees favor BFS to avoid deep recursion."
  },
  {
    id: "fu.tree-diameter.return-witness",
    version: 1,
    problemId: "iv.tree.diameter",
    parentVersion: 1,
    kind: "return_witness",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 1,
    prompt: "Return the two endpoint nodes of a longest path, not just its length.",
    affectedConstraints: "You must remember where the best path occurred, not only its size.",
    expectedReasoningShift: "When a node's left+right height beats the best, record the deepest leaf in each subtree as the endpoints.",
    targetRubricDimensions: ["correctness", "follow_up_adaptability"],
    timeBudgetMinutes: 8,
    revealPolicy: "after_attempt",
    explanation: "Track the deepest descendant per subtree so the node maximizing left+right height yields the two endpoints."
  },
  {
    id: "fu.validate-bst.diagnose-bug",
    version: 1,
    problemId: "iv.bst.validate",
    parentVersion: 1,
    kind: "diagnose_bug",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 1,
    prompt: "A teammate validates by only checking node.left < node < node.right at each node. Show a tree it wrongly accepts and fix it.",
    affectedConstraints: "Local parent-child checks miss ancestor bounds.",
    expectedReasoningShift: "Carry an open (low, high) interval down the recursion so each node is bounded by all ancestors.",
    targetRubricDimensions: ["testing", "correctness"],
    timeBudgetMinutes: 7,
    revealPolicy: "after_attempt",
    explanation: "A node can satisfy its parent yet violate a grandparent bound; pass tightening (low, high) limits down to catch it."
  },
  {
    id: "fu.lca.operation-mix-change",
    version: 1,
    problemId: "iv.bst.lowest-common-ancestor",
    parentVersion: 1,
    kind: "operation_mix_change",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Now it is a general binary tree with no ordering. Find the LCA without the BST shortcut.",
    affectedConstraints: "Without ordering you cannot decide direction by comparing values.",
    expectedReasoningShift: "Switch to a post-order search that returns when a subtree contains either target; the node where both sides return is the LCA.",
    targetRubricDimensions: ["follow_up_adaptability", "correctness"],
    timeBudgetMinutes: 8,
    revealPolicy: "after_attempt",
    explanation: "Recurse; if one target is found left and the other right, the current node is the LCA — no ordering needed."
  },
  {
    id: "fu.ways-to-step.operation-mix-change",
    version: 1,
    problemId: "iv.dp.ways-to-reach-step",
    parentVersion: 1,
    kind: "operation_mix_change",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 1,
    prompt: "Now you may climb 1, 2, or 3 steps at a time. Generalize the recurrence.",
    affectedConstraints: "The transition now sums three predecessors, not two.",
    expectedReasoningShift: "ways(n) = ways(n-1) + ways(n-2) + ways(n-3); keep a rolling triple instead of a pair.",
    targetRubricDimensions: ["follow_up_adaptability", "correctness"],
    timeBudgetMinutes: 5,
    revealPolicy: "after_attempt",
    explanation: "Extend the recurrence to three terms and roll three previous values in O(1) space."
  },
  {
    id: "fu.max-flow.return-witness",
    version: 1,
    problemId: "iv.dp.max-contiguous-flow",
    parentVersion: 1,
    kind: "return_witness",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 1,
    prompt: "Besides the maximum sum, return the start and end indices of the best run.",
    affectedConstraints: "Kadane tracks only the running sum, not where the run began.",
    expectedReasoningShift: "Record a tentative start when the running sum restarts, and capture [start,end] whenever a new best is set.",
    targetRubricDimensions: ["correctness", "cpp_implementation"],
    timeBudgetMinutes: 6,
    revealPolicy: "after_attempt",
    explanation: "Reset the candidate start when best_ending restarts at the current element; snapshot start..i when the maximum improves."
  },
  {
    id: "fu.pair-sums.operation-mix-change",
    version: 1,
    problemId: "iv.hash.pair-sums-to-target",
    parentVersion: 1,
    kind: "operation_mix_change",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Now values can repeat and you must count ALL unordered pairs summing to the target (not just one).",
    affectedConstraints: "Multiple pairs and duplicate values change counting and double-count risk.",
    expectedReasoningShift: "Count via a frequency map: pairs of distinct values multiply counts; equal values use n*(n-1)/2.",
    targetRubricDimensions: ["correctness", "optimization"],
    timeBudgetMinutes: 7,
    revealPolicy: "after_attempt",
    explanation: "From value frequencies, add freq[v]*freq[t-v] for v < t-v, and C(freq[v],2) when v == t-v."
  },
  {
    id: "fu.k-closest.stream",
    version: 1,
    problemId: "iv.heap.k-closest-points",
    parentVersion: 1,
    kind: "stream",
    trigger: "base_correct",
    timing: "after_implementation",
    priority: 1,
    prompt: "Points now arrive as a stream; at any time report the current k closest to the origin.",
    affectedConstraints: "You cannot re-scan all points each query; keep only k candidates.",
    expectedReasoningShift: "Maintain a size-k max-heap by squared distance, evicting the farthest as points arrive — O(log k) per point.",
    targetRubricDimensions: ["optimization", "follow_up_adaptability"],
    timeBudgetMinutes: 6,
    revealPolicy: "after_attempt",
    explanation: "A size-k max-heap keyed by squared distance keeps the k closest incrementally without storing the whole stream."
  },
  {
    id: "fu.merge-intervals.support-updates",
    version: 1,
    problemId: "iv.intervals.merge-overlapping",
    parentVersion: 1,
    kind: "support_updates",
    trigger: "base_correct",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Intervals are now inserted one at a time and you must keep the merged set correct after each insert.",
    affectedConstraints: "Re-sorting and re-merging from scratch on every insert is too slow.",
    expectedReasoningShift: "Keep the merged intervals in an ordered map keyed by start; on insert, find neighbors and merge locally in O(log n + merged).",
    targetRubricDimensions: ["optimization", "follow_up_adaptability"],
    timeBudgetMinutes: 9,
    revealPolicy: "after_attempt",
    explanation: "An ordered map of disjoint intervals lets each insert merge only the overlapping neighbors, avoiding a full re-sort."
  },
  {
    id: "fu.dangling-reference.make-reusable",
    version: 1,
    problemId: "iv.cpp.dangling-reference",
    parentVersion: 1,
    kind: "make_reusable_testable",
    trigger: "after_remediation",
    timing: "after_acceptance",
    priority: 1,
    prompt: "After fixing it to return by value, justify that this is cheap (copy elision / move) and write a test that would have caught the original dangling read.",
    affectedConstraints: "The fix must be packaged with a regression test, and you must argue it is not a performance regression.",
    expectedReasoningShift: "Explain RVO/move semantics make return-by-value cheap, and add a test asserting the returned label is correct after the call returns.",
    targetRubricDimensions: ["testing", "cpp_implementation"],
    timeBudgetMinutes: 7,
    revealPolicy: "after_attempt",
    explanation: "Return-by-value is elided/moved (no real copy); a test that reads the result after the call would have exposed the dangling reference."
  },
  {
    id: "fu.missing-virtual-destructor.make-reusable",
    version: 1,
    problemId: "iv.cpp.missing-virtual-destructor",
    parentVersion: 1,
    kind: "make_reusable_testable",
    trigger: "after_remediation",
    timing: "after_acceptance",
    priority: 1,
    prompt: "Convert the factory to return std::unique_ptr<Base> and add a test that proves the Derived destructor runs (e.g. instrument it with a counter).",
    affectedConstraints: "Ownership must be explicit and the fix verified by a test, not by inspection.",
    expectedReasoningShift: "Use unique_ptr<Base> (with a virtual ~Base) so destruction is automatic and correct; a destructor-counter test proves Derived cleanup happens.",
    targetRubricDimensions: ["testing", "cpp_implementation"],
    timeBudgetMinutes: 8,
    revealPolicy: "after_attempt",
    explanation: "unique_ptr<Base> with a virtual base destructor destroys the Derived correctly; a counter incremented in ~Derived asserts it ran."
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
