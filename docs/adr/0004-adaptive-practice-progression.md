# ADR 0004: Adaptive Practice Progression (Worked Examples → Parsons → Independent Coding)

## Status

Proposed. Tracks roadmap issue #72. Depends on the curriculum foundation (#65)
and complements ADR 0005 (placement and remediation).

## Context

cppFan is strong at short lessons, quizzes, review scheduling, and mastery
tracking, but programming skill also requires a scaffolded transition from
*reading* code to *constructing* code. Worked-examples research supports
showing complete examples early and then fading support; Parsons problems are
well-evidenced scaffolding between code reading and code writing, especially
for lower-confidence learners.

References:
- Worked examples for programming: https://arxiv.org/abs/2312.02105
- Parsons scaffolding study: https://arxiv.org/abs/2311.18115
- Personalized Parsons generation: https://arxiv.org/abs/2404.10990

The current learning-item model (`public.learning_items` +
`public.learning_item_choices`, mirrored in
`src/features/learning-items/learning-item-seed.ts`) supports
`lesson`, `concept_check`, `multiple_choice`, `code_reading`, and
`bug_spotting`. It does not yet support the scaffold progression.

## Decision

Introduce a deliberate practice progression for selected skills:

1. `worked_example` — complete example with line-by-line or subgoal explanation.
2. `completion` — the same code with one or two blanked steps to fill in.
3. `parsons` — reorder code blocks (optional indentation, optional distractors).
4. `code_reading` / code tracing — predict output (already exists).
5. `write_code` — independent prompt, executed externally per ADR for #81.
6. Delayed retrieval through FSRS review (unchanged; see ADR 0003).

This is added as new item types and a recommendation-engine "scaffold level",
not as a replacement for existing items.

## Data model

Extend the item-type enum used by `learning_items.type` and the TypeScript
`LearningItemType` union with: `worked_example`, `completion`, `parsons`.
`write_code` is metadata-only in this issue (no server execution).

New protected table for ordered/answer-bearing structure (never exposed before
submission), e.g. `public.learning_item_blocks`:

| column | purpose |
| --- | --- |
| `id` | stable block id (`<item-id>.b1`) |
| `learning_item_id` | FK to the item |
| `content` | the code line/block text |
| `correct_index` | solution order (NULL for distractors) |
| `indent_level` | optional indentation (0..n) |
| `is_distractor` | block that is not part of any correct solution |

`correct_index`, `is_distractor`, and (for `completion`) the blanked answer
text live behind the same server-only boundary as
`learning_item_choices.is_correct`. The public read path (the analog of
`toPublicChoice` / `grade_learning_item_choice`) returns blocks in a shuffled
order with grading fields stripped, and a `grade_parsons` /
`grade_completion` `SECURITY DEFINER` RPC does the checking server-side.

This mirrors the existing answer-key hardening: the ordering key is never
selectable by the client.

## Grading

- `parsons`: submit an ordered list of block ids (+ indent levels if enabled).
  The RPC compares against `correct_index`/`indent_level`, ignoring distractors
  that were left unused, and returns a structural pass/fail plus the count of
  correctly placed blocks — *without* revealing the full answer on a near miss
  ("check structure" feedback).
- `completion`: submit the filled blanks; grade by normalized comparison
  (trim/whitespace-insensitive) against the protected answer.
- `worked_example`: no grading; viewing it logs an event.

## Adaptation rules (deterministic)

The recommendation engine selects a scaffold level from existing mastery/error
evidence (no opaque ML):

- Low mastery or a recently weak skill → start at `worked_example`/`completion`/
  `parsons`.
- Strong mastery → skip directly to `code_reading` or `write_code`.
- Repeated syntax/ordering errors (see ADR 0005 error patterns) → inject a
  `parsons` remediation item.

Mastery evidence distinguishes **recognition** (multiple_choice/code_reading),
**reconstruction** (parsons/completion), and **independent application**
(write_code), so the mastery model can weight them differently.

## Events (stable names)

Add to `docs/EVENT_SCHEMA_STABLE_NAMES.md`:
`worked_example_viewed`, `completion_submitted`, `parsons_submitted`,
`parsons_hint_used`, `parsons_checked`. These contribute mastery evidence but
remain separate from FSRS card scheduling (ADR 0003).

## UI

- Parsons blocks render as an ordered, reorderable list.
- Drag/drop **and** keyboard-accessible reordering (move-up/move-down buttons
  with `aria` live updates) — keyboard path is mandatory, not an enhancement.
- Reordering must work by touch on iPhone/iPad; this can only be confirmed on a
  real device and must be treated as unverified until then.
- "Check structure" gives per-position feedback and supports retry + hints.

## Rollout

Add **one** complete worked-example→Parsons progression for a single existing
skill first (candidate: `cpp.control_flow.loops` or `cpp.stl.algorithms`),
rather than converting all content. Extend the seed-integrity test
(`tests/unit/learning-item-seed.test.ts`) to validate that every `parsons`
item has ≥2 blocks with a complete, gap-free `correct_index` sequence and at
most the declared distractors, and that no public payload exposes ordering.

## Consequences

Benefits: a genuine read→write bridge; richer mastery evidence; reuses the
existing event ledger and answer-key protection pattern.

Tradeoffs: a new protected table + RPCs; new grading and seed-integrity tests;
accessible reordering is non-trivial and needs device verification; migrations,
TS types, grading, seed, and UI must change together (one slice, not a big bang).

## Non-goals

- No arbitrary server-side C++ execution (that is ADR for #81).
- No automatic LLM content generation without validation.
- No conversion of every existing item in the first PR.

## Update — adaptive scaffold selector (#415)

A deterministic scaffold selector (`src/features/recommendations/scaffold-selector.ts`)
now chooses the next practice **level** — worked example → completion → Parsons →
code reading → bug spotting → Code Lab → review → project milestone — from the
learner's mastery status, recent Code Lab error tags (#412), and which item types
are actually available for the skill.

Key properties:

- **Due FSRS reviews still win globally.** The selector only ranks *non-review*
  next practice; the daily plan keeps due reviews first.
- **Transparent, not opaque.** Every recommendation carries a human-readable
  reason (`scaffold-reasons.ts`); there is no ML model and no mastery-scoring
  change — mastery status is read, never rewritten.
- **Never a hard lock.** Recommendations are suggestions rendered as a dismissible/
  optional card (`scaffold-recommendation-card.tsx`); the learner can practice
  anything. If the preferred level has no available item, it falls back to the
  nearest available level rather than blocking.
- Surfaced in the Code Lab after a run/test (when no error-pattern remediation is
  shown) and available to the dashboard daily plan.
