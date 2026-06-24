# Capstone Projects: Sequenced Project Tracks

Status: implemented roadmap issue #82 through #129 and #130. The capstone
model turns the original flat `/labs` catalog into sequenced project tracks with
individually-trackable milestones, advisory prerequisites, optional exercise
links, reflection prompts, and per-learner progress.

## Tracks

The shipped seed organizes every existing project lab into coherent tracks:

- Beginner utility track
- Text and data analysis track
- String applications track
- Games and simulation track
- Graph problem-solving track
- Math technique track
- Concurrency correctness track

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

Several projects currently have five sequenced milestones each:

- `note-manager` in the beginner utility track
- `csv-table-summarizer` in the text and data analysis track
- `dictionary-autocomplete` in the string applications track
- `directory-inventory-reporter` in the text and data analysis track
- `math-technique-playground` in the math technique track

The beginner project links to `raii-scoped-array`; the DSA/data project links to
`dsa-two-sum-sorted`; the string project links to `trie-autocomplete`; the
filesystem utility project links to `filesystem-inventory`; the math project
links to `math-combination-generator`. All are test-backed write-code exercise
packages.

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

## Update (#439): project-level Code Labs and unified cards

`/labs` now renders every project — capstone-track and flat — with the same
unified `ProjectCard` (`src/features/labs/project-card.tsx`). Each project is one
codebase:

- A project is a single compilable codebase opened at `/lab/<projectId>` (e.g.
  `/lab/csv-table-summarizer`). Milestones are checkpoints **inside** that code,
  shown as plain-text guidance — they are never compiled separately and no longer
  have milestone-level Code buttons, code previews, "Mark started", "Reopen", or
  reflection textareas on the card list.
- Each card has exactly four project-level actions: `Code`, `AI Chat`,
  `Chat history`, and `Mark complete`. AI Chat / Chat history are scoped by
  `sourceKind: "project_lab"` + the project id, so history is per whole project.
- Project-level Code Lab configs live in
  `src/features/code-lab/project-code-lab-configs.ts`, keyed by **project id**
  (never a milestone id). Visible tests may carry an optional `milestoneId` label
  so milestone progress can later be inferred from project-level attempts/tests.
- Manual project completion is stored in `project_lab_progress` (RLS-owned;
  see `project-progress.ts` / `project-actions.ts`) and emits a
  `completion_submitted` event. Milestone-level `capstone_milestone_progress`
  remains for backward compatibility but is no longer driven from the `/labs`
  card UI. The old `AI help for capstone milestones` section was removed.

Inferred per-milestone badges are intentionally out of scope for #439; the data
shape (project-level attempts, `milestoneId`-tagged tests) is in place for a
future scorer. The "no in-browser build" non-goal below is superseded for the
in-app Code Lab, which runs project code via the keyless Piston runner.

## Recommendations

The daily plan can surface the next incomplete required milestone with a
transparent reason. The recommendation is advisory and coexists with manual
exploration in `/labs`.

## Non-Goals

- No in-browser build or execution; project work happens in Codespaces/local
  exercise packages (#81).
- No auto-mastery from project completion alone.
- No hard locks that hide advanced projects.
