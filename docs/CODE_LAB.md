# Code Lab (in-app C++ editor, runner, tests, AI review)

The Code Lab (#407) lets learners write C++ inside cppFan, run it, run visible
tests, and ask the AI to review the result — without leaving the learning flow.

**Phase 1** is Run/Test + AI review. **Phase 2 (#408)** adds an AI-generated
educational **trace**. Neither phase has a real breakpoint/step debugger — there
are no breakpoints, step controls, variable watches, or GDB/LLDB/DAP integration.

## How it appears

The Code Lab is **metadata-driven**. It renders wherever a learning item carries
Code Lab metadata, via the shared `MaybeCodeLab` mount in the learning-item view
— no page duplicates the editor/runner logic. An item opts in through the
`codeLabConfigs` map in `src/features/code-lab/code-lab-catalog.ts`; items without
config render no editor.

Bundled seed examples (run without Supabase):

- `cpp.program_basics.structure.lesson` — print a greeting
- `cpp.program_basics.io.lesson` — echo a line of input
- `cpp.program_basics.statements_comments.lesson` — print two lines

## Running locally with the mock runner

By default `CODE_RUNNER_PROVIDER=mock`. The mock is a deterministic, network-free
simulator for the simple program shapes the seed uses (printing string literals,
echoing stdin). **It does not compile real C++** — every result is flagged
`simulated`. This keeps local dev and CI fast and offline.

```bash
CODE_RUNNER_PROVIDER=mock   # default; deterministic simulator
```

## Real execution (Piston)

For real compile/run, point the runner at a Piston instance. The public endpoint
needs no API key:

```bash
CODE_RUNNER_PROVIDER=piston
CODE_RUNNER_BASE_URL=https://emkc.org/api/v2/piston   # default when unset
CODE_RUNNER_API_KEY=                                  # only for protected instances
CODE_RUNNER_TIMEOUT_MS=5000
CODE_RUNNER_MEMORY_MB=128
```

C++ defaults to `g++ -std=c++20 -Wall -Wextra -Wpedantic -O0`. Untrusted C++ is
**never** executed in the Next.js process — all runs go through the runner
adapter behind the `/api/code/*` routes.

## AI review

AI review reuses the AI Chat provider (`AI_PROVIDER`, `GROQ_API_KEY`,
`AI_CHAT_ENABLED`). It builds context from the item prompt, skill tags, the
learner's code, and compiler/run/test summaries, then returns short hint-first
feedback. When no provider is configured the panel shows a friendly unavailable
state and Run/Test keep working. AI feedback is always labelled; compiler output
and test results are the source of truth.

## AI trace (Phase 2)

"Trace with AI" produces an **approximate, AI-generated** educational walkthrough
of how the code likely executed for a selected input or visible test case — a
step/variable/explanation table, likely-issue, and next hint. It is **not** a
debugger and not real runtime inspection; every successful trace carries a
disclaimer that compiler output and test results are the source of truth.

- It appears wherever a Code Lab is mounted, unless the item sets
  `traceEnabled: false`. Default is on (the trace endpoint degrades to a friendly
  unavailable state when no AI provider is configured).
- Compile errors are explained as blockers — the model is not asked to fabricate
  runtime steps for code that never ran.
- The learner can trace the current stdin or a visible test case. Hidden test
  inputs/expected outputs are resolved server-side and never reach the prompt or
  response: the route only honours visible test names.
- Server route: `app/api/code/trace/route.ts`; logic in `code-trace-service.ts`
  and `code-trace-prompts.ts`; UI in `trace-controls.tsx` / `ai-trace-panel.tsx`.

## Structured AI feedback (Phase 3.1)

AI Review and AI Trace return **machine-validated `StructuredCodeFeedback`**
(`code-feedback-types.ts`), not just prose: `summary`, `likelyIssue`,
`errorTags` (from the fixed `CODE_ERROR_TAGS` list), `relatedSkills`,
`nextAction`, `confidence`, and a `learnerMessage`. It is rendered by the shared
`CodeFeedbackPanel`.

- **Advisory only.** Every structured result is `evidenceStrength:
  "weak_ai_inference"` and the panel always shows that compiler output and test
  results are authoritative. `mergeRunAndAiFeedback` derives the authoritative
  outcome from run/test results alone — AI output can never change it.
- **Unknown error tags are discarded**; `confidence`/`nextAction` are clamped to
  the allowed vocabularies. Malformed/prose model output degrades to a readable
  `invalid` fallback and never throws to the route.
- The error-tag vocabulary is intentionally small and stable (`code-error-tags.ts`)
  so later remediation/mastery phases can consume it; never renumber a tag.

## Code Lab in capstone milestones (Phase 3.9)

Selected single-file capstone milestones can be practiced in-app via the Code Lab
(#418) instead of only a description or Codespaces instructions. A milestone opts
in with `executionMode: "in_app_code_lab"`; its runnable config lives in the
code-lab catalog keyed by the milestone id, so all `/api/code/*` routes work
unchanged. Two milestones use this initially: `csv-table-summarizer.m1` (strings)
and `maze-route-planner.m2` (BFS).

- The capstone view renders the Code Lab plus an execution-mode label and a note
  about switching to Codespaces for larger, multi-file work.
- `canMarkMilestoneComplete` gates completion: an in-app milestone needs its
  visible tests passing (with a clear reason when blocked); a reflection-verified
  milestone needs a saved reflection. Codespaces/manual milestones keep their
  existing behavior. No multi-file in-browser project support.

## Debugging skill lane (Phase 3.7)

The existing `cpp.tooling.*` skills (debugging, debugging_method, sanitizers,
warnings, testing) form a debugging/tooling lane that teaches reading the **first**
compiler diagnostic, ignoring cascades, fixing includes/declarations/types,
interpreting failing tests, and reading sanitizer reports — **not** a real
debugger. Two of its items are code-capable via Code Lab metadata:

- `cpp.tooling.debugging_method.code_first_diagnostic` — starter has a missing
  semicolon; on the real runner the #412 classifier tags `cpp.compile.syntax`.
- `cpp.tooling.sanitizers.code_asan_report` — starter reads out of bounds; the
  runtime classifier tags `cpp.vector.out_of_bounds` from the ASan report.

These reuse existing stable skill IDs and add **no** new skills/migrations, so the
TS seed and DB stay in parity. See ADR 0004.

## Adaptive scaffold selector (Phase 3.6)

A deterministic selector (`src/features/recommendations/scaffold-selector.ts`)
recommends the next practice **level** (worked example → completion → Parsons →
code reading → bug spotting → Code Lab → review → project milestone) from mastery
status, recent error tags (#412), and item availability. Due FSRS reviews still
rank first; the selector only orders non-review next practice. Every
recommendation explains *why* and never hard-locks (falls back to the nearest
available level). The Code Lab shows it after a run/test when no error-pattern
remediation is present; see ADR 0004.

## Error-pattern remediation (Phase 3.5)

After a failing run/test, the Code Lab can show **one** explainable, **dismissible**
remediation recommendation (#414) built from the deterministic error tags (#412):

- Transparent rules (`error-remediation-rules.ts`) map a tag to an action
  (boundary checklist, AI trace, completion/Parsons item, review, or retry) with a
  learner-facing title/reason.
- **Priority** comes from the evidence: a repeated deterministic medium/high tag →
  high; one high-confidence deterministic tag on the current attempt → medium;
  an AI-only weak tag → low. Unknown/noisy tags produce **no** recommendation.
- It **never hard-locks** — always dismissible — and `use_boundary_checklist`
  auto-expands the checklist.
- `mergeCodeRemediationIntoDailyPlan` can fold the suggestion into the daily plan
  as a `remediation` card **after** due FSRS reviews (never displacing them).
- No mastery-scoring change and no opaque ML; no AI-generated items.

## Prediction-before-run (Phase 3.4)

A Code Lab item can ask the learner to **predict before running** (form a mental
model first). It is **AI-free** and **off by default** — normal Run/Test is
unaffected unless an item sets `predictionMode`:

- `"off"` (default), `"optional"` (prompts shown, never blocks), or
  `"required_before_run"` (Run/Test disabled until required prompts are filled).
- Prompts default from item shape/skills (`getDefaultPredictionPrompts`) or can be
  set explicitly via `predictionPrompts`.
- After Run/Test, **stdout** and **failing-test** predictions are compared to the
  actual result (`prediction-comparison.ts`); other kinds (loop invariant,
  complexity, first variable change) show reflective feedback.
- `prediction-evidence.ts` produces skill-event *drafts* (`code_prediction_*`) for
  later phases — **no mastery-scoring change** and no event wiring in this phase.

## Deterministic error tagging (Phase 3.3)

Run/Test results carry **deterministic** error-tag classifications (#412) derived
from real compiler/runtime/test output — **not AI**. Common cases are mapped to
stable `CodeErrorTag` values: missing `;`, undeclared name, missing include, type
mismatch, missing return (compiler); ASan/UBSan/segfault out-of-bounds (runtime);
and skill-aware visible-test failures (binary-search boundary, graph visited, DP
base case, array off-by-one). The `CodeErrorTagPanel` shows tag + source +
confidence + explanation under the output and test panels.

- Classifiers are pattern-based and **never throw** on unrecognised output.
- Deterministic tags outrank AI tags; AI tags from #410 remain **weak evidence**.
- `code-attempt-evidence.ts` provides skill-event *drafts* for later
  remediation/mastery phases — this phase makes **no mastery-scoring change** and
  does not persist tags.

## Boundary-case checklists (Phase 3.2)

A Code Lab item can show a collapsible **boundary-case checklist** of edge cases
to test (e.g. empty input, one element, target before first, lo/hi always
shrink). It is **AI-free** and does **not** affect mastery scoring — items are
strategy hints, not grading criteria.

- Checklists resolve from the item's `skillTags` and any explicit
  `boundaryChecklistIds` (supplement, de-duplicated); set
  `boundaryChecklistsEnabled: false` to hide them. Data lives in
  `boundary-checklist-data.ts` (keep the curated set small).
- An item with `sampleInput` offers a **Use as stdin** button.
- When structured AI feedback (#410) recommends
  `nextAction: try_boundary_case_checklist`, the panel auto-expands.

## Hidden tests

Visible tests may show their stdin/expected output. Hidden tests live in the
server-only `code-lab-hidden-tests.ts` module (never imported by client code) and
are summarised as a passed/total count — their inputs and expected outputs are
never sent to the browser.

## Attempt storage

When Supabase is configured and the learner is signed in, each run/test/review is
recorded best-effort in `public.code_lab_attempts` (RLS: a learner can read and
insert only their own rows). Run/Test still work signed-out and pre-migration.

## Adding a code-capable item

1. Add an entry to `codeLabConfigs` keyed by the learning-item id with
   `enabled`, `starterCode`, `mode`, optional `prompt`, `visibleTests`, and an
   optional `hiddenTestCount`.
2. Add any hidden cases for that id to `code-lab-hidden-tests.ts`.
3. The item now renders a Code Lab automatically.

## Files

- `src/features/code-lab/` — types, defaults, runner adapter/selection, services
  (run/test, review, attempts), client fetch wrappers, and UI components.
- `app/api/code/{run,test,review}/route.ts` — server route handlers.
- `supabase/migrations/20260621120000_create_code_lab_attempts.sql` — attempt
  table + RLS.
