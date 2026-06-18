# Capstone Projects: Sequenced Project Tracks

Status: implemented roadmap issue #82 through #129 and #130. The capstone
model turns the original flat `/labs` catalog into sequenced project tracks with
individually-trackable milestones, advisory prerequisites, optional exercise
links, reflection prompts, and per-learner progress.

## Tracks

The shipped seed organizes every existing project lab into coherent tracks:

- Beginner utility track
- Text and data analysis track
- Games and simulation track

The model remains additive: `project-labs.ts` still preserves the original flat
lab catalog, while `capstone-tracks.ts` adds structured projects and milestones
for projects that need step-by-step progression.

## Milestone Metadata

Each structured milestone has:

- A stable `milestone.id`
- Required/optional status
- Estimated time
- Practiced skill IDs
- Verification method: `manual_checklist`, `exercise_tests`, or `reflection`
- Reflection prompt
- Optional extension task
- Optional linked write-code exercise package from #81

Prerequisites are recommendations, not hard locks. Learners can browse any
track manually even when recommendations point to a safer starting place.

## Current Sequenced Projects

Two projects currently have five sequenced milestones each:

- `note-manager` in the beginner utility track
- `csv-table-summarizer` in the text and data analysis track

The beginner project links to `raii-scoped-array`; the DSA/data project links to
`dsa-two-sum-sorted`. Both are test-backed write-code exercise packages.

## Progress And Evidence

Per-learner progress lives in `capstone_milestone_progress` with RLS. The UI
supports marking a milestone started, marking it complete, reopening it, and
saving an optional reflection.

Completion records stable skill-event ledger entries:

- `capstone_milestone_started`
- `capstone_milestone_completed`
- `capstone_reflection_submitted`

Completed milestones also emit bounded `code_passed` evidence for the
milestone's practiced skills. This is mastery evidence only; it does not create
FSRS review cards and never auto-declares mastery.

## Recommendations

The daily plan can surface the next incomplete required milestone with a
transparent reason. The recommendation is advisory and coexists with manual
exploration in `/labs`.

## Non-Goals

- No in-browser build or execution; project work happens in Codespaces/local
  exercise packages (#81).
- No auto-mastery from project completion alone.
- No hard locks that hide advanced projects.
