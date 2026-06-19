# Question families per skill

This is an authoring guide (issue #50). It defines a reusable **question family**
so every skill gets consistent, well-rounded practice instead of one-off items.
Future curriculum work should follow it so coverage stays even across modules.

## The family

For each skill, author items in roughly this order. Not every skill needs all of
them, but a skill should have at least a lesson plus one gradeable item.

| # | Item `type` | Purpose |
|---|---|---|
| 1 | `lesson` | Short original explanation of the idea. |
| 2 | `lesson` (worked example) or `code_reading` | A concrete example to anchor the concept. |
| 3 | `concept_check` or `multiple_choice` | Retrieval: can the learner restate the rule? |
| 4 | `code_reading` | Predict/trace what small code does. |
| 5 | `bug_spotting` | Find and explain a realistic mistake. |
| 6 | `multiple_choice` (API/approach choice) | Choose the right facility/approach for a situation. |
| 7 | `bug_spotting` (refactor) or project prompt | Apply: refactor toward better style, or a `/labs` project. |
| 8 | spaced review | Handled automatically: items become FSRS review cards. |

This maps onto the existing loop: **learning item → quiz attempt → FSRS review →
skill event → mastery/recommendation**.

## Rules that keep content valid

These are enforced by `tests/unit/learning-item-seed.test.ts` and the DB CI smoke;
keep them true when authoring:

- Every item has a stable, unique id of the form `domain.module.skill.slug`.
- Every item maps to at least one existing skill, with exactly one primary skill.
- Every `multiple_choice` item has **exactly one** correct answer.
- The answer key (`is_correct`) lives in the seed + DB only and is never sent to
  the client; grading is server-side.
- Each new DB migration is **mirrored** in `src/features/learning-items/learning-item-seed.ts`
  (and skills in `src/features/skills/skill-seed.ts`). They must stay in lockstep.

## Density

Default to **2 items per skill** for a first pass (matching the structs/classes,
constructors, RAII, and smart-pointer modules), then deepen high-value skills with
more of the family above. Keep each expansion to **one module/skill-group per PR**
so reviews stay small.

## DSA complexity and pattern-selection items

For complexity/problem-solving coverage (#110), prefer prompts that force a
decision rather than vocabulary recall alone:

- count the operation inside each loop, including hidden work such as substring
  copies, searches, and per-iteration scans;
- compare both time and space when precomputation, hashing, memoization, or
  prefix data removes repeated work;
- ask for the invariant, progress step, and termination argument behind an
  algorithm, not just a passing sample;
- match the required operations to a pattern or container before asking for code
  details.

## Templates, concepts, and ranges items

For templates/ranges completion coverage (#112), include applied prompts that
make learners read compiler diagnostics and choose the right abstraction:

- identify the failed constraint in a short concepts diagnostic before changing
  code;
- distinguish `requires`, abbreviated constrained parameters, and unconstrained
  templates by intent;
- ask when a plain loop or ordinary algorithm is clearer than a lazy view;
- include at least one dangling-view bug and an owning materialization fix.

## Tooling and debugging items

For debugging/testing/tooling coverage (#113), prefer realistic output snippets
and workflow decisions over tool-name recall:

- ask for the first actionable compiler diagnostic and why later messages may be
  cascades;
- include failing-test output that names the behavior, input, expected value, and
  actual value;
- include sanitizer reports that ask learners to identify the bug class and the
  source line to inspect;
- pair guided write-code exercises with warnings, tests, and sanitizer-backed
  builds so tool usage is practiced, not only described.

## Trees, heaps, and DSU items

For linked-structure/tree/heap/DSU completion coverage (#114), prefer compact
trace prompts that fit on mobile and include a text equivalent for every diagram:

- pair each ASCII tree or parent table with explicit root/child/parent wording;
- ask learners to trace traversal queues, reconstruction splits, diameter
  height returns, or union-find parent rewrites rather than only name concepts;
- include operation-selection prompts that choose among vector/list, heap,
  sorted vector, map/set, and DSU from the required operations;
- keep examples small enough to trace by hand, then back important code patterns
  with executable curriculum examples.

## Graph items

For graph completion coverage (#115), every algorithm item should state the graph
conditions and complexity that make the algorithm valid:

- use shared typed fixtures for diagrams so prompt text, tests, and expected
  paths/edges stay synchronized;
- include equivalent text for every graph diagram, grid, parent table, or edge
  list visualization;
- ask learners to trace queue/stack/visited state, parent reconstruction,
  coloring conflicts, or greedy edge acceptance;
- make shortest-path and connectivity prompts choose algorithms from input
  conditions: unweighted, nonnegative weights, negative edges, all-pairs,
  online/offline updates, and cut-edge/cut-vertex needs.

## Authoring sources

Use external references (see `/resources`) for inspiration only. Because the repo
is public, keep explanations and quiz wording original.
