# Capstone Projects — Sequenced Project Tracks (Spec)

Status: Proposed. Tracks roadmap issue #82. Depends on #66, #71, and the
write-code exercise workflow (#81). Builds on the existing `/labs` catalog
(`src/features/labs/project-labs.ts`).

## Why

The current `projectLabs` catalog is a flat list of good project ideas with
ungraded milestone hints. Learners benefit more when projects form a
**progression** where each milestone deliberately applies recently learned
skills and produces evidence of *transfer* — stronger evidence than isolated
quizzes — while staying motivating and practical.

Project-based learning here does **not** mean "build a large app with no
support." Every capstone starts with a small working version, then adds one
concept at a time, with tests, reflection, and optional extensions.

## Four tracks

### 1. Beginner utility track
CLI quiz/flashcard reviewer · CSV/text statistics analyzer · todo/note manager ·
unit-conversion / simple-simulation tool.
Skills: foundations, functions, control flow, strings, vectors, file I/O,
testing.

### 2. Modern C++ design track
Resource-safe document/index model · configurable task scheduler · small
plugin/interface example · structured data parser.
Skills: classes, invariants, RAII, smart pointers, value semantics, variant,
error handling, CMake/tests.

### 3. DSA application track
Text search/autocomplete · maze/pathfinding explorer · dependency-graph
analyzer · range-query analytics tool.
Skills: hashing, string matching, BFS/DFS, shortest paths, heaps, DSU, prefix
sums, segment/Fenwick trees.

### 4. Advanced systems / concurrency track
Concurrent job queue · parallel data-processing pipeline · small key-value
store · cache/scheduler simulation.
Skills: synchronization, task-based design, testing, profiling, file
persistence, interface design.

The four tracks map onto the curriculum modules shipped under #65: track 1 →
`cpp.program_basics`..`cpp.functions` + `cpp.stl` + `cpp.utilities.file_io`;
track 2 → `cpp.structs_classes`/`cpp.constructors`/`cpp.raii`/
`cpp.smart_pointers`/`cpp.value_semantics`/`cpp.oop`/`cpp.utilities.variant`;
track 3 → the `dsa.*` modules; track 4 → `cpp.concurrency` + `cpp.oop` +
`cpp.tooling`.

## Data model

Extend `ProjectLab` (and the mirroring seed/migration if labs move into the DB)
with capstone metadata. New fields:

| field | meaning |
| --- | --- |
| `track_id` | one of `beginner_utility`, `modern_cpp`, `dsa_application`, `advanced_systems` |
| `milestone_id` | stable id within the track |
| `prerequisite_skill_ids` | skills assumed before starting |
| `practiced_skill_ids` | skills this milestone applies (links to `skills.id`) |
| `required` | required vs optional milestone |
| `estimated_minutes` | expected time |
| `exercise_id` | optional `exercises/<id>` package (#81) providing starter + tests |
| `verification` | `manual_checklist` \| `exercise_tests` \| `reflection` |
| `reflection_prompts` | short prompts after completion |
| `extension_tasks` | optional stretch goals |

Milestones become ordered, individually trackable units rather than a plain
string list. Keep the existing flat catalog working during migration (additive
change; don't remove the current `milestones` rendering until the new model is
live).

## Milestone structure

Each milestone follows the same shape:

1. **Starting point** — a small working version (often an `exercises/<id>`
   starter that already compiles).
2. **Add one concept** — a single new idea applied (e.g. "replace the raw
   pointer with `unique_ptr`").
3. **Test** — the milestone ships with or references tests (via #81) that must
   pass.
4. **Reflect** — one or two `reflection_prompts`.
5. **Extend (optional)** — `extension_tasks` for stronger learners.

## Completion evidence

Completing a milestone records skill-event evidence (per ADR 0003), using
stable event names: `capstone_milestone_started`,
`capstone_milestone_completed`, `capstone_reflection_submitted`. Completion
contributes mastery evidence for the `practiced_skill_ids` but does **not**
automatically declare mastery, and stays separate from FSRS scheduling.

Verification reuses #81: where a milestone has an `exercise_id`, "tests passed"
in the Codespace is the evidence; otherwise a manual checklist + reflection.

## Acceptance (from #82)

- Four tracks exist, each a sequence of milestones with required/optional
  distinction and skill links.
- Each milestone starts from a small working version and adds one concept.
- Milestones link to skills and (where applicable) `exercises/` packages.
- Completion creates skill-event evidence without auto-declaring mastery.
- The `/labs` UI presents tracks and milestone progression on mobile + desktop.

## Rollout

Land one full track first (the **beginner utility** track maps cleanly onto the
existing beginner labs and the first #81 exercises), then add the others. Keep
the data-model change additive and covered by unit tests for the new fields and
skill-id references (every `practiced_skill_ids` entry must exist in
`skillSeed`).

## Non-goals

- No in-browser build/execution; project work happens in Codespaces (#81).
- No auto-mastery from project completion alone.
