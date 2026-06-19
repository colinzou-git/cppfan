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

## Authoring sources

Use external references (see `/resources`) for inspiration only. Because the repo
is public, keep explanations and quiz wording original.
