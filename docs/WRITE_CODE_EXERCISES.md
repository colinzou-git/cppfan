# Write-Code Exercises

Status: implemented roadmap issue #81 / #128 workflow; in-app Code Lab is the
primary path as of #440. Quizzes, code reading, and Parsons puzzles scaffold
understanding, but proficiency needs writing, compiling, testing, and debugging
real code.

## Primary path: in-app Code Lab (#440)

On `/exercises`, each write-code exercise card has a **Code** button that opens
the built-in full-screen Code Lab at `/lab/<exerciseId>` (e.g.
`/lab/dsa-two-sum-sorted`). There the learner edits starter C++, runs the
program, runs visible/hidden tests on the keyless Piston runner, and gets AI
help — all in the browser, on phone/tablet/desktop. Passing the real
(non-simulated) tests records code-attempt evidence and auto-marks the exercise
completed (without duplicate skill-event spam); `Mark tests passed` remains as a
manual self-report. AI Chat / Chat history stay scoped to
`sourceKind: "write_code_exercise"` + the exercise id.

Exercise-level Code Lab configs live in
`src/features/code-lab/exercise-code-lab-configs.ts`, keyed by exercise id. They
are single-file stdin/stdout harnesses that preserve the spirit of the original
header-based packages; hidden test I/O (if any) stays server-side.

## Advanced path: local / Codespaces workflow

The original test-backed packages still exist for learners who prefer a real
toolchain (kept under the card's "Advanced local workflow"). These run in
**GitHub Codespaces** (or any machine with a C++20 compiler); that path does not
execute C++ on cppFan's web server.

## Package layout

```text
exercises/<exercise-id>/
  README.md          # the task, requirements, and commands
  exercise.json      # id, skills, difficulty, editable files, build/test commands
  starter/           # what the learner edits (TODO stubs)
  tests/tests.cpp    # the tests (do not edit)
  solution/          # reference solution (do not peek until done)
  work/              # generated working copy (git-ignored)
```

`exercise.json` links each exercise to skill IDs and a related `/labs` project,
and lists the editable files, build/test commands, required test names, and
hints. The solution and the tests' answer logic are kept out of the
learner-facing default path (`work/` only ever contains the starter).

## The Three Commands

All scripts write **only** inside the exercise's own `work/` directory and
refuse to touch anything else.

```bash
# 1. Prepare a working copy of the starter
scripts/exercises/prepare.sh <exercise-id>

# 2. Edit exercises/<exercise-id>/work/<file> ...

# 3. Build (warnings + address/UB sanitizers) and run the tests
scripts/exercises/test.sh <exercise-id>

# Start over from the starter at any time
scripts/exercises/reset.sh <exercise-id>
```

The build uses `g++ -std=c++20 -Wall -Wextra -Wpedantic
-fsanitize=address,undefined`. On a toolchain without AddressSanitizer, such as
some Windows/MinGW setups, prefix with `EX_SANITIZE=0`. Linux Codespaces have
ASan, so leave it on there.

## On iPhone / iPad

1. In cppFan, open an exercise and tap **Open instructions** to see the package
   path and commands.
2. Open the repo in a **Codespace** from the GitHub mobile app or Safari
   (`Code` -> `Codespaces` -> `Create`). Codespaces give you a real Linux
   terminal in the browser, so the three commands above work unchanged on a
   phone.
3. Run `prepare`, edit `work/<file>` in the Codespace editor, then run `test`.
4. When the tests pass, return to cppFan and mark the exercise complete.

## Completion Evidence

The workflow is explicit/manual: the learner marks **tests passed** and
optionally records a short reflection. cppFan records write-code skill evidence
with the stable ledger names `code_attempted` and `code_passed` for the
exercise's `skill_ids`. As with all practice, this contributes mastery
**evidence**; it does not automatically declare mastery, and it stays separate
from FSRS review scheduling (ADR 0003).

A later iteration may verify a GitHub Actions result or a signed exercise
report instead of a manual mark.

The in-app Code Lab (separate from these local exercises) emits structured AI
feedback with a stable error-tag schema (`weak_ai_inference`) that future
remediation/mastery work can consume; it remains advisory and never overrides
deterministic compile/test results. It can also show skill-resolved boundary-case
checklists (#411) as strategy hints (no mastery impact). Selected single-file
capstone milestones (#418) are practiced directly in the Code Lab, with
completion gated on passing the visible tests; larger work stays in Codespaces.
See [CODE_LAB.md](CODE_LAB.md).

## Current Exercises

| id | skills | lab |
| --- | --- | --- |
| `io-grade-calculator` | console I/O, variables, conversions, conditionals | `text-statistics-analyzer` |
| `strings-valid-palindrome` | palindromes, two pointers, case handling | `text-statistics-analyzer` |
| `dsa-binary-search-lower-bound` | binary search, array indexing | `math-technique-playground` |
| `strings-anagram-check` | character frequency, hashing | `text-statistics-analyzer` |
| `dsa-max-subarray-sum` | DP design, prefix sums | `math-technique-playground` |
| `stl-vector-stats` | `std::vector`, STL algorithms | `text-statistics-analyzer` |
| `cpp-rational-reduce` | struct invariants | `math-technique-playground` |
| `dsa-valid-parentheses` | stacks | `math-technique-playground` |
| `dsa-first-unique-char` | hash lookup, character frequency | `text-statistics-analyzer` |
| `strings-longest-unique-substring` | sliding window, hash lookup | `text-statistics-analyzer` |
| `dsa-merge-sorted-arrays` | two pointers, array traversal | `math-technique-playground` |
| `dsa-count-set-bits` | bit manipulation | `math-technique-playground` |
| `bit-single-number` | bit manipulation (XOR), array traversal | `bit-technique-playground` |
| `bit-missing-number` | bit manipulation (XOR), array traversal | `bit-technique-playground` |
| `bit-power-of-two` | bit manipulation | `bit-technique-playground` |
| `bit-hamming-distance` | bit manipulation | `bit-technique-playground` |
| `array-plus-one` | array traversal, indexing | `array-technique-playground` |
| `matrix-transpose` | array indexing, traversal | `array-technique-playground` |
| `strings-roman-to-integer` | string parsing, manipulation | `text-processing-playground` |
| `math-gcd` | number theory (Euclid) | `math-technique-playground` |
| `matrix-rotate-image` | array indexing, traversal | `array-technique-playground` |
| `math-integer-sqrt` | binary search, number theory | `math-technique-playground` |
| `matrix-spiral-order` | array indexing, traversal | `array-technique-playground` |
| `strings-is-subsequence` | string manipulation, two pointers | `text-processing-playground` |
| `array-rotate-right` | array two pointers, indexing | `array-technique-playground` |
| `strings-longest-palindrome-buildable` | char frequency, palindrome | `text-processing-playground` |
| `linked-list-remove-elements` | linked list, pointers | `linked-list-technique-playground` |
| `linked-list-middle-node` | linked list, pointers | `linked-list-technique-playground` |
| `tree-max-depth` | tree traversal, pointers | `tree-technique-playground` |
| `tree-sum-values` | tree traversal, pointers | `tree-technique-playground` |
| `tree-count-leaves` | tree traversal, pointers | `tree-technique-playground` |
| `strings-reverse-vowels` | string manipulation, two pointers | `text-processing-playground` |
| `stack-evaluate-rpn` | stack, array traversal | `stack-technique-playground` |
| `array-majority-element` | array traversal, Big-O (Boyer-Moore) | `array-technique-playground` |
| `dp-min-path-sum` | dynamic programming, array indexing | `dp-technique-playground` |
| `stack-daily-temperatures` | stack (monotonic), array traversal | `stack-technique-playground` |
| `array-container-most-water` | array two pointers, Big-O | `array-technique-playground` |
| `math-count-primes` | number theory (sieve), array traversal | `math-technique-playground` |
| `dp-max-product-subarray` | dynamic programming, array traversal | `dp-technique-playground` |
| `stack-next-greater-element` | stack (monotonic), array traversal | `stack-technique-playground` |
| `strings-atoi` | string parsing, Big-O | `text-processing-playground` |
| `dp-partition-equal-subset-sum` | dynamic programming, array traversal | `dp-technique-playground` |
| `bit-single-number-ii` | bit manipulation, array traversal | `bit-technique-playground` |
| `dp-coin-change-ways` | dynamic programming, array traversal | `dp-technique-playground` |
| `linked-list-merge-two-sorted` | linked list, pointers | `linked-list-technique-playground` |
| `tree-path-sum` | tree traversal, pointers | `tree-technique-playground` |
| `linked-list-palindrome` | linked list, pointers | `linked-list-technique-playground` |
| `tree-validate-bst` | BST search, tree traversal, pointers | `tree-technique-playground` |
| `linked-list-remove-nth-from-end` | linked list, pointers | `linked-list-technique-playground` |
| `bit-reverse-bits` | bit manipulation, Big-O | `bit-technique-playground` |
| `strings-reverse-words` | string manipulation, parsing | `text-processing-playground` |
| `dp-edit-distance` | dynamic programming, DP forms | `dp-technique-playground` |
| `dp-word-break` | dynamic programming, string searching | `dp-technique-playground` |
| `backtracking-permutations` | recursion, recursion choice, combinatorics | `backtracking-technique-playground` |
| `backtracking-generate-parentheses` | recursion, recursion choice, combinatorics | `backtracking-technique-playground` |
| `dp-longest-increasing-subsequence` | dynamic programming, DP design, array traversal | `dp-technique-playground` |
| `dp-unique-paths` | dynamic programming, DP design, combinatorics | `dp-technique-playground` |
| `strings-longest-common-prefix` | string manipulation, array traversal | `text-technique-playground` |
| `dsa-sort-by-frequency` | custom comparators, hash lookup | `math-technique-playground` |
| `cpp-string-split` | string parsing, `std::string` | `text-statistics-analyzer` |
| `dsa-move-zeroes` | two pointers, array traversal | `math-technique-playground` |
| `raii-scoped-array` | RAII lifetime/cleanup, move semantics | `note-manager` |
| `stl-text-stats` | `std::map`, STL algorithms, parsing | `text-statistics-analyzer` |
| `trie-autocomplete` | trie, character handling, prefix queries | `dictionary-autocomplete` |
| `dsa-two-sum-sorted` | two pointers, Big-O | `csv-table-summarizer` |
| `tooling-status-parser` | debugging method, unit/regression tests, warnings, sanitizers, CMake | `debugging-toolchain-lab` |
| `filesystem-inventory` | filesystem, file streams, stream validation | `directory-inventory-reporter` |
| `concurrency-task-queue` | threads, mutexes, condition variables, shared-state design | `task-queue-lab` |
| `graph-maze-shortest-path` | graph BFS, connected components, shortest paths | `maze-route-planner` |
| `math-combination-generator` | counting principle, combination generation, bitmask subsets | `math-technique-playground` |
| `loops-number-summary` | loops, loop invariants, array traversal | `number-guessing-stats` |
| `functions-temperature-converter` | functions, decomposition, numeric conversions | `unit-converter` |
| `getline-contact-parser` | getline input, stream validation, string parsing | `csv-table-summarizer` |
| `references-swap-clamp` | references, parameter passing, const-correctness | `math-technique-playground` |
| `const-report-statistics` | const-correctness, parameter passing, array traversal | `number-guessing-stats` |
| `pointers-safe-find` | pointers, non-owning pointers, avoiding dangling | `note-manager` |
| `structs-point-distance` | struct syntax, const methods, array traversal | `math-technique-playground` |
| `class-bank-account` | public/private, class invariants, const methods | `note-manager` |
| `constructors-student-record` | parameterized/default constructors, initializer lists | `quiz-generator` |
| `operators-fraction-normalize` | class invariants, operator overloading | `math-technique-playground` |
| `unordered-map-log-counter` | hash maps, STL algorithms, hashing | `text-statistics-analyzer` |
| `set-deduplicate-preserve-count` | std::set, STL algorithms, traversal | `text-statistics-analyzer` |
| `priority-queue-top-k` | container adapters (priority_queue), algorithms | `math-technique-playground` |
| `deque-browser-history` | public/private, index arithmetic, invariants | `note-manager` |
| `algorithm-clean-scores` | STL algorithms, std::vector, lambdas | `text-statistics-analyzer` |
| `string-anagram-groups` | anagram signatures, char frequency, std::map | `text-statistics-analyzer` |
| `csv-row-parser` | string parsing, quoted-field edge cases | `csv-table-summarizer` |
| `kmp-prefix-table` | KMP prefix function, string searching | `dictionary-autocomplete` |
| `rolling-hash-substring-equality` | polynomial hashing, substring equality | `dictionary-autocomplete` |
| `array-remove-duplicates-sorted` | two pointers, in-place compaction | `csv-table-summarizer` |
| `array-product-except-self` | prefix/suffix products | `math-technique-playground` |
| `sliding-window-min-size-subarray` | sliding window, two pointers | `math-technique-playground` |
| `binary-search-first-last` | binary search, first/last occurrence | `csv-table-summarizer` |
| `interval-merge-meetings` | interval scheduling, comparators | `math-technique-playground` |
| `linked-list-reverse` | linked lists, pointers | `note-manager` |
| `linked-list-detect-cycle` | linked lists, Floyd cycle detection | `note-manager` |
| `stack-min-stack` | stacks, O(1) minimum, amortized cost | `task-queue-lab` |
| `tree-lowest-common-ancestor-bst` | BST search, tree traversal | `dictionary-autocomplete` |
| `dsu-number-of-islands` | union-find, connected components | `maze-route-planner` |
| `graph-course-schedule` | topological sort, cycle detection | `maze-route-planner` |
| `graph-clone-undirected` | graph DFS, deep copy, pointers | `maze-route-planner` |
| `graph-dijkstra-network-delay` | Dijkstra, shortest paths | `maze-route-planner` |
| `graph-bipartite-coloring` | bipartite check, BFS coloring | `maze-route-planner` |
| `graph-kruskal-mst` | minimum spanning tree, union-find | `maze-route-planner` |
| `dp-climbing-stairs` | dynamic programming, Fibonacci recurrence | `math-technique-playground` |
| `dp-house-robber` | dynamic programming, non-adjacent selection | `math-technique-playground` |
| `dp-coin-change-min` | dynamic programming, min-coins | `math-technique-playground` |
| `dp-longest-common-subsequence` | dynamic programming, subsequences | `dictionary-autocomplete` |
| `greedy-jump-game` | greedy reachability | `math-technique-playground` |
| `greedy-activity-selection` | greedy interval scheduling | `math-technique-playground` |
| `backtracking-subsets` | backtracking, power set | `math-technique-playground` |
| `backtracking-combination-sum` | backtracking, combinations | `math-technique-playground` |
| `math-fast-power-mod` | modular exponentiation, bit tricks | `math-technique-playground` |
| `geometry-segment-intersection` | cross products, segment intersection | `math-technique-playground` |
| `template-generic-clamp` | function templates, deduction | `unit-converter` |
| `template-fixed-array` | class templates, non-type params | `math-technique-playground` |
| `optional-parse-int` | std::optional, from_chars validation | `csv-table-summarizer` |
| `variant-json-token` | std::variant, std::visit, if constexpr | `csv-table-summarizer` |
| `ranges-filter-transform` | C++20 ranges views, lambdas | `text-statistics-analyzer` |
| `geometry-convex-hull` | convex hull, monotone chain | `math-technique-playground` |
| `debug-fix-off-by-one` | debugging, loop bounds | `debugging-toolchain-lab` |
| `input-validation-menu-loop` | input validation, loops | `quiz-generator` |
| `chrono-rate-limiter-sim` | time modeling, sliding window | `task-queue-lab` |
| `random-dice-histogram` | seeded RNG, reproducibility | `number-guessing-stats` |
| `filesystem-extension-summary` | std::filesystem paths, extension parsing | `directory-inventory-reporter` |
| `concurrency-atomic-counter` | atomics, threads, data races | `task-queue-lab` |
| `concurrency-producer-consumer` | mutex, condition variables, shared state | `task-queue-lab` |
| `raii-file-handle-simulator` | RAII lifetime, destructor cleanup | `note-manager` |
| `value-semantics-deep-copy-buffer` | deep copy, rule of five, move | `note-manager` |
| `unique-ptr-task-list` | unique_ptr, ownership transfer | `todo-planner` |
| `shared-weak-observer-graph` | shared_ptr/weak_ptr, breaking cycles | `note-manager` |
| `vector-running-median-simple` | two-heap running median | `math-technique-playground` |
| `binary-search-answer-capacity` | binary search on the answer | `math-technique-playground` |
| `sort-custom-log-records` | multi-key comparator, stable sort | `csv-table-summarizer` |
| `queue-level-order-tree` | BFS level-order traversal | `dictionary-autocomplete` |
| `tree-diameter` | tree diameter via DFS heights | `dictionary-autocomplete` |
| `heap-merge-k-sorted-lists` | min-heap k-way merge | `note-manager` |

## Maintaining Exercises (CI)

`scripts/exercises/verify-all.sh` builds every reference solution and confirms
it passes its own tests, and builds every starter (which is expected to fail the
tests until implemented). Run it before changing an exercise:

```bash
scripts/exercises/verify-all.sh        # EX_SANITIZE=0 on MinGW
```

The CI `C++ exercises` job runs `scripts/exercises/verify-all.sh`, so starter
and solution builds are validated on every change from a clean Linux checkout.
