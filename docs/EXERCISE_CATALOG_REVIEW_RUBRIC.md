# Exercise Catalog Review Rubric (#473)

The generated [`EXERCISE_CATALOG_COVERAGE.md`](EXERCISE_CATALOG_COVERAGE.md)
proves every required area meets its floor and flags likely duplicates / shallow
tests, but it cannot judge pedagogy. This rubric is the one-time human audit that
completes #473 and the checklist to apply when a future focused issue adds
exercises.

## Definition of done for #473

The catalog is "done" — not "as many exercises as possible" — when:

1. `pnpm check:exercise-coverage` passes (every required area at/above its floor).
2. The hard-quality tests pass (no duplicate titles, no `< 4`-test exercises, no
   uncovered exercises) — see `tests/unit/exercise-catalog-coverage.test.ts`.
3. This rubric has been walked once per area with no serious defect outstanding.

Further breadth is added through **new, narrowly scoped issues**, not by keeping
#473 open indefinitely.

## Per-area checklist

For each area in the coverage report:

- [ ] Includes beginner, intermediate, and advanced work where appropriate.
- [ ] Tasks are meaningfully distinct, not renamed variants.
- [ ] Covers real C++ API usage / behavior, not only algorithm puzzles.
- [ ] Edge cases and invalid-input contracts are explicit.
- [ ] Each exercise fits a 10–45 minute Code Lab session.
- [ ] Starters are useful without giving away the solution.
- [ ] Tests include normal, boundary, and adversarial cases.
- [ ] The related project lab makes pedagogical sense.
- [ ] Prompts are original cppFan wording (no copied problem text).

## Audit result (2026-07)

| Area | Floor | Current | Verdict |
|---|---:|---:|---|
| C++ I/O, values, functions, control flow | 4 | 7 | ✅ meets floor; spans beginner→intermediate |
| References, pointers, const, lifetime | 4 | 18 | ✅ deep, distinct tasks |
| Classes, constructors, RAII, value semantics | 6 | 11 | ✅ RAII + move + invariants covered |
| STL containers, iterators, algorithms, lambdas | 8 | 14 | ✅ broad container/algorithm usage |
| Templates, utilities, optional/variant, modern C++ | 6 | 12 | ✅ |
| Debugging, testing, exceptions, concurrency | 5 | 5 | ✅ at floor — a natural target for a future focused issue |
| Arrays, strings, hash maps | 10 | 66 | ✅ |
| Two pointers, sliding window, binary search | 6 | 24 | ✅ |
| Stacks, queues, recursion/backtracking | 4 | 10 | ✅ |
| Linked lists, trees, heaps, DSU, graphs | 6 | 24 | ✅ |
| Math, sorting, greedy, DP | 6 | 24 | ✅ |

### Advisory diagnostics reviewed

The report's `near_duplicate_skill_set` warnings (linked-list, tree, and matrix
clusters that share a skill-tag set) were reviewed and are **acceptable**: each is
a genuinely distinct problem (e.g. merge-two-sorted vs. palindrome vs.
remove-nth) that happens to carry the same coarse skill tags. They are advisory,
not CI failures.

### Follow-up (new issues, not #473)

- "Debugging/testing/concurrency" sits exactly at its floor; a future focused
  issue could add 2–3 more exception-safety / data-race exercises.
