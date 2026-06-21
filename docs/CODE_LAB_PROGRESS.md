# Code Lab build progress (resume file)

This file is the source of truth for the autonomous Code Lab build loop so work
can resume cleanly after a usage-limit pause. Update it before stopping.

_Last updated: 2026-06-21 — by the /loop driver._

## Active loop

- Session cron `8575493c` runs every 30 min: merge green PRs, advance to the
  next open issue in dependency order, keep this file current.
- Auto-merge policy: squash-merge a `feat/*` PR once **all** required checks are
  green; then post a `## Final closure audit` and close the issue it completes.

## Issue order

1. **#407 — Phase 1 Code Lab** (editor, runner, tests, AI review) — **DONE**:
   PR #409 squash-merged to `main` (`e95cad6`); #407 closed with final audit.
2. **#408 — Phase 2 AI trace** — **IN PROGRESS** on `feat/code-lab-phase2`.

## Current state

- **#408 Phase 2 (AI trace)** — building on `feat/code-lab-phase2`.
  - New: `code-trace-types.ts`, `code-trace-prompts.ts`, `code-trace-service.ts`,
    `trace-controls.tsx`, `ai-trace-panel.tsx`, `app/api/code/trace/route.ts`.
  - Update: `code-lab.tsx` (Trace button + input selector), `code-lab-client.ts`,
    `maybe-code-lab.tsx`/catalog (`traceEnabled`, default true when AI configured).
  - Reuse `completeAiResponse`; never leak hidden test I/O; compile errors are
    explained as blockers (no fake runtime steps); disclaimer on every trace.
  - Tests: trace types/service/prompts/route + `ai-trace-panel` + e2e
    `code-lab-ai-trace.spec.ts`. Docs: extend `docs/CODE_LAB.md`.

### (history) PR #409 / #407 — merged

- **PR #409** (`feat/code-lab-phase1`) implemented all of #407 Phase 1.
  - Green: pr-declaration-check, DB migrations, Authenticated integration,
    C++ exercises, Vercel.
  - **Was red:** App checks → e2e `code-lab.spec.ts` "editing" test. Monaco
    keyboard automation drops/reorders chars; sr-only `fill` was unreliable on
    webkit.
  - **Fix:** expose the Monaco editor ref on mount (`__cppfanCodeLabEditor`) and
    drive the edit via `setValue` in the e2e. Verified locally: **9/9 pass**
    across chromium + iphone + ipad.
  - **Then App checks failed on a unit test** (`ai-chat-runtime.test.ts`): `main`
    advanced (richer AI provider config: credential/credentialSource) and left
    that test asserting the old 2-field shape — `main` itself was red. Merged
    `main` into the branch and updated the assertion. Local full suite: **795
    pass**; lint/typecheck/build green.
  - Next: wait for App checks green on commit `e742736`, then auto-merge #409.

## On merge of #409

1. Squash-merge `--delete-branch`.
2. Post `## Final closure audit` on #407 mapping each acceptance criterion to
   evidence, then close #407.
3. Start #408 (Phase 2 AI trace) on a new `feat/code-lab-phase2` branch per the
   issue body; reuse `completeAiResponse` and the existing code-lab feature
   folder; open a PR with `Completion status: partial` + `Part of #408`.

## Notes / constraints

- App router is at `app/` (not `src/app/`).
- Runner: mock is default + deterministic; Piston is the real provider (keyless).
- Closure guard: never put a close-word (close/fix/resolve) immediately before
  `#<n>` in a PR body, or the guard flags it as an unintended closing keyword.
- Local e2e may not run here (no browsers/Supabase); rely on CI for Playwright.
