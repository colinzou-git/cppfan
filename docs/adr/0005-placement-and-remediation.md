# ADR 0005: Optional Placement and Targeted Wrong-Answer Remediation

## Status

Proposed. Tracks roadmap issue #73. Depends on the curriculum foundation (#65)
and complements ADR 0004 (adaptive practice progression).

## Context

A single fixed path is inefficient for both complete beginners and experienced
programmers. cppFan already has mastery tracking, a prerequisite graph
(`skill_prerequisites`), a skill-event ledger (ADR 0003), and deterministic
recommendations. That is enough to (a) suggest a better starting point and
(b) respond to repeated wrong-answer patterns — without an opaque model and
without permanently locking content.

## Decision

Add two complementary, deterministic capabilities:

1. An **optional placement flow** that suggests where to start.
2. **Wrong-answer categorization + targeted remediation** keyed off existing
   learning items.

Both produce *evidence and recommendations only*. Neither hard-locks modules
nor permanently sets mastery, and neither is merged into FSRS scheduling.

## Optional placement flow

- A short onboarding assessment spanning C++ basics, functions, references,
  classes, STL, complexity, and introductory DSA, assembled from **existing**
  learning items (reuse, don't duplicate).
- The learner may skip, retake, or reset it at any time.
- For each covered module the result is one of: **start here**,
  **review soon**, or **probably familiar**.
- Placement seeds the recommendation ranking; it does not lock modules or write
  durable mastery.

Placement definitions ship as typed seed data first (e.g.
`src/features/placement/placement-seed.ts`: an ordered list of
`{ module_id, item_ids[] }`), mirrored by an idempotent migration, following
the same seed↔migration lockstep used across the curriculum.

## Wrong-answer categories

Map selected distractor choices to **stable instructional tags**, for example:

- `cpp.initialization.assignment_vs_initialization`
- `cpp.references.copy_vs_alias`
- `cpp.ownership.raw_pointer_means_owner`
- `cpp.stl.map_subscript_inserts`
- `dsa.binary_search.unsorted_input`
- `dsa.complexity.loop_cost`

The mapping (choice id → instructional tag) is **protected grading metadata**:
it lives behind the server-only boundary alongside `is_correct` and is never
returned by the public item read path before submission. The
`grade_learning_item_choice` RPC (or a sibling) returns the matched tag(s) only
*after* an answer is submitted.

Data model: a `public.choice_error_tags` table
(`choice_id`, `instructional_tag`) with RLS, plus a typed seed mirror. The tag
catalog is a typed enum/const so tags stay stable and testable.

## Targeted remediation

When an error pattern is observed (a tag accrues enough recent hits for a user):

- show a short explanation or `worked_example` (ADR 0004) for that pattern;
- schedule a *contrasting* question later (e.g. the map-subscript-inserts case
  vs. `.at()`/`find`);
- surface the **reason** a related skill is being recommended;
- record the evidence in the event ledger, kept separate from FSRS cards.

## Events (stable names)

Add to `docs/EVENT_SCHEMA_STABLE_NAMES.md`:
`placement_started`, `placement_completed`, `placement_reset`,
`error_pattern_observed`, `error_pattern_cleared`. These feed the mastery /
recommendation engine, not FSRS scheduling (ADR 0003).

## Recommendation reasons

The recommendation engine becomes *explainable*: each suggestion carries a
human-readable reason ("recommended because you missed 2 questions tagged
`dsa.binary_search.unsorted_input`" or "placement suggested starting here").
Update the deterministic rules and their unit tests together.

## Privacy / RLS

Per-user placement results and per-user error-pattern evidence are user-owned
rows protected by RLS — never readable by another user, consistent with the
project's database rules. Signed-out and pre-migration states fall back to the
default ordering with no placement/remediation, so the app still works offline
and before the user applies migrations.

## Acceptance (from #73)

- Onboarding can suggest a starting module without locking content.
- ≥3 existing modules have tagged distractors and targeted follow-up
  explanations.
- Placement can be skipped, retaken, and reset.
- Per-user placement and remediation evidence is RLS-protected.
- Recommendation reasons are visible to the learner.
- Unit, migration, and e2e tests cover the new flow; `pnpm verify:codespace`
  passes.

## Consequences

Benefits: faster, fairer starting point; explainable recommendations; reuses
existing items, events, and the answer-key protection pattern.

Tradeoffs: new protected tables + seeds + RLS policies; richer (still
deterministic) recommendation rules; more tests; placement-assembly content
curation.

## Non-goals

- No opaque machine-learning model.
- No permanent mastery from placement alone.
- No merging of FSRS state with skill mastery.
