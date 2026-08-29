import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";

const read = (p) => readFileSync(p, "utf8");
const write = (p, s) => writeFileSync(p, s);
const q = (v) => JSON.stringify(v);
const skillSource = read("src/features/skills/skill-seed.ts");
const skillIds = new Set([...skillSource.matchAll(/\bid:\s*"([^"]+)"/g)].map((m) => m[1]));
function choose(candidates) {
  const found = candidates.find((id) => skillIds.has(id));
  if (!found) throw new Error(`No skill candidate exists: ${candidates.join(", ")}`);
  return found;
}
function chooseMany(candidates) {
  return [...new Set(candidates.filter((id) => skillIds.has(id)))];
}

const problems = [
  {
    id: "iv.trie.prefix-index", title: "Prefix index for service names", group: "trees_bst", role: "systems", difficulty: "medium",
    primary: ["dsa.strings.trie"], secondary: ["dsa.strings.manipulation", "dsa.strings.hashing"], tags: ["trie", "prefix-search", "data-structure-design"],
    prompt: "Maintain an in-memory prefix index of service names. Process insert, exact-search, and prefix-query operations in order, returning whether each query is present. Design the structure so each operation depends on the query length rather than the number of stored names.",
    constraints: "1 <= operations <= 2e5; names contain lowercase ASCII letters; duplicate inserts do not change query results.", complexity: "O(L) per insert/search/prefix query, where L is the word or prefix length.",
    edges: ["query before any insert", "a word that is also a prefix of a longer word", "duplicate inserts"], questions: ["Are names lowercase only?", "Should duplicate inserts create duplicate entries?"],
    hints: ["Store one edge per next character instead of scanning all names.", "Track an end-of-word marker separately from the existence of a prefix.", "A trie walk answers both exact and prefix queries; exact search additionally checks the terminal marker."],
    io: "stdin: q followed by q operations: I word, S word, or P prefix. stdout: one 0/1 line for each S/P query.",
    cases: [
      ["visible.basic", "insert and query", false, "normal", "7\nI cat\nI car\nS cat\nP ca\nS cap\nI cap\nS cap\n", "1\n1\n0\n1\n"],
      ["hidden.empty-prefix-state", "query before insert", true, "boundary", "4\nP a\nI a\nS a\nP a\n", "0\n1\n1\n"],
      ["hidden.shared-prefix", "shared prefix and absent suffix", true, "adversarial", "6\nI app\nI apple\nS ap\nP app\nS apple\nP apples\n", "0\n1\n1\n0\n"]
    ]
  },
  {
    id: "iv.stack.decode-nested-string", title: "Decode nested repetition blocks", group: "stacks_queues_monotonic", role: "general", difficulty: "medium",
    primary: ["dsa.strings.parsing", "dsa.stacks.basic_stack"], secondary: ["dsa.stacks.basic_stack"], tags: ["stack", "parsing", "nested-state"],
    prompt: "Decode a compact string where k[text] means repeat text k times and repetition blocks may nest. Return the fully decoded string while correctly restoring the outer partial result after each closing bracket.",
    constraints: "Input is a valid encoding; repeat counts are positive integers; decoded output is at most 1e6 characters.", complexity: "O(output length) time and O(nesting depth + output length) space.",
    edges: ["multi-digit repeat count", "nested blocks", "literal suffix after a block"], questions: ["Is the encoding guaranteed valid?", "Can repeat counts contain multiple digits?"],
    hints: ["A closing bracket needs both the previous partial string and its repeat count.", "Push state when entering a bracket and restore it when leaving.", "Accumulate multi-digit counts before the opening bracket; repeat the current fragment when the matching bracket closes."],
    io: "stdin: one encoded string with lowercase letters, digits, and brackets. stdout: the decoded string.",
    cases: [
      ["visible.nested", "nested repeat", false, "normal", "3[a2[c]]\n", "accaccacc\n"],
      ["hidden.multidigit", "multi-digit repeat", true, "boundary", "10[z]\n", "zzzzzzzzzz\n"],
      ["hidden.mixed", "nested with literal suffix", true, "adversarial", "2[ab3[c]]x\n", "abcccabcccx\n"]
    ]
  },
  {
    id: "iv.strings.palindromic-substrings", title: "Count mirrored substrings", group: "dp_backtracking", role: "general", difficulty: "medium",
    primary: ["dsa.strings.palindrome_substrings", "dsa.strings.palindrome"], secondary: ["dsa.strings.palindrome"], tags: ["palindrome", "center-expansion", "dynamic-programming"],
    prompt: "Given a string, count how many contiguous substrings read the same forward and backward. Different start/end positions count separately even when their text is identical.",
    constraints: "0 <= length <= 4000; input is one line of ASCII characters.", complexity: "O(n^2) time and O(1) extra space with center expansion.",
    edges: ["empty string", "all characters equal", "even-length palindrome"], questions: ["Do equal substrings at different positions count separately?", "Does a one-character substring count?"],
    hints: ["Every palindrome has either one center character or one center gap.", "Expand outward while the two characters match and count each valid expansion.", "Visit all 2n-1 possible centers to cover odd and even lengths without an O(n^2) table."],
    io: "stdin: one string line. stdout: the number of palindromic substrings.",
    cases: [
      ["visible.repeated", "all equal", false, "normal", "aaa\n", "6\n"],
      ["hidden.distinct", "no longer palindrome", true, "boundary", "abc\n", "3\n"],
      ["hidden.even", "even palindrome", true, "adversarial", "abba\n", "6\n"]
    ]
  },
  {
    id: "iv.twoptr.three-sum-target", title: "Count unique three-value target combinations", group: "two_pointers_sliding_window", role: "general", difficulty: "medium",
    primary: ["dsa.arrays.two_pointers"], secondary: ["dsa.sorting.comparator", "dsa.arrays.traversal"], tags: ["two-pointer", "sorting", "deduplication", "three-sum"],
    prompt: "Given integer values and a target, return the number of unique value triplets whose sum equals the target. Triplets are unique by their three values, not by source indices.",
    constraints: "0 <= n <= 4000; values and target fit 32-bit signed integers; sums may require 64-bit arithmetic.", complexity: "O(n^2) time after O(n log n) sorting, O(1) extra space apart from the sort.",
    edges: ["duplicate values that form the same triplet", "no solution", "zeros and negative values"], questions: ["Are triplets unique by values or indices?", "May I sort the input?"],
    hints: ["Sort first so duplicate values become adjacent.", "Fix one value, then search the remaining suffix with two converging pointers.", "Skip equal pivot/left/right values after finding a solution so each value triplet is counted once."],
    io: "stdin: n target, then n integers. stdout: count of unique value triplets summing to target.",
    cases: [
      ["visible.classic", "duplicates and negatives", false, "normal", "6 0\n-1 0 1 2 -1 -4\n", "2\n"],
      ["hidden.none", "no target triple", true, "boundary", "4 10\n1 2 3 4\n", "0\n"],
      ["hidden.dedup", "many duplicate values", true, "adversarial", "7 3\n0 0 0 1 1 2 3\n", "2\n"]
    ]
  },
  {
    id: "iv.prefix.multiple-of-k-subarray", title: "Count windows aligned to a modulus", group: "arrays_hashing_prefix", role: "systems", difficulty: "medium",
    primary: ["dsa.techniques.prefix_sums"], secondary: ["dsa.hashing.lookup"], tags: ["prefix-sum", "modulo", "hash-map"],
    prompt: "Given signed integer deltas and a positive modulus k, count contiguous subarrays whose total is divisible by k. Use the modular relationship between two prefix sums instead of enumerating every window.",
    constraints: "0 <= n <= 2e5; 1 <= k <= 1e9; prefix sums require 64-bit arithmetic; values may be negative.", complexity: "O(n) expected time and O(min(n,k)) remainder-count space.",
    edges: ["negative values", "zero-valued windows", "many prefixes with the same remainder"], questions: ["Is k always positive?", "Can array values be negative?"],
    hints: ["A subarray sum is divisible by k when its two surrounding prefix sums have the same remainder.", "Count how many times each normalized remainder has appeared.", "Normalize negative remainders into [0,k) and seed remainder 0 once for windows starting at index 0."],
    io: "stdin: n k, then n signed integers. stdout: number of contiguous subarrays with sum divisible by k.",
    cases: [
      ["visible.mixed", "mixed signs", false, "normal", "5 5\n4 5 0 -2 -3\n", "6\n"],
      ["hidden.small", "overlapping windows", true, "boundary", "3 2\n1 1 1\n", "2\n"],
      ["hidden.negative", "negative remainders", true, "adversarial", "4 3\n-1 -2 3 6\n", "6\n"]
    ]
  },
  {
    id: "iv.bsearch.rotated-target", title: "Find a target in a rotated index", group: "binary_search", role: "systems", difficulty: "medium",
    primary: ["dsa.searching.binary_search"], secondary: ["dsa.arrays.traversal"], tags: ["binary-search", "rotated-array", "monotonic-half"],
    prompt: "A strictly increasing array was rotated at an unknown pivot. Return the index of a requested target, or -1 if absent, without linearly scanning the array.",
    constraints: "0 <= n <= 2e5; all values are distinct; the rotation may be zero.", complexity: "O(log n) time and O(1) extra space.",
    edges: ["target at the pivot", "target absent", "single-element array"], questions: ["Are all values distinct?", "Can the array be unrotated?"],
    hints: ["At least one side of every midpoint is still sorted.", "Use the sorted side's endpoint values to decide whether the target lies inside it.", "Discard the side that cannot contain the target and continue ordinary binary-search convergence."],
    io: "stdin: n target, then n distinct integers forming a rotated sorted array. stdout: target index or -1.",
    cases: [
      ["visible.pivot", "target at rotation", false, "normal", "7 0\n4 5 6 7 0 1 2\n", "4\n"],
      ["hidden.absent", "target missing", true, "boundary", "7 3\n4 5 6 7 0 1 2\n", "-1\n"],
      ["hidden.single", "single element", true, "adversarial", "1 9\n9\n", "0\n"]
    ]
  },
  {
    id: "iv.bsearch.single-unpaired", title: "Find the unpaired record", group: "binary_search", role: "general", difficulty: "medium",
    primary: ["dsa.searching.binary_search"], secondary: ["dsa.arrays.indexing"], tags: ["binary-search", "parity", "sorted-array"],
    prompt: "A sorted array contains every value exactly twice except one value that appears once. Return the single value in logarithmic time by exploiting how pair alignment changes across the unique element.",
    constraints: "n is odd; 1 <= n <= 2e5; array is sorted; exactly one value occurs once and all others occur twice.", complexity: "O(log n) time and O(1) extra space.",
    edges: ["single value is first", "single value is last", "array length one"], questions: ["Is the input guaranteed sorted?", "Do all non-unique values occur exactly twice?"],
    hints: ["Before the unique value, pairs start at even indices; after it, that alignment shifts.", "Force the midpoint to an even index and compare it with the next item.", "A matching pair means the single item is to the right; a mismatch means it is at or left of the midpoint."],
    io: "stdin: odd n followed by n sorted integers. stdout: the value that appears once.",
    cases: [
      ["visible.middle", "unique in middle", false, "normal", "9\n1 1 2 2 3 4 4 5 5\n", "3\n"],
      ["hidden.one", "single element", true, "boundary", "1\n7\n", "7\n"],
      ["hidden.end", "unique at end", true, "adversarial", "7\n-5 -5 0 0 2 2 9\n", "9\n"]
    ]
  },
  {
    id: "iv.twoptr.trapped-water", title: "Measure retained capacity between barriers", group: "two_pointers_sliding_window", role: "systems", difficulty: "medium",
    primary: ["dsa.arrays.two_pointers"], secondary: ["dsa.arrays.traversal"], tags: ["two-pointer", "invariant", "water-trapping"],
    prompt: "Given non-negative barrier heights, return how many unit cells of capacity are trapped after filling from above. Use a two-sided invariant so you do not need per-position prefix/suffix arrays.",
    constraints: "0 <= n <= 2e5; 0 <= height[i] <= 1e9; answer may exceed 32-bit.", complexity: "O(n) time and O(1) extra space.",
    edges: ["monotonic heights", "deep basin", "fewer than three barriers"], questions: ["Are heights non-negative?", "Should the answer use 64-bit arithmetic?"],
    hints: ["Water over a position is limited by the smaller of the best barrier on each side.", "Move the side whose current maximum is smaller; the opposite side is already high enough to bound it.", "Track leftMax and rightMax while converging the two pointers and accumulate max - height on the chosen side."],
    io: "stdin: n followed by n non-negative heights. stdout: total trapped capacity.",
    cases: [
      ["visible.classic", "multiple basins", false, "normal", "12\n0 1 0 2 1 0 1 3 2 1 2 1\n", "6\n"],
      ["hidden.monotone", "no basin", true, "boundary", "4\n3 2 1 0\n", "0\n"],
      ["hidden.deep", "deep basin", true, "adversarial", "6\n4 2 0 3 2 5\n", "9\n"]
    ]
  },
  {
    id: "iv.tree.lca-general", title: "Lowest common ancestor in a general tree", group: "trees_bst", role: "general", difficulty: "medium",
    primary: ["dsa.trees.traversal"], secondary: ["dsa.recursion.base_case"], tags: ["tree", "dfs", "recursion", "lca"],
    prompt: "Given a binary tree with unique node values and two values present in the tree, return the value of their lowest common ancestor. The tree has no BST ordering, so use its recursive structure rather than comparisons.",
    constraints: "0 <= nodes <= 2e5; query values are unique and present; tree input uses level-order tokens with # for null.", complexity: "O(n) time and O(h) recursion space.",
    edges: ["one query node is an ancestor of the other", "query nodes lie in different root subtrees", "both nodes are siblings"], questions: ["Are both query nodes guaranteed present?", "Are node values unique?"],
    hints: ["If the current node is either query node, it can be part of the answer.", "Search both subtrees; if each returns a non-null match, the current node is the LCA.", "Otherwise propagate the one non-null result upward."],
    io: "stdin: n, then n level-order tokens (# for null), then query values u v. stdout: LCA value.",
    cases: [
      ["visible.split", "queries in different subtrees", false, "normal", "7\n3 5 1 6 2 0 8\n5 1\n", "3\n"],
      ["hidden.ancestor", "one node is ancestor", true, "boundary", "5\n1 2 3 # 4\n2 4\n", "2\n"],
      ["hidden.siblings", "siblings below root", true, "adversarial", "7\n1 2 3 4 5 6 7\n4 5\n", "2\n"]
    ]
  },
  {
    id: "iv.tree.max-path-sum", title: "Best path through a tree", group: "trees_bst", role: "systems", difficulty: "hard",
    primary: ["dsa.trees.traversal"], secondary: ["dsa.techniques.dp_design"], tags: ["tree-dp", "dfs", "postorder"],
    prompt: "Each binary-tree node has a signed score. Return the maximum score of any non-empty path whose adjacent nodes are connected by tree edges. The path may start and end anywhere but cannot revisit a node.",
    constraints: "1 <= nodes <= 2e5; values may be negative; result requires 64-bit arithmetic.", complexity: "O(n) time and O(h) recursion space.",
    edges: ["all values negative", "best path crosses a node using both children", "single node"], questions: ["May the path start and end anywhere?", "Can the path include both child branches through one node?"],
    hints: ["A parent can continue through at most one child branch, so return one best downward contribution.", "Negative child contributions should be discarded when extending a path.", "At each node, separately update a global answer with node + best-left + best-right."],
    io: "stdin: n followed by n level-order tokens (# for null). stdout: maximum non-empty path sum.",
    cases: [
      ["visible.cross", "best path crosses subtree root", false, "normal", "7\n-10 9 20 # # 15 7\n", "42\n"],
      ["hidden.negative", "all-negative singleton", true, "boundary", "1\n-3\n", "-3\n"],
      ["hidden.complete", "complete positive tree", true, "adversarial", "7\n1 2 3 4 5 6 7\n", "18\n"]
    ]
  },
  {
    id: "iv.tree.build-from-traversals", title: "Reconstruct a tree from traversal logs", group: "trees_bst", role: "systems", difficulty: "hard",
    primary: ["dsa.trees.traversal"], secondary: ["dsa.hashing.lookup", "dsa.recursion.base_case"], tags: ["tree", "recursion", "reconstruction", "hash-map"],
    prompt: "Reconstruct a binary tree whose node values are unique from its preorder and inorder traversals, then emit the canonical level-order representation. Avoid repeatedly scanning inorder ranges.",
    constraints: "0 <= n <= 2e5; values are unique; traversals describe the same valid tree.", complexity: "O(n) time with an inorder index map and O(n) auxiliary space.",
    edges: ["single node", "fully skewed tree", "empty tree"], questions: ["Are node values unique?", "Are preorder and inorder guaranteed consistent?"],
    hints: ["The first preorder value is the root of the current subtree.", "An inorder position splits the current subtree into left and right sizes.", "Build a value-to-inorder-index map once, then recurse using index ranges instead of slicing arrays."],
    io: "stdin: n, preorder values, then inorder values. stdout: canonical level-order tokens with # null markers trimmed from the end.",
    cases: [
      ["visible.mixed", "balanced and sparse", false, "normal", "5\n3 9 20 15 7\n9 3 15 20 7\n", "3 9 20 # # 15 7\n"],
      ["hidden.single", "single node", true, "boundary", "1\n1\n1\n", "1\n"],
      ["hidden.skew", "left-skewed tree", true, "adversarial", "4\n1 2 3 4\n4 3 2 1\n", "1 2 # 3 # 4\n"]
    ]
  },
  {
    id: "iv.tree.path-sum", title: "Does any root-to-leaf path hit the target?", group: "trees_bst", role: "general", difficulty: "easy",
    primary: ["dsa.trees.traversal"], secondary: ["dsa.recursion.base_case"], tags: ["tree", "dfs", "path-state"],
    prompt: "Given a binary tree with signed values and a target, return whether at least one root-to-leaf path has exactly that sum. A partial path ending at an internal node does not count.",
    constraints: "0 <= nodes <= 2e5; sums require 64-bit arithmetic.", complexity: "O(n) time and O(h) recursion space.",
    edges: ["empty tree", "negative values", "target reached only at an internal node"], questions: ["Must the path end at a leaf?", "Can values be negative?"],
    hints: ["Carry the remaining target or accumulated sum down the DFS.", "Only compare for success when the current node is a leaf.", "Recurse into either child with the target reduced by the current value."],
    io: "stdin: n level-order tokens (# for null), then target. stdout: 1 if a root-to-leaf path matches, otherwise 0.",
    cases: [
      ["visible.hit", "target leaf path", false, "normal", "7\n5 4 8 11 # 13 4\n20\n", "1\n"],
      ["hidden.miss", "no matching leaf", true, "boundary", "3\n1 2 3\n5\n", "0\n"],
      ["hidden.negative", "negative singleton", true, "adversarial", "1\n-2\n-2\n", "1\n"]
    ]
  },
  {
    id: "iv.tree.invert", title: "Mirror a binary topology", group: "trees_bst", role: "general", difficulty: "easy",
    primary: ["dsa.trees.traversal"], secondary: ["dsa.recursion.base_case"], tags: ["tree", "dfs", "transformation"],
    prompt: "Mirror a binary tree in place by swapping every node's left and right subtrees, then emit its canonical level-order representation.",
    constraints: "0 <= nodes <= 2e5; input uses level-order # null markers.", complexity: "O(n) time and O(h) recursion space (or O(w) iterative queue space).",
    edges: ["empty tree", "one-sided tree", "single node"], questions: ["Should the original nodes be reused?", "Is either recursive or iterative traversal acceptable?"],
    hints: ["Every node performs the same local transformation: swap its two child pointers.", "After swapping, recursively mirror both subtrees.", "The order of mirroring before or after the swap is fine if both children are processed exactly once."],
    io: "stdin: n followed by n level-order tokens (# for null). stdout: mirrored tree in canonical level-order form.",
    cases: [
      ["visible.full", "complete tree", false, "normal", "7\n4 2 7 1 3 6 9\n", "4 7 2 9 6 3 1\n"],
      ["hidden.empty", "empty tree", true, "boundary", "0\n", "#\n"],
      ["hidden.one-sided", "one-sided tree", true, "adversarial", "3\n1 2 #\n", "1 # 2\n"]
    ]
  },
  {
    id: "iv.tree.same-structure-values", title: "Compare two tree snapshots", group: "trees_bst", role: "systems", difficulty: "easy",
    primary: ["dsa.trees.traversal"], secondary: ["dsa.recursion.base_case"], tags: ["tree", "recursion", "structural-comparison"],
    prompt: "Given two binary trees, return whether they have identical shape and the same value at every corresponding node.",
    constraints: "Each tree has at most 2e5 nodes; values fit 64-bit signed integers.", complexity: "O(n) time over corresponding nodes and O(h) recursion space.",
    edges: ["both trees empty", "same values but different structure", "mismatch near a leaf"], questions: ["Must both shape and values match?", "Can both inputs be empty?"],
    hints: ["Compare the two current nodes as a pair.", "Two nulls match; exactly one null does not.", "For non-null nodes, require equal values and recursive equality of both left and right child pairs."],
    io: "stdin: first tree as n plus level-order tokens, then second tree in the same format. stdout: 1 if identical, otherwise 0.",
    cases: [
      ["visible.same", "identical trees", false, "normal", "3\n1 2 3\n3\n1 2 3\n", "1\n"],
      ["hidden.values", "same values different positions", true, "boundary", "3\n1 2 3\n3\n1 3 2\n", "0\n"],
      ["hidden.empty", "both empty", true, "adversarial", "0\n0\n", "1\n"]
    ]
  },
  {
    id: "iv.bst.range-sum", title: "Aggregate a bounded BST range", group: "trees_bst", role: "systems", difficulty: "medium",
    primary: ["dsa.trees.bst"], secondary: ["dsa.trees.traversal"], tags: ["bst", "dfs", "pruning"],
    prompt: "Given a binary search tree and inclusive bounds [low, high], return the sum of all node values inside the range. Use BST ordering to skip subtrees that cannot contribute.",
    constraints: "0 <= nodes <= 2e5; BST values are distinct; sum may exceed 32-bit.", complexity: "O(v) time for visited nodes, with pruning; O(h) recursion space.",
    edges: ["range contains no nodes", "range contains all nodes", "bounds equal a node value"], questions: ["Is the tree guaranteed to be a BST?", "Are low and high inclusive?"],
    hints: ["If node.value < low, its entire left subtree is too small.", "If node.value > high, its entire right subtree is too large.", "Only recurse toward subtrees that can still contain values in the requested interval."],
    io: "stdin: BST as n level-order tokens (# for null), then low high. stdout: inclusive range sum.",
    cases: [
      ["visible.range", "middle range", false, "normal", "7\n10 5 15 3 7 13 18\n7 15\n", "45\n"],
      ["hidden.none", "no values in range", true, "boundary", "1\n5\n6 10\n", "0\n"],
      ["hidden.prune", "both-side pruning", true, "adversarial", "7\n8 3 10 1 6 # 14\n4 13\n", "24\n"]
    ]
  },
  {
    id: "iv.tree.longest-univalue-path", title: "Longest same-value connection chain", group: "trees_bst", role: "general", difficulty: "hard",
    primary: ["dsa.trees.traversal"], secondary: ["dsa.techniques.dp_design"], tags: ["tree-dp", "postorder", "path"],
    prompt: "Return the maximum number of edges on any path whose nodes all hold the same value. The path may pass through a node using both child branches but cannot revisit nodes.",
    constraints: "0 <= nodes <= 2e5; result counts edges, not nodes.", complexity: "O(n) time and O(h) recursion space.",
    edges: ["single node returns zero", "best path crosses a node", "equal values separated by a different value do not connect"], questions: ["Does length count edges or nodes?", "May the best path start below the root?"],
    hints: ["Return the longest one-direction same-value arm from each node to its parent.", "A child arm can be extended only when the child value equals the current value.", "Update the global best with leftArm + rightArm, while returning max(leftArm,rightArm)."],
    io: "stdin: n level-order tokens (# for null). stdout: longest same-value path length in edges.",
    cases: [
      ["visible.branch", "right branch", false, "normal", "7\n5 4 5 1 1 # 5\n", "2\n"],
      ["hidden.cross", "same value through root", true, "boundary", "3\n1 1 1\n", "2\n"],
      ["hidden.single", "single node", true, "adversarial", "1\n9\n", "0\n"]
    ]
  },
  {
    id: "iv.tree.enumerate-root-leaf-paths", title: "Enumerate terminal tree routes", group: "trees_bst", role: "systems", difficulty: "medium",
    primary: ["dsa.trees.traversal"], secondary: ["dsa.recursion.backtracking", "dsa.recursion.base_case"], tags: ["tree", "dfs", "backtracking", "return-witness"],
    prompt: "Enumerate every root-to-leaf value path in a binary tree. Format each path with -> between values and return the paths in lexicographic order so output is deterministic.",
    constraints: "0 <= nodes <= 1e5; total output size is bounded by 1e6 characters.", complexity: "O(n + output size) traversal plus sorting of emitted paths.",
    edges: ["empty tree", "single leaf", "one-sided branch"], questions: ["What deterministic ordering should paths use?", "Should internal-node prefixes be emitted?"],
    hints: ["Maintain the current path while descending DFS.", "Emit only when both children are null, then backtrack before exploring the sibling.", "Sort the completed path strings before output so tree shape does not make the contract ambiguous."],
    io: "stdin: n level-order tokens (# for null). stdout: root-to-leaf path strings joined by | in lexicographic order.",
    cases: [
      ["visible.paths", "two terminal paths", false, "normal", "5\n1 2 3 # 5\n", "1->2->5|1->3\n"],
      ["hidden.single", "single path", true, "boundary", "1\n7\n", "7\n"],
      ["hidden.empty", "empty tree", true, "adversarial", "0\n", "\n"]
    ]
  },
  {
    id: "iv.tree.serialize-roundtrip", title: "Canonical tree serialization round trip", group: "trees_bst", role: "systems", difficulty: "hard",
    primary: ["dsa.trees.traversal"], secondary: ["dsa.strings.parsing"], tags: ["tree", "serialization", "bfs", "api-design"],
    prompt: "Implement a deterministic binary-tree serializer/deserializer pair. Given a level-order tree with # null markers, deserialize it and serialize it back canonically, removing only redundant trailing null markers.",
    constraints: "0 <= nodes <= 2e5; values fit 64-bit signed integers; # denotes null.", complexity: "O(n) time and O(w) queue space for serialization/deserialization.",
    edges: ["empty tree", "one-sided sparse tree", "negative node values"], questions: ["Must serialization be deterministic?", "May redundant trailing null markers be omitted?"],
    hints: ["Breadth-first order naturally preserves where missing children occur.", "When deserializing, assign tokens to left/right child slots of queued parents in order.", "When serializing, keep # placeholders for internal gaps but trim # values only from the very end."],
    io: "stdin: n followed by n level-order tokens (# for null). stdout: canonical level-order serialization.",
    cases: [
      ["visible.sparse", "internal null markers", false, "normal", "7\n1 2 3 # # 4 5\n", "1 2 3 # # 4 5\n"],
      ["hidden.one-sided", "right-only child", true, "boundary", "3\n1 # 2\n", "1 # 2\n"],
      ["hidden.empty", "empty tree", true, "adversarial", "0\n", "#\n"]
    ]
  },
  {
    id: "iv.dp.edit-distance", title: "Minimum edits between configuration strings", group: "dp_backtracking", role: "systems", difficulty: "hard",
    primary: ["dsa.techniques.dp_design"], secondary: ["dsa.techniques.dp_forms"], tags: ["dynamic-programming", "sequence-dp", "edit-distance"],
    prompt: "Return the minimum number of single-character insertions, deletions, and replacements needed to transform one string into another. Define a two-prefix DP state and make all three edit choices explicit.",
    constraints: "0 <= each length <= 2000; input strings occupy separate lines.", complexity: "O(n*m) time; O(min(n,m)) space is preferred after deriving the full DP.",
    edges: ["one string empty", "strings already equal", "replacement versus insert/delete tradeoff"], questions: ["Do insert, delete, and replace each cost one?", "Can either string be empty?"],
    hints: ["Let dp[i][j] describe the best cost for prefixes of lengths i and j.", "Equal final characters carry dp[i-1][j-1] forward unchanged.", "For unequal characters take 1 + min(delete dp[i-1][j], insert dp[i][j-1], replace dp[i-1][j-1])."],
    io: "stdin: source string line, then target string line. stdout: minimum edit distance.",
    cases: [
      ["visible.horse", "mixed edits", false, "normal", "horse\nros\n", "3\n"],
      ["hidden.empty", "empty source", true, "boundary", "\nabc\n", "3\n"],
      ["hidden.kitten", "classic replacement/insert", true, "adversarial", "kitten\nsitting\n", "3\n"]
    ]
  },
  {
    id: "iv.backtracking.generate-balanced-parentheses", title: "Generate only valid delimiter sequences", group: "dp_backtracking", role: "general", difficulty: "medium",
    primary: ["dsa.recursion.backtracking"], secondary: ["dsa.stacks.basic_stack"], tags: ["backtracking", "constraint-pruning", "generation"],
    prompt: "Generate all balanced parenthesis strings containing n pairs. Build only prefixes that can still become valid rather than generating all 2^(2n) strings and filtering afterward.",
    constraints: "0 <= n <= 8; output strings must be in lexicographic order with '(' explored before ')'.", complexity: "O(C_n * n) output-sensitive time and O(n) recursion depth.",
    edges: ["n = 0", "n = 1", "never close more pairs than have been opened"], questions: ["What order should results use?", "For n=0 is the only conceptual result the empty string?"],
    hints: ["Track how many opening and closing parentheses have been placed.", "You may add '(' while opens < n, and ')' only while closes < opens.", "DFS with '(' before ')' naturally emits the requested lexicographic order."],
    io: "stdin: integer n. stdout: all balanced strings joined by one space; n=0 prints an empty line.",
    cases: [
      ["visible.three", "five valid strings", false, "normal", "3\n", "((())) (()()) (())() ()(()) ()()()\n"],
      ["hidden.one", "single pair", true, "boundary", "1\n", "()\n"],
      ["hidden.zero", "zero pairs", true, "adversarial", "0\n", "\n"]
    ]
  },
  {
    id: "iv.dp.longest-increasing-subsequence", title: "Longest increasing trend length", group: "dp_backtracking", role: "streaming", difficulty: "hard",
    primary: ["dsa.techniques.dp_forms", "dsa.techniques.dp_design"], secondary: ["dsa.searching.binary_search"], tags: ["dynamic-programming", "binary-search", "subsequence", "lis"],
    prompt: "Return the length of the longest strictly increasing subsequence. After deriving the O(n^2) DP, optimize to O(n log n) by maintaining the smallest possible tail value for each subsequence length.",
    constraints: "0 <= n <= 2e5; values fit 64-bit signed integers; increasing means strictly greater.", complexity: "O(n log n) time and O(n) space.",
    edges: ["strictly decreasing input", "duplicate values", "empty input"], questions: ["Is the subsequence required to be contiguous?", "Is increasing strict or non-decreasing?"],
    hints: ["For each possible subsequence length, only the smallest tail seen so far matters for future extension.", "Keep these tails sorted and binary-search the first tail >= current value.", "Replace that tail, or append when current value exceeds all tails; the tails array length is the LIS length."],
    io: "stdin: n followed by n integers. stdout: length of the longest strictly increasing subsequence.",
    cases: [
      ["visible.mixed", "mixed sequence", false, "normal", "8\n10 9 2 5 3 7 101 18\n", "4\n"],
      ["hidden.decreasing", "strictly decreasing", true, "boundary", "5\n5 4 3 2 1\n", "1\n"],
      ["hidden.duplicates", "all equal", true, "adversarial", "6\n2 2 2 2 2 2\n", "1\n"]
    ]
  },
  {
    id: "iv.design.snapshot-array", title: "Versioned array snapshots", group: "arrays_hashing_prefix", role: "systems", difficulty: "hard",
    primary: ["dsa.searching.binary_search"], secondary: ["dsa.arrays.indexing"], tags: ["data-structure-design", "versioning", "binary-search", "history"],
    prompt: "Design a fixed-length integer array that supports point set, snap, and get(index, snapId). A snapshot freezes the logical values without copying the entire array; historical reads should search only the changed history for that index.",
    constraints: "1 <= length <= 1e5; 1 <= operations <= 2e5; values fit 32-bit signed integers.", complexity: "O(1) amortized set/snap and O(log changes_at_index) get, with O(number of sets) history space.",
    edges: ["get an index never set", "multiple sets before one snapshot", "read an old snapshot after later writes"], questions: ["What is the initial value of every index?", "Does snap return the id it just created?"],
    hints: ["Store history only when a value changes instead of copying all indices on snap.", "For each index keep sorted (snapshotId,value) pairs; overwrite the latest pair if multiple sets happen in one current snapshot.", "get uses upper_bound for the requested snapshot id and returns the preceding value, defaulting to zero."],
    io: "stdin: length q, then q commands: set i value, snap, get i snapId. stdout: snap ids and get results in operation order.",
    cases: [
      ["visible.history", "snapshot separation", false, "normal", "3 7\nset 0 5\nsnap\nset 0 6\nget 0 0\nsnap\nget 0 1\nget 1 0\n", "0\n5\n1\n6\n0\n"],
      ["hidden.default", "default value in old snapshot", true, "boundary", "1 4\nsnap\nget 0 0\nset 0 7\nget 0 0\n", "0\n0\n0\n"],
      ["hidden.coalesce", "multiple sets and snapshots", true, "adversarial", "2 8\nset 1 3\nset 1 4\nsnap\nset 1 -2\nsnap\nget 1 0\nget 1 1\nget 0 1\n", "0\n1\n4\n-2\n0\n"]
    ]
  },
  {
    id: "iv.design.time-key-value", title: "Historical key-value reads", group: "arrays_hashing_prefix", role: "systems", difficulty: "hard",
    primary: ["dsa.hashing.lookup"], secondary: ["dsa.searching.binary_search"], tags: ["hash-map", "binary-search", "time-indexed", "data-structure-design"],
    prompt: "Build an in-memory key-value history. set(key,value,timestamp) appends a value at an increasing timestamp for that key; get(key,timestamp) returns the value from the greatest stored timestamp <= the query, or '-' when none exists.",
    constraints: "1 <= operations <= 2e5; timestamps for each key arrive in strictly increasing order; keys and values contain no spaces.", complexity: "O(1) amortized set and O(log versions_per_key) get.",
    edges: ["query before first value", "query between two versions", "missing key"], questions: ["Are set timestamps increasing per key?", "What should get return when no historical value exists?"],
    hints: ["Hash the key to its own chronological vector of versions.", "Because timestamps are appended in sorted order, no insertion sort is needed.", "Binary-search the first stored timestamp greater than the query, then step back one version."],
    io: "stdin: q, then q commands: set key value timestamp or get key timestamp. stdout: one value or '-' for each get.",
    cases: [
      ["visible.timeline", "reads across versions", false, "normal", "7\nset foo bar 1\nset foo baz 4\nget foo 1\nget foo 3\nget foo 4\nget foo 5\nget nope 5\n", "bar\nbar\nbaz\nbaz\n-\n"],
      ["hidden.before", "query before first version", true, "boundary", "3\nset a x 10\nget a 9\nget a 10\n", "-\nx\n"],
      ["hidden.keys", "independent key histories", true, "adversarial", "6\nset a one 1\nset b two 2\nset a three 3\nget a 2\nget b 9\nget c 9\n", "one\ntwo\n-\n"]
    ]
  },
  {
    id: "iv.list.clone-random-links", title: "Clone a list with cross-links", group: "linked_cache", role: "systems", difficulty: "hard",
    primary: ["dsa.hashing.lookup"], secondary: ["dsa.arrays.traversal"], tags: ["linked-list", "hash-map", "deep-copy", "graph-like"],
    prompt: "Deep-copy a linked list where every node has next plus an optional random pointer to any node in the same list. The clone must preserve all random relationships while sharing no node objects with the original.",
    constraints: "0 <= n <= 2e5; random indices are -1 or in [0,n); values may repeat.", complexity: "O(n) time; O(n) map space is acceptable (or O(1) with the interleaving technique).",
    edges: ["null random pointers", "self-random pointer", "empty list"], questions: ["May random point to the same node?", "Must the clone share no nodes with the original?"],
    hints: ["You need a mapping from each original identity to its clone identity before wiring arbitrary cross-links.", "First create all clone nodes, then make a second pass to assign next/random through the map.", "An O(1)-extra alternative temporarily interleaves clone nodes with originals, but a map is the clearest baseline."],
    io: "stdin: n, n values, then n random indices (-1 for null). stdout: one 'value randomIndex' line per cloned node.",
    cases: [
      ["visible.cross", "cross-linked nodes", false, "normal", "3\n10 20 30\n2 -1 0\n", "10 2\n20 -1\n30 0\n"],
      ["hidden.self", "self-random", true, "boundary", "1\n7\n0\n", "7 0\n"],
      ["hidden.empty", "empty list", true, "adversarial", "0\n\n\n", ""]
    ]
  },
  {
    id: "iv.graph.robot-room-exploration", title: "Explore an unknown room with reversible moves", group: "graphs_paths", role: "systems", difficulty: "hard",
    primary: ["dsa.graphs.dfs"], secondary: ["dsa.recursion.backtracking"], tags: ["dfs", "backtracking", "state-machine", "grid"],
    prompt: "A robot starts on an open cell of a blocked grid and can conceptually move/turn while remembering only discovered coordinates. Return how many open cells are reachable. Structure the DFS so every recursive move has an explicit backtrack to restore position/orientation for the caller.",
    constraints: "1 <= rows,cols <= 200; grid uses . for open and # for blocked; start coordinates are inside the grid.", complexity: "O(reachable cells) time and O(reachable cells) visited/recursion space.",
    edges: ["blocked start", "one-cell room", "disconnected open regions"], questions: ["Can the robot directly inspect the full map in the conceptual solution?", "Must each recursive call restore the caller's position/orientation?"],
    hints: ["Assign discovered cells relative coordinates and mark them visited before exploring neighbors.", "For each direction: attempt a move, recurse on success, then perform the inverse move/turn sequence to return.", "The judge provides the grid only to make the interactive behavior deterministic; the transferable invariant is restoring state after every branch."],
    io: "stdin: rows cols startRow startCol, then rows strings of . and #. stdout: number of reachable open cells.",
    cases: [
      ["visible.maze", "reachable region", false, "normal", "4 5 0 0\n..#..\n.##..\n.....\n#....\n", "12\n"],
      ["hidden.blocked", "blocked start", true, "boundary", "2 2 0 0\n#.\n..\n", "0\n"],
      ["hidden.cross", "connected around walls", true, "adversarial", "3 3 1 1\n.#.\n...\n.#.\n", "7\n"]
    ]
  },
  {
    id: "iv.graph.k-stop-cheapest-route", title: "Cheapest route with a hop budget", group: "graphs_paths", role: "systems", difficulty: "hard",
    primary: ["dsa.graphs.shortest_paths"], secondary: ["dsa.techniques.dp_design"], tags: ["shortest-path", "state-augmentation", "bounded-edges"],
    prompt: "Given directed weighted links, source, destination, and k allowed intermediate stops, return the cheapest route price using at most k+1 edges. The edge-count constraint is part of the state, so ordinary one-distance-per-node Dijkstra reasoning is insufficient.",
    constraints: "1 <= n <= 500; 0 <= edges <= 2e4; weights are non-negative; 0 <= k < n.", complexity: "O((k+1)E) with layered Bellman-Ford, or an equivalent state-augmented shortest-path method.",
    edges: ["destination unreachable", "cheapest unrestricted route uses too many stops", "direct edge beats constrained alternatives"], questions: ["Does k count intermediate stops or edges?", "Are edge weights non-negative?"],
    hints: ["Treat solutions using 0,1,...,k+1 edges as separate layers.", "For each layer, relax edges from a copy of the previous layer so one iteration cannot accidentally use multiple new edges.", "After k+1 relaxation rounds, the destination distance is the best route respecting the stop budget."],
    io: "stdin: n m src dst k, followed by m lines u v weight. stdout: cheapest price or -1.",
    cases: [
      ["visible.limit", "two-edge constrained route", false, "normal", "4 5 0 3 1\n0 1 100\n1 2 100\n2 3 100\n0 2 500\n0 3 700\n", "600\n"],
      ["hidden.more-stops", "extra stop unlocks cheaper route", true, "boundary", "4 5 0 3 2\n0 1 100\n1 2 100\n2 3 100\n0 2 500\n0 3 700\n", "300\n"],
      ["hidden.unreachable", "destination unreachable", true, "adversarial", "3 1 0 2 1\n0 1 5\n", "-1\n"]
    ]
  },
  {
    id: "iv.graph.reconstruct-itinerary", title: "Consume every route edge exactly once", group: "graphs_paths", role: "systems", difficulty: "hard",
    primary: ["dsa.graphs.dfs"], secondary: ["dsa.sorting.comparator"], tags: ["eulerian-path", "hierholzer", "graph", "ordering"],
    prompt: "Given directed route tickets that together admit an itinerary starting at JFK and using every ticket exactly once, return the lexicographically smallest complete itinerary. Multiple tickets between the same airports are distinct edges.",
    constraints: "1 <= tickets <= 2e5; airport codes contain uppercase letters; a valid itinerary from JFK is guaranteed.", complexity: "O(E log E) sorting/heap work and O(E) traversal space.",
    edges: ["multiple outgoing choices", "duplicate edges", "route must defer a tempting lexical edge to consume all tickets"], questions: ["Is a valid itinerary guaranteed?", "Should lexical order break ties among valid full itineraries?"],
    hints: ["A greedy forward walk can get stranded even when its next edge is lexicographically smallest.", "Hierholzer consumes outgoing edges recursively and appends a node only when it has no unused edge left.", "Choose outgoing edges in lexical order, build the route in reverse postorder, then reverse it once."],
    io: "stdin: m followed by m directed airport pairs. stdout: airport sequence separated by spaces, starting at JFK.",
    cases: [
      ["visible.branch", "lexical Euler trail", false, "normal", "4\nJFK SFO\nJFK ATL\nSFO ATL\nATL JFK\n", "JFK ATL JFK SFO ATL\n"],
      ["hidden.single", "single ticket", true, "boundary", "1\nJFK LAX\n", "JFK LAX\n"],
      ["hidden.circuit", "cycles and lexical choices", true, "adversarial", "6\nJFK B\nJFK A\nA JFK\nA C\nC A\nB A\n", "JFK A C A JFK B A\n"]
    ]
  },
  {
    id: "iv.graph.alien-order", title: "Infer symbol precedence from sorted records", group: "graphs_paths", role: "systems", difficulty: "hard",
    primary: ["dsa.graphs.topological_sort"], secondary: ["dsa.strings.parsing"], tags: ["topological-sort", "graph-construction", "strings", "cycle-detection"],
    prompt: "A list of words is sorted according to an unknown alphabet over the characters that appear. Infer one valid character order from the first differing character of adjacent words. Return the lexicographically smallest valid order, or INVALID for an impossible prefix relation or precedence cycle.",
    constraints: "1 <= words <= 2e4; total characters <= 2e5; words use lowercase ASCII letters.", complexity: "O(total characters + E log alphabet) using graph construction plus min-heap topological sort.",
    edges: ["longer word before its exact prefix is invalid", "cycle in inferred precedence", "characters with no edges still appear"], questions: ["Should characters with no constraints be included?", "What deterministic order should be returned when several topological orders are valid?"],
    hints: ["Only the first differing character of each adjacent word pair creates an ordering edge.", "If no differing position exists and the earlier word is longer, the input is impossible.", "Run Kahn's algorithm with a min-heap of zero-indegree characters; if output omits any seen character, a cycle exists."],
    io: "stdin: n followed by n words. stdout: lexicographically smallest valid character order, or INVALID.",
    cases: [
      ["visible.order", "inferred chain", false, "normal", "5\nwrt\nwrf\ner\nett\nrftt\n", "wertf\n"],
      ["hidden.prefix", "invalid prefix order", true, "boundary", "2\nabc\nab\n", "INVALID\n"],
      ["hidden.cycle", "precedence cycle", true, "adversarial", "3\nz\nx\nz\n", "INVALID\n"]
    ]
  },
  {
    id: "iv.graph.multi-source-spread", title: "Propagate from all active sources", group: "graphs_paths", role: "systems", difficulty: "medium",
    primary: ["dsa.graphs.bfs"], secondary: ["dsa.arrays.traversal"], tags: ["multi-source", "bfs", "grid", "distance-layers"],
    prompt: "A grid contains active sources (2), inactive targets (1), empty cells (0), and blocked cells (-1). Every minute, activity spreads from active cells to orthogonally adjacent inactive targets. Return minutes until every target is active, or -1 if some target can never be reached.",
    constraints: "1 <= rows,cols <= 500; four-neighbor movement only.", complexity: "O(rows*cols) time and space.",
    edges: ["multiple initial sources", "unreachable target", "no inactive targets"], questions: ["Do all initial sources spread simultaneously?", "Are blocked and empty cells traversable?"],
    hints: ["Starting separate BFS runs would repeat work; enqueue every source before time begins.", "A multi-source BFS assigns each cell its minimum distance to any source.", "Process the queue in distance layers (or store distances) and count how many inactive targets remain."],
    io: "stdin: rows cols followed by grid integers: -1 blocked, 0 empty, 1 inactive target, 2 active source. stdout: minutes to activate all targets or -1.",
    cases: [
      ["visible.layers", "single source layered spread", false, "normal", "3 3\n2 1 1\n1 1 0\n0 1 1\n", "4\n"],
      ["hidden.unreachable", "separated target", true, "boundary", "1 3\n2 0 1\n", "-1\n"],
      ["hidden.block", "spread around obstacle", true, "adversarial", "2 3\n2 -1 1\n1 1 1\n", "4\n"]
    ]
  },
  {
    id: "iv.graph.zero-one-grid-route", title: "Shortest grid route with zero-one costs", group: "graphs_paths", role: "systems", difficulty: "hard",
    primary: ["dsa.graphs.shortest_paths"], secondary: ["dsa.graphs.bfs"], tags: ["zero-one-bfs", "shortest-path", "deque", "grid"],
    prompt: "Each grid cell costs either 0 or 1 to enter. Starting at the top-left, return the minimum total entry cost needed to reach the bottom-right, excluding the starting cell's cost. Exploit the two possible edge weights instead of using a general heap.",
    constraints: "1 <= rows,cols <= 500; every cell cost is 0 or 1; four-neighbor movement.", complexity: "O(V+E) with 0-1 BFS and a deque.",
    edges: ["single-cell grid", "all costs one", "zero-cost detour beats a shorter geometric route"], questions: ["Does the starting cell cost count?", "Are weights always exactly 0 or 1?"],
    hints: ["Model moving into a neighbor as an edge weighted by that neighbor's cell cost.", "When a relaxation has weight 0, its new distance is as urgent as the current frontier; weight 1 belongs after it.", "Use a deque: push_front for weight 0 and push_back for weight 1, relaxing exactly like shortest paths."],
    io: "stdin: rows cols followed by 0/1 cell costs. stdout: minimum cost from top-left to bottom-right, excluding the start cell.",
    cases: [
      ["visible.zero-path", "all-zero detour", false, "normal", "3 3\n0 1 1\n0 0 1\n1 0 0\n", "0\n"],
      ["hidden.ones", "all moves cost one", true, "boundary", "2 2\n0 1\n1 1\n", "2\n"],
      ["hidden.single", "single cell", true, "adversarial", "1 1\n1\n", "0\n"]
    ]
  }
];

for (const p of problems) {
  p.primarySkillId = choose(p.primary);
  p.secondarySkillIds = chooseMany(p.secondary).filter((id) => id !== p.primarySkillId);
}

function problemEntry(p) {
  const first = p.cases[0];
  return `  {\n    id: ${q(p.id)},\n    version: 1,\n    title: ${q(p.title)},\n    prompt: ${q(p.prompt)},\n    group: ${q(p.group)},\n    roleRelevance: ${q(p.role)},\n    difficulty: ${q(p.difficulty)},\n    primarySkillId: ${q(p.primarySkillId)},\n    secondarySkillIds: ${q(p.secondarySkillIds)},\n    patternTags: ${q(p.tags)},\n    constraints: ${q(p.constraints)},\n    targetComplexity: ${q(p.complexity)},\n    requiredEdgeCases: ${q(p.edges)},\n    clarifyingQuestions: ${q(p.questions)},\n    hintLadder: ${q(p.hints)},\n    visibleExamples: [{ input: ${q(first[4].trimEnd())}, output: ${q(first[5].trimEnd())} }],\n    externalLinks: [${p.id.startsWith("iv.graph") ? "CPALGO" : p.id.startsWith("iv.tree") || p.id.startsWith("iv.bst") ? "USACO" : "CPALGO"}],\n    interviewCore: true\n  }`;
}

let catalog = read("src/features/interview/problem-catalog.ts");
if (catalog.includes(problems[0].id)) throw new Error("#693 problems already present");
const catalogAnchor = "\n];\n\nexport function getInterviewProblems";
if (!catalog.includes(catalogAnchor)) throw new Error("problem catalog anchor not found");
catalog = catalog.replace(catalogAnchor, `,\n${problems.map(problemEntry).join(",\n")}\n];\n\nexport function getInterviewProblems`);
write("src/features/interview/problem-catalog.ts", catalog);

function definition(p) {
  return {
    problemId: p.id,
    version: 1,
    ioDescription: p.io,
    cases: p.cases.map(([id, name, hidden, category, stdin, expectedStdout]) => ({ id, name, hidden, category, stdin, expectedStdout }))
  };
}
for (let shard = 0; shard < 3; shard++) {
  const defs = problems.slice(shard * 10, shard * 10 + 10).map(definition);
  write(`services/interview-judge/catalog-fixtures-08${String.fromCharCode(97 + shard)}.json`, JSON.stringify({ definitions: defs }, null, 2) + "\n");
}

let suites = read("src/features/interview/judge-test-suites.ts");
suites = suites.replace(
  'import catalog07c from "../../../services/interview-judge/catalog-fixtures-07c.json";',
  'import catalog07c from "../../../services/interview-judge/catalog-fixtures-07c.json";\nimport catalog08a from "../../../services/interview-judge/catalog-fixtures-08a.json";\nimport catalog08b from "../../../services/interview-judge/catalog-fixtures-08b.json";\nimport catalog08c from "../../../services/interview-judge/catalog-fixtures-08c.json";'
);
suites = suites.replace("  ...catalog07c.definitions\n] as RawDefinition[];", "  ...catalog07c.definitions,\n  ...catalog08a.definitions,\n  ...catalog08b.definitions,\n  ...catalog08c.definitions\n] as RawDefinition[];");
write("src/features/interview/judge-test-suites.ts", suites);

let verifier = read("scripts/verify-interview-catalog.mjs");
verifier = verifier.replace(
  '  "catalog-fixtures-07c.json"\n];',
  '  "catalog-fixtures-07c.json",\n  "catalog-fixtures-08a.json",\n  "catalog-fixtures-08b.json",\n  "catalog-fixtures-08c.json"\n];'
);
write("scripts/verify-interview-catalog.mjs", verifier);

const chunks = [
  "reference-solutions.cpp.gz.b64.1",
  "reference-solutions.cpp.gz.b64.2",
  "reference-solutions.cpp.gz.b64.3.1",
  "reference-solutions.cpp.gz.b64.3.2",
  "reference-solutions.cpp.gz.b64.3.3",
  "reference-solutions.cpp.gz.b64.3.4"
];
let ref = gunzipSync(Buffer.from(chunks.map((name) => read(`services/interview-judge/${name}`)).join(""), "base64")).toString("utf8");
const solverBlock = String.raw`

// #693 high-priority DSA expansion ------------------------------------------------
struct I693TrieNode { array<int,26> next{}; bool terminal=false; I693TrieNode(){next.fill(-1);} };
void solve_693_trie(){int q;cin>>q;vector<I693TrieNode> t(1);auto walk=[&](const string&s){int u=0;for(char c:s){int k=c-'a';if(k<0||k>=26||t[u].next[k]<0)return -1;u=t[u].next[k];}return u;};for(int z=0;z<q;++z){char op;string s;cin>>op>>s;if(op=='I'){int u=0;for(char c:s){int k=c-'a';if(t[u].next[k]<0){t[u].next[k]=(int)t.size();t.emplace_back();}u=t[u].next[k];}t[u].terminal=true;}else{int u=walk(s);cout<<((u>=0)&&(op=='P'||t[u].terminal)?1:0)<<'\n';}}}
void solve_693_decode(){string s;getline(cin,s);vector<int> counts;vector<string> prev;string cur;long long num=0;for(char c:s){if(isdigit((unsigned char)c))num=num*10+(c-'0');else if(c=='['){counts.push_back((int)num);prev.push_back(cur);num=0;cur.clear();}else if(c==']'){string part=cur;cur=prev.back();prev.pop_back();int k=counts.back();counts.pop_back();while(k-->0)cur+=part;}else cur.push_back(c);}cout<<cur<<'\n';}
void solve_693_pal_count(){string s;getline(cin,s);long long ans=0;for(int center=0;center<(int)s.size();++center){for(int l=center,r=center;l>=0&&r<(int)s.size()&&s[l]==s[r];--l,++r)++ans;for(int l=center,r=center+1;l>=0&&r<(int)s.size()&&s[l]==s[r];--l,++r)++ans;}cout<<ans<<'\n';}
void solve_693_three_sum(){int n;long long target;cin>>n>>target;vector<long long>a(n);for(auto&x:a)cin>>x;sort(a.begin(),a.end());long long ans=0;for(int i=0;i<n;++i){if(i&&a[i]==a[i-1])continue;int l=i+1,r=n-1;while(l<r){long long s=a[i]+a[l]+a[r];if(s==target){++ans;long long lv=a[l],rv=a[r];while(l<r&&a[l]==lv)++l;while(l<r&&a[r]==rv)--r;}else if(s<target)++l;else --r;}}cout<<ans<<'\n';}
void solve_693_mod_k(){int n;long long k;cin>>n>>k;unordered_map<long long,long long> cnt;cnt[0]=1;long long pref=0,ans=0;for(int i=0;i<n;++i){long long x;cin>>x;pref=(pref+x)%k;if(pref<0)pref+=k;ans+=cnt[pref];++cnt[pref];}cout<<ans<<'\n';}
void solve_693_rotated_target(){int n;long long target;cin>>n>>target;vector<long long>a(n);for(auto&x:a)cin>>x;int l=0,r=n-1;while(l<=r){int m=l+(r-l)/2;if(a[m]==target){cout<<m<<'\n';return;}if(a[l]<=a[m]){if(a[l]<=target&&target<a[m])r=m-1;else l=m+1;}else{if(a[m]<target&&target<=a[r])l=m+1;else r=m-1;}}cout<<-1<<'\n';}
void solve_693_single_unpaired(){int n;cin>>n;vector<long long>a(n);for(auto&x:a)cin>>x;int l=0,r=n-1;while(l<r){int m=l+(r-l)/2;if(m&1)--m;if(a[m]==a[m+1])l=m+2;else r=m;}cout<<a[l]<<'\n';}
void solve_693_trap(){int n;cin>>n;vector<long long>h(n);for(auto&x:h)cin>>x;int l=0,r=n-1;long long lm=0,rm=0,ans=0;while(l<=r){if(lm<=rm){lm=max(lm,h[l]);ans+=lm-h[l];++l;}else{rm=max(rm,h[r]);ans+=rm-h[r];--r;}}cout<<ans<<'\n';}

struct I693Tree{long long v;I693Tree*l=nullptr,*r=nullptr;explicit I693Tree(long long x):v(x){}};
I693Tree* read693Tree(){int n;cin>>n;if(n<=0)return nullptr;vector<string>tok(n);for(auto&s:tok)cin>>s;if(tok[0]=="#")return nullptr;auto*root=new I693Tree(stoll(tok[0]));queue<I693Tree*>q;q.push(root);int i=1;while(!q.empty()&&i<n){auto*p=q.front();q.pop();if(i<n&&tok[i]!="#"){p->l=new I693Tree(stoll(tok[i]));q.push(p->l);}++i;if(i<n&&tok[i]!="#"){p->r=new I693Tree(stoll(tok[i]));q.push(p->r);}++i;}return root;}
void free693Tree(I693Tree*n){if(!n)return;free693Tree(n->l);free693Tree(n->r);delete n;}
string serialize693(I693Tree*root){if(!root)return "#";vector<string>out;queue<I693Tree*>q;q.push(root);while(!q.empty()){auto*n=q.front();q.pop();if(!n){out.push_back("#");continue;}out.push_back(to_string(n->v));q.push(n->l);q.push(n->r);}while(out.size()>1&&out.back()=="#")out.pop_back();string s;for(size_t i=0;i<out.size();++i){if(i)s+=' ';s+=out[i];}return s;}
I693Tree* lca693(I693Tree*n,long long a,long long b){if(!n||n->v==a||n->v==b)return n;auto*l=lca693(n->l,a,b);auto*r=lca693(n->r,a,b);return l&&r?n:(l?l:r);}
void solve_693_lca(){auto*r=read693Tree();long long a,b;cin>>a>>b;auto*x=lca693(r,a,b);if(x)cout<<x->v<<'\n';free693Tree(r);}
long long maxPath693(I693Tree*n,long long&best){if(!n)return 0;long long l=max(0LL,maxPath693(n->l,best)),r=max(0LL,maxPath693(n->r,best));best=max(best,n->v+l+r);return n->v+max(l,r);}
void solve_693_max_path(){auto*r=read693Tree();long long best=LLONG_MIN;maxPath693(r,best);cout<<best<<'\n';free693Tree(r);}
I693Tree* build693(const vector<long long>&pre,int pl,int pr,const vector<long long>&in,int il,int ir,const unordered_map<long long,int>&pos){if(pl>=pr)return nullptr;long long root=pre[pl];int mid=pos.at(root),left=mid-il;auto*n=new I693Tree(root);n->l=build693(pre,pl+1,pl+1+left,in,il,mid,pos);n->r=build693(pre,pl+1+left,pr,in,mid+1,ir,pos);return n;}
void solve_693_build_tree(){int n;cin>>n;vector<long long>pre(n),in(n);for(auto&x:pre)cin>>x;for(auto&x:in)cin>>x;unordered_map<long long,int>pos;for(int i=0;i<n;++i)pos[in[i]]=i;auto*r=build693(pre,0,n,in,0,n,pos);cout<<serialize693(r)<<'\n';free693Tree(r);}
bool pathSum693(I693Tree*n,long long rem){if(!n)return false;if(!n->l&&!n->r)return rem==n->v;return pathSum693(n->l,rem-n->v)||pathSum693(n->r,rem-n->v);}
void solve_693_path_sum(){auto*r=read693Tree();long long t;cin>>t;cout<<(pathSum693(r,t)?1:0)<<'\n';free693Tree(r);}
I693Tree* invert693(I693Tree*n){if(!n)return n;swap(n->l,n->r);invert693(n->l);invert693(n->r);return n;}
void solve_693_invert(){auto*r=read693Tree();invert693(r);cout<<serialize693(r)<<'\n';free693Tree(r);}
bool same693(I693Tree*a,I693Tree*b){if(!a||!b)return a==b;return a->v==b->v&&same693(a->l,b->l)&&same693(a->r,b->r);}
void solve_693_same(){auto*a=read693Tree();auto*b=read693Tree();cout<<(same693(a,b)?1:0)<<'\n';free693Tree(a);free693Tree(b);}
long long range693(I693Tree*n,long long lo,long long hi){if(!n)return 0;if(n->v<lo)return range693(n->r,lo,hi);if(n->v>hi)return range693(n->l,lo,hi);return n->v+range693(n->l,lo,hi)+range693(n->r,lo,hi);}
void solve_693_range(){auto*r=read693Tree();long long lo,hi;cin>>lo>>hi;cout<<range693(r,lo,hi)<<'\n';free693Tree(r);}
int uni693(I693Tree*n,int&best){if(!n)return 0;int l=uni693(n->l,best),r=uni693(n->r,best);int le=(n->l&&n->l->v==n->v)?l+1:0,re=(n->r&&n->r->v==n->v)?r+1:0;best=max(best,le+re);return max(le,re);}
void solve_693_univalue(){auto*r=read693Tree();int best=0;uni693(r,best);cout<<best<<'\n';free693Tree(r);}
void paths693(I693Tree*n,string cur,vector<string>&out){if(!n)return;if(!cur.empty())cur+="->";cur+=to_string(n->v);if(!n->l&&!n->r){out.push_back(cur);return;}paths693(n->l,cur,out);paths693(n->r,cur,out);}
void solve_693_paths(){auto*r=read693Tree();vector<string>out;paths693(r,"",out);sort(out.begin(),out.end());for(size_t i=0;i<out.size();++i){if(i)cout<<'|';cout<<out[i];}cout<<'\n';free693Tree(r);}
void solve_693_serialize(){auto*r=read693Tree();cout<<serialize693(r)<<'\n';free693Tree(r);}

void solve_693_edit(){string a,b;getline(cin,a);getline(cin,b);if(a.size()<b.size())swap(a,b);vector<int>prev(b.size()+1),cur(b.size()+1);iota(prev.begin(),prev.end(),0);for(size_t i=1;i<=a.size();++i){cur[0]=(int)i;for(size_t j=1;j<=b.size();++j)cur[j]=a[i-1]==b[j-1]?prev[j-1]:1+min({prev[j],cur[j-1],prev[j-1]});swap(prev,cur);}cout<<prev[b.size()]<<'\n';}
void genParen693(int n,int o,int c,string&s,vector<string>&out){if((int)s.size()==2*n){out.push_back(s);return;}if(o<n){s.push_back('(');genParen693(n,o+1,c,s,out);s.pop_back();}if(c<o){s.push_back(')');genParen693(n,o,c+1,s,out);s.pop_back();}}
void solve_693_paren(){int n;cin>>n;vector<string>out;string s;genParen693(n,0,0,s,out);for(size_t i=0;i<out.size();++i){if(i)cout<<' ';cout<<out[i];}cout<<'\n';}
void solve_693_lis(){int n;cin>>n;vector<long long>tails;for(int i=0;i<n;++i){long long x;cin>>x;auto it=lower_bound(tails.begin(),tails.end(),x);if(it==tails.end())tails.push_back(x);else *it=x;}cout<<tails.size()<<'\n';}

void solve_693_snapshot(){int len,q;cin>>len>>q;int sid=0;vector<vector<pair<int,long long>>>h(len);for(auto&v:h)v.push_back({0,0});for(int z=0;z<q;++z){string op;cin>>op;if(op=="set"){int i;long long v;cin>>i>>v;if(h[i].back().first==sid)h[i].back().second=v;else h[i].push_back({sid,v});}else if(op=="snap"){cout<<sid<<'\n';++sid;}else{int i,s;cin>>i>>s;auto&v=h[i];auto it=upper_bound(v.begin(),v.end(),make_pair(s,LLONG_MAX));cout<<(it==v.begin()?0:prev(it)->second)<<'\n';}}}
void solve_693_time_map(){int q;cin>>q;unordered_map<string,vector<pair<int,string>>>m;for(int z=0;z<q;++z){string op,k;cin>>op>>k;if(op=="set"){string v;int t;cin>>v>>t;m[k].push_back({t,v});}else{int t;cin>>t;auto it=m.find(k);if(it==m.end()){cout<<"-\n";continue;}auto&v=it->second;auto p=upper_bound(v.begin(),v.end(),t,[](int x,const pair<int,string>&y){return x<y.first;});cout<<(p==v.begin()?string("-"):prev(p)->second)<<'\n';}}}
void solve_693_clone_random(){int n;cin>>n;vector<long long>val(n);for(auto&x:val)cin>>x;vector<int>rnd(n);for(auto&x:rnd)cin>>x;for(int i=0;i<n;++i)cout<<val[i]<<' '<<rnd[i]<<'\n';}
void solve_693_robot(){int R,C,sr,sc;cin>>R>>C>>sr>>sc;vector<string>g(R);for(auto&x:g)cin>>x;if(sr<0||sr>=R||sc<0||sc>=C||g[sr][sc]=='#'){cout<<0<<'\n';return;}vector<vector<char>>vis(R,vector<char>(C));int ans=0;int dr[4]={-1,0,1,0},dc[4]={0,1,0,-1};function<void(int,int)>dfs=[&](int r,int c){vis[r][c]=1;++ans;for(int d=0;d<4;++d){int nr=r+dr[d],nc=c+dc[d];if(nr>=0&&nr<R&&nc>=0&&nc<C&&!vis[nr][nc]&&g[nr][nc]!='#')dfs(nr,nc);}};dfs(sr,sc);cout<<ans<<'\n';}
void solve_693_kstop(){int n,m,s,t,k;cin>>n>>m>>s>>t>>k;struct E{int u,v;long long w;};vector<E>e(m);for(auto&x:e)cin>>x.u>>x.v>>x.w;const long long INF=LLONG_MAX/4;vector<long long>d(n,INF);d[s]=0;for(int step=0;step<=k;++step){auto nd=d;for(auto&x:e)if(d[x.u]<INF)nd[x.v]=min(nd[x.v],d[x.u]+x.w);d.swap(nd);}cout<<(d[t]>=INF?-1:d[t])<<'\n';}
void solve_693_itinerary(){int m;cin>>m;unordered_map<string,priority_queue<string,vector<string>,greater<string>>>adj;for(int i=0;i<m;++i){string a,b;cin>>a>>b;adj[a].push(b);}vector<string>route;function<void(const string&)>dfs=[&](const string&u){auto&pq=adj[u];while(!pq.empty()){string v=pq.top();pq.pop();dfs(v);}route.push_back(u);};dfs("JFK");reverse(route.begin(),route.end());for(size_t i=0;i<route.size();++i){if(i)cout<<' ';cout<<route[i];}cout<<'\n';}
void solve_693_alien(){int n;cin>>n;vector<string>w(n);set<char>chars;for(auto&s:w){cin>>s;chars.insert(s.begin(),s.end());}map<char,set<char>>adj;map<char,int>ind;for(char c:chars)ind[c]=0;for(int i=1;i<n;++i){auto&a=w[i-1];auto&b=w[i];size_t j=0;while(j<min(a.size(),b.size())&&a[j]==b[j])++j;if(j==min(a.size(),b.size())){if(a.size()>b.size()){cout<<"INVALID\n";return;}}else if(adj[a[j]].insert(b[j]).second)++ind[b[j]];}priority_queue<char,vector<char>,greater<char>>pq;for(auto[c,d]:ind)if(d==0)pq.push(c);string out;while(!pq.empty()){char u=pq.top();pq.pop();out.push_back(u);for(char v:adj[u])if(--ind[v]==0)pq.push(v);}cout<<(out.size()==chars.size()?out:string("INVALID"))<<'\n';}
void solve_693_multi(){int R,C;cin>>R>>C;vector<vector<int>>g(R,vector<int>(C));queue<pair<int,int>>q;int fresh=0;for(int r=0;r<R;++r)for(int c=0;c<C;++c){cin>>g[r][c];if(g[r][c]==2)q.push({r,c});else if(g[r][c]==1)++fresh;}int dr[4]={-1,0,1,0},dc[4]={0,1,0,-1},minutes=0;while(!q.empty()&&fresh){int sz=q.size();++minutes;while(sz--){auto[r,c]=q.front();q.pop();for(int d=0;d<4;++d){int nr=r+dr[d],nc=c+dc[d];if(nr>=0&&nr<R&&nc>=0&&nc<C&&g[nr][nc]==1){g[nr][nc]=2;--fresh;q.push({nr,nc});}}}}cout<<(fresh?-1:minutes)<<'\n';}
void solve_693_zero_one(){int R,C;cin>>R>>C;vector<vector<int>>a(R,vector<int>(C));for(auto&row:a)for(auto&x:row)cin>>x;const int INF=1e9;vector<vector<int>>d(R,vector<int>(C,INF));deque<pair<int,int>>dq;d[0][0]=0;dq.push_front({0,0});int dr[4]={-1,0,1,0},dc[4]={0,1,0,-1};while(!dq.empty()){auto[r,c]=dq.front();dq.pop_front();for(int z=0;z<4;++z){int nr=r+dr[z],nc=c+dc[z];if(nr<0||nr>=R||nc<0||nc>=C)continue;int nd=d[r][c]+a[nr][nc];if(nd<d[nr][nc]){d[nr][nc]=nd;if(a[nr][nc]==0)dq.push_front({nr,nc});else dq.push_back({nr,nc});}}}cout<<d[R-1][C-1]<<'\n';}
`;
if (!ref.includes("int main(){")) throw new Error("reference main anchor missing");
ref = ref.replace("int main(){", `${solverBlock}\nint main(){`);
const dispatch = [
  ["iv.trie.prefix-index","solve_693_trie"], ["iv.stack.decode-nested-string","solve_693_decode"], ["iv.strings.palindromic-substrings","solve_693_pal_count"],
  ["iv.twoptr.three-sum-target","solve_693_three_sum"], ["iv.prefix.multiple-of-k-subarray","solve_693_mod_k"], ["iv.bsearch.rotated-target","solve_693_rotated_target"],
  ["iv.bsearch.single-unpaired","solve_693_single_unpaired"], ["iv.twoptr.trapped-water","solve_693_trap"], ["iv.tree.lca-general","solve_693_lca"],
  ["iv.tree.max-path-sum","solve_693_max_path"], ["iv.tree.build-from-traversals","solve_693_build_tree"], ["iv.tree.path-sum","solve_693_path_sum"],
  ["iv.tree.invert","solve_693_invert"], ["iv.tree.same-structure-values","solve_693_same"], ["iv.bst.range-sum","solve_693_range"],
  ["iv.tree.longest-univalue-path","solve_693_univalue"], ["iv.tree.enumerate-root-leaf-paths","solve_693_paths"], ["iv.tree.serialize-roundtrip","solve_693_serialize"],
  ["iv.dp.edit-distance","solve_693_edit"], ["iv.backtracking.generate-balanced-parentheses","solve_693_paren"], ["iv.dp.longest-increasing-subsequence","solve_693_lis"],
  ["iv.design.snapshot-array","solve_693_snapshot"], ["iv.design.time-key-value","solve_693_time_map"], ["iv.list.clone-random-links","solve_693_clone_random"],
  ["iv.graph.robot-room-exploration","solve_693_robot"], ["iv.graph.k-stop-cheapest-route","solve_693_kstop"], ["iv.graph.reconstruct-itinerary","solve_693_itinerary"],
  ["iv.graph.alien-order","solve_693_alien"], ["iv.graph.multi-source-spread","solve_693_multi"], ["iv.graph.zero-one-grid-route","solve_693_zero_one"]
].map(([id,fn]) => `  else if(id==${q(id)}) ${fn}();`).join("\n");
const dispatchAnchor = '  else if(id=="iv.cpp.atomic-counter") solve_atomic_counter();\n  else return 2;';
if (!ref.includes(dispatchAnchor)) throw new Error("reference dispatch anchor missing");
ref = ref.replace(dispatchAnchor, `  else if(id=="iv.cpp.atomic-counter") solve_atomic_counter();\n${dispatch}\n  else return 2;`);
const encoded = gzipSync(Buffer.from(ref), { level: 9 }).toString("base64");
const size = Math.ceil(encoded.length / chunks.length);
for (let i=0;i<chunks.length;++i) write(`services/interview-judge/${chunks[i]}`, encoded.slice(i*size,(i+1)*size));

const newFollowUps = [
  ["fu.lis.russian-dolls","iv.dp.longest-increasing-subsequence","compare_approaches","Sort pairs so equal widths cannot chain, then reduce height nesting to LIS. Explain the tie-order invariant before coding.","A two-dimensional nesting constraint replaces a one-dimensional sequence.","Sort width ascending and equal-width height descending, then apply strict LIS to heights.",["optimization","follow_up_adaptability"],9,"Russian-doll nesting becomes LIS only after the equal-width tie rule prevents invalid chains."],
  ["fu.trapped-water.2d","iv.twoptr.trapped-water","compare_approaches","Heights now form a 2-D grid. Why do two left/right pointers stop being sufficient, and what frontier structure replaces them?","Containment depends on the lowest boundary around a region, not two linear sides.","Expand inward from the outer boundary with a min-heap, carrying the best enclosing boundary height.",["complexity","follow_up_adaptability"],9,"The 2-D invariant is a minimum boundary frontier, so a heap-based flood replaces the linear two-pointer invariant."],
  ["fu.k-stop.return-route","iv.graph.k-stop-cheapest-route","return_witness","Return the actual cheapest route as well as its price while preserving the stop bound.","The DP/state search must retain enough predecessor information to reconstruct a bounded-edge witness.","Track predecessor by layer/state and backtrack from the best destination layer.",["correctness","follow_up_adaptability"],8,"A price alone discards path identity; layered parent pointers reconstruct the chosen bounded route."],
  ["fu.alien.stable-order","iv.graph.alien-order","stable_ordering","When several alphabet orders are valid, guarantee the lexicographically smallest valid order.","Topological sorting needs deterministic tie-breaking among zero-indegree symbols.","Use a min-heap (or ordered set) for the available zero-indegree frontier.",["correctness","communication"],6,"Kahn's algorithm plus an ordered frontier selects the smallest available symbol at every step."],
  ["fu.multi-source.weighted-delay","iv.graph.multi-source-spread","compare_approaches","Each cell now has a non-negative activation delay. When does plain multi-source BFS become incorrect, and what replaces it?","Edges no longer have uniform cost, so BFS layer number is not minimum elapsed time.","Start all sources at distance zero and use multi-source Dijkstra; 0/1 delays admit a deque optimization.",["complexity","follow_up_adaptability"],8,"Weighted propagation is a shortest-path problem; the frontier must be ordered by elapsed cost rather than hop count."],
  ["fu.serialize.general-graph","iv.tree.serialize-roundtrip","compare_approaches","Generalize serialization from a tree to a graph that may have cycles and shared nodes. What identity information becomes necessary?","Tree structure has one parent path per node; a graph can revisit the same object through multiple edges.","Assign stable node IDs, serialize each node once, and encode edges by ID while tracking visited nodes.",["communication","follow_up_adaptability"],9,"Graph serialization needs explicit identity and a visited set so cycles and shared references survive the round trip."],
  ["fu.edit-distance.edit-script","iv.dp.edit-distance","return_witness","Return one minimum edit script, not only the edit count.","Rolling-row optimization discards the decisions needed for reconstruction.","Keep the full DP or explicit parent choices, then backtrack from (n,m) to emit insert/delete/replace operations.",["correctness","follow_up_adaptability"],9,"Witness reconstruction needs retained decisions (or recomputation) rather than only the final scalar distance."],
  ["fu.trie.delete-prefix-count","iv.trie.prefix-index","support_updates","Add deletion plus prefixCount(prefix). Nodes may remain allocated, but counts must stay correct after duplicates and deletes.","Presence alone is insufficient; updates require multiplicity/count state along every prefix path.","Maintain terminal multiplicity and subtree/prefix counts, decrementing only for a word that is actually present.",["correctness","optimization"],9,"Reference counts along trie paths support deletion and prefix counts without scanning descendants."],
  ["fu.min-rooms.delayed-most-used","iv.intervals.min-rooms","operation_mix_change","There are a fixed number of rooms. If all are occupied, delay a meeting until the earliest room frees; return the room used most often, breaking ties by smaller id.","The task changes from counting overlaps to simulating resource assignment and delayed starts.","Use one min-heap for free room IDs and another for busy rooms ordered by (endTime, roomId).",["optimization","follow_up_adaptability"],10,"Two heaps separate resource availability from next completion; delayed meetings preserve duration when rescheduled."],
  ["fu.cheapest-route.timetable","iv.graph.cheapest-route","operation_mix_change","Edges are timetable departures rather than always-available static costs. Explain what state must include and why ordinary static Dijkstra edges are insufficient.","The cost/availability of an edge depends on arrival time at its source.","Relax the next feasible departure after the current arrival time; model time-dependent transitions and verify FIFO assumptions before using Dijkstra.",["complexity","communication"],9,"Time-dependent routing requires relaxation based on arrival time; static edge weights no longer describe the transition."],
  ["fu.tree-max-path.return-witness","iv.tree.max-path-sum","return_witness","Return the node-value sequence for one maximum-sum path, not only the sum.","The postorder DP must preserve which downward child produced each contribution and where the global best crossed.","Store best-child choices and the node where left+node+right sets the global optimum, then reconstruct both arms.",["correctness","follow_up_adaptability"],8,"Path reconstruction augments the scalar tree DP with chosen-child pointers and a remembered best crossing node."],
  ["fu.time-key-value.compaction","iv.design.time-key-value","out_of_memory","History is too large to keep every version forever. Design bounded retention while preserving exact reads for the retained time window.","The append-only per-key vectors grow without bound and retention semantics become part of correctness.","Define a retention watermark, compact versions older than it while keeping the latest predecessor needed at the boundary, and discuss amortized cleanup.",["optimization","communication"],9,"Windowed retention can compact history safely if each key retains the value effective at the retention boundary plus newer versions."]
];
function followEntry(x){const [id,problemId,kind,prompt,affected,shift,dims,time,explanation]=x;return `  {\n    id: ${q(id)},\n    version: 1,\n    problemId: ${q(problemId)},\n    parentVersion: 1,\n    kind: ${q(kind)},\n    trigger: "base_correct",\n    timing: "after_acceptance",\n    priority: 1,\n    prompt: ${q(prompt)},\n    affectedConstraints: ${q(affected)},\n    expectedReasoningShift: ${q(shift)},\n    targetRubricDimensions: ${q(dims)},\n    timeBudgetMinutes: ${time},\n    revealPolicy: "after_attempt",\n    explanation: ${q(explanation)}\n  }`;}
let follows = read("src/features/interview/follow-ups.ts");
const followAnchor = "\n];\n\nexport function getFollowUpsForProblem";
if (!follows.includes(followAnchor)) throw new Error("follow-up array anchor missing");
follows = follows.replace(followAnchor, `,\n${newFollowUps.map(followEntry).join(",\n")}\n];\n\nexport function getFollowUpsForProblem`);
write("src/features/interview/follow-ups.ts", follows);

const packs = [
  ["pack.core.tree-postorder","Tree path reasoning under time","core_algorithm",45,"iv.tree.max-path-sum","fu.tree-max-path.return-witness","trees_bst"],
  ["pack.ds.time-indexed-store","Historical reads under time","ds_implementation",50,"iv.design.time-key-value","fu.time-key-value.compaction","arrays_hashing_prefix"],
  ["pack.core.graph-state","Shortest path with extra state","core_algorithm",50,"iv.graph.k-stop-cheapest-route","fu.k-stop.return-route","graphs_paths"],
  ["pack.core.sequence-dp","Sequence DP and reconstruction","core_algorithm",50,"iv.dp.edit-distance","fu.edit-distance.edit-script","dp_backtracking"]
];
function packEntry([id,title,category,duration,pid,fid,coverage]){return `  {\n    id: ${q(id)},\n    version: 1,\n    title: ${q(title)},\n    category: ${q(category)},\n    durationMinutes: ${duration},\n    problemIds: [${q(pid)}],\n    followUpIds: [${q(fid)}],\n    patternCoverage: [${q(coverage)}],\n    calibrationReserved: false\n  }`;}
let mocks = read("src/features/interview/mock-packs.ts");
const mockAnchor = "\n];\n\nconst followUpIds";
if (!mocks.includes(mockAnchor)) throw new Error("mock pack array anchor missing");
mocks = mocks.replace(mockAnchor, `,\n${packs.map(packEntry).join(",\n")}\n];\n\nconst followUpIds`);
write("src/features/interview/mock-packs.ts", mocks);

let problemTests = read("tests/unit/interview-problems.test.ts");
const testAnchor = '  it("meets the #176 required first catalog: >= 60 problems across all 12 groups", () => {';
const coverageTest = `  it("protects the high-signal #693 Google SWE subpattern coverage", () => {\n    expect(interviewProblems.length).toBeGreaterThanOrEqual(120);\n    const byId = new Map(interviewProblems.map((p) => [p.id, p]));\n    for (const id of ${q(problems.map((p)=>p.id))}) {\n      expect(byId.has(id), \`missing #693 native interview problem: \${id}\`).toBe(true);\n    }\n    const tags = new Set(interviewProblems.flatMap((p) => p.patternTags));\n    for (const tag of ["trie", "tree-dp", "reconstruction", "edit-distance", "time-indexed", "state-augmentation", "eulerian-path", "multi-source", "zero-one-bfs"]) {\n      expect(tags.has(tag), \`missing #693 interview subpattern: \${tag}\`).toBe(true);\n    }\n    expect(interviewProblems.some((p) => p.primarySkillId === "dsa.strings.trie")).toBe(true);\n    expect(interviewProblems.some((p) => p.primarySkillId === "dsa.techniques.dp_design")).toBe(true);\n  });\n\n`;
if (!problemTests.includes(testAnchor)) throw new Error("interview problem test anchor missing");
problemTests = problemTests.replace(testAnchor, coverageTest + testAnchor);
write("tests/unit/interview-problems.test.ts", problemTests);

let judgeTests = read("tests/unit/judge-test-suites.test.ts");
judgeTests = judgeTests.replace("expect(catalogIds).toHaveLength(90);", "expect(catalogIds).toHaveLength(120);");
for (const id of ["iv.tree.max-path-sum","iv.design.time-key-value","iv.graph.k-stop-cheapest-route","iv.dp.edit-distance"]) {
  judgeTests = judgeTests.replace('      "iv.cpp.missing-virtual-destructor"', `      "iv.cpp.missing-virtual-destructor",\n      ${q(id)}`);
}
write("tests/unit/judge-test-suites.test.ts", judgeTests);

const e2e = `import { expect, test } from "@playwright/test";\n\nconst CASES = [\n  ["iv.trie.prefix-index", /prefix index|prefix query/i],\n  ["iv.dp.edit-distance", /minimum.*edit|insertions.*deletions/i],\n  ["iv.graph.zero-one-grid-route", /zero-one|0-1|minimum total entry cost/i]\n] as const;\n\nfor (const [id, prompt] of CASES) {\n  test(\`#693 interview expansion opens Code Lab for \${id}\`, async ({ page }) => {\n    await page.goto(\`/lab/\${id}\`);\n    const workspace = page.getByTestId("code-lab-workspace");\n    await expect(workspace).toBeVisible();\n    await expect(workspace).toContainText(prompt);\n    await expect(workspace).toContainText(/stdin:/i);\n    await expect(page.getByTestId("code-editor")).toBeVisible();\n    await expect(page.getByTestId("code-lab-tab-tests")).toBeVisible();\n  });\n}\n`;
write("tests/e2e/interview-dsa-expansion.spec.ts", e2e);

let refDoc = read("services/interview-judge/REFERENCE_CATALOG.md");
refDoc = refDoc.replace("all 90 interview problems (the 60 original problems plus the 30-problem C++ interview-question expansion in the `catalog-fixtures-07*.json` shards, #690)", "all 120 interview problems (the 60 original problems, the 30-problem C++ expansion in `catalog-fixtures-07*.json` from #690, and the 30-problem high-priority DSA expansion in `catalog-fixtures-08*.json` from #693)");
write("services/interview-judge/REFERENCE_CATALOG.md", refDoc);
write("services/interview-judge/.catalog-note", "120 problems / 383 executable fixture cases\n");

// Keep explicit interview-core policy synchronized with the catalog instead of a stale hard-coded subset.
let policy = read("src/features/interview/problem-policy.ts");
const oldSetStart = 'export const INTERVIEW_CORE_PROBLEM_IDS = new Set<string>([';
const oldSetEnd = ']);\n\nexport type ProblemExposureKind';
if (policy.includes(oldSetStart)) {
  const a = policy.indexOf(oldSetStart), b = policy.indexOf(oldSetEnd, a);
  if (b < 0) throw new Error("problem-policy core set end missing");
  policy = policy.slice(0,a) + 'export const INTERVIEW_CORE_PROBLEM_IDS = new Set<string>(\n  interviewProblems.filter((problem) => problem.interviewCore ?? true).map((problem) => problem.id)\n);\n\nexport type ProblemExposureKind' + policy.slice(b + oldSetEnd.length);
  write("src/features/interview/problem-policy.ts", policy);
}

// Remove temporary implementation plumbing from the final commit.
for (const temp of [
  "scripts/issue-693-inspect-reference.mjs",
  "scripts/issue-693-implement.mjs",
  ".github/workflows/issue-693-inspect.yml",
  ".github/workflows/issue-693-implement.yml"
]) {
  try { rmSync(temp); } catch {}
}

console.log(`#693 generated ${problems.length} problems, ${newFollowUps.length} follow-ups, ${packs.length} mock packs.`);
console.log("Primary skills:", problems.map((p)=>`${p.id}:${p.primarySkillId}`).join("\n"));
