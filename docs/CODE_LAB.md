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
