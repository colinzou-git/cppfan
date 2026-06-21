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

1. **#407 — Phase 1 Code Lab** — **DONE**: PR #409 → `e95cad6`; closed w/ audit.
2. **#408 — Phase 2 AI trace** — **DONE**: PR #419 → `ca5a191`; closed w/ audit.
3. **Phase 3 wave (#410–#418)** — new; work in phase order. #410 (structured AI
   feedback + stable error-tag schema) is the foundation many others build on:
   - #410 Phase 3.1 Structured Code Lab AI feedback + error-tag schema — **DONE**:
     PR #420 → `c1520a5`; closed with final audit.
   - #411 3.2 Boundary-case checklist — **PR OPEN** (`feat/code-lab-phase3-2`):
     new `boundary-checklist-{types,data,service,state}` + panel; resolves from
     skillTags + `boundaryChecklistIds`; AI-free; auto-expands on
     `try_boundary_case_checklist`. 840 unit tests pass; e2e chromium green.
   - #412 3.3 Deterministic error tagging MVP (depends on #410 schema)
   - #413 3.4 Prediction-before-run mode
   - #414 3.5 Error-pattern remediation recommendations (depends on tagging)
   - #415 3.6 Adaptive scaffold selector
   - #416 3.7 Debugging skill lane
   - #417 3.8 Cross-context mastery rules
   - #418 3.9 Code Lab in capstone milestones
   Read each issue body before starting; respect stated dependencies.

## Current state

- **#408 Phase 2 (AI trace)** — implemented on `feat/code-lab-phase2`; PR opened.
  - Added: `code-trace-types.ts`, `code-trace-prompts.ts`, `code-trace-service.ts`,
    `trace-controls.tsx`, `ai-trace-panel.tsx`, `app/api/code/trace/route.ts`.
  - Updated: `code-lab.tsx` (Trace control + input selector + panel),
    `code-lab-client.ts` (`traceCodeRequest`). Trace shows unless
    `traceEnabled: false`; degrades to unavailable when no AI provider.
  - Reuses `completeAiResponse`; compile errors explained as blockers (no fake
    runtime steps); disclaimer on every successful trace; route resolves only
    VISIBLE test data so hidden I/O never reaches the prompt/response.
  - Local: lint/typecheck/build green; **812 unit tests pass**; e2e green —
    phase 1 9/9 and trace 3/3 across chromium/iphone/ipad.
  - Next: wait for App checks green on the #408 PR, then auto-merge and close
    #408 with a final audit.

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
