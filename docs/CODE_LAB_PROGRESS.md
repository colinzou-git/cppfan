# Code Lab build progress (resume file)

This file tracked the autonomous Code Lab build loop. The original roadmap is
complete; the real GDB Debug tab (#442) was added on top and is **code-complete**,
pending only the manual OVH deploy of `services/gdb-debugger`.

_Last updated: 2026-06-25 — by the /loop driver._

## Real GDB Debug tab track (#442): CODE-COMPLETE ✅ (OVH deploy pending)

| Slice | What | PR | Merge |
|---|---|---|---|
| foundation | breakpoint types + persistence hook | #449 | `981e90e` |
| debug API | unconfigured-safe routes + client + service | #450 | `38108c2` |
| hook | `useCodeDebugger` orchestration | #451 | `6d76fb0` |
| Debug tab | tab + panel (toolbar, breakpoints, snapshot) | #452 | `aa2dd1e` |
| gutter | Monaco breakpoint + current-line decorations | #453 | `f3b0e23` |
| AI explain | on-click snapshot-grounded explanation | #454 | `8339926` |
| gdb core | GDB/MI parser + output buffer + limits (tested) | #455 | `63483fb` |
| gdb runtime | session manager + gdb driver + http server + Docker | #456 | `d8c7a28` |

Debug tab lives in `CodeLabWorkspace` (`/lab/<itemId>`). `CODE_DEBUGGER_PROVIDER`
unset = friendly unconfigured state (the CI default). The OVH `services/gdb-debugger`
must be deployed and `CODE_DEBUGGER_*` set for the live debugger — a manual ops
step, so #442 stays open with a closure audit until that deploy lands.

## Desktop responsive layout track (#430–#433): COMPLETE ✅

| Issue | Slice | PR | Merge |
|---|---|---|---|
| #430 | shared `PageShell` + dashboard two-column | #434 | `0cd0c16` |
| #431 | split learning item + Code Lab on wide screens | #435 | `89fe585` |
| #432 | widen exercises/labs/goals/resources/review | #436 | `45f7864` |
| #433 | wide-desktop Playwright project + smoke suite | #437 | `24a1399` |

Layout-only; mobile-first preserved, wide layout additive at `xl`/`2xl`. Each
closed with a final audit. No open desktop-layout issues remain.

## Status: Code Lab roadmap COMPLETE ✅

| Issue | Phase | PR | Merge commit |
|---|---|---|---|
| #407 | 1 — Code Lab (editor, runner, tests, AI review) | #409 | `e95cad6` |
| #408 | 2 — AI execution trace | #419 | `ca5a191` |
| #410 | 3.1 — Structured AI feedback + error-tag schema | #420 | `c1520a5` |
| #411 | 3.2 — Boundary-case checklists | #421 | `5692da6` |
| #412 | 3.3 — Deterministic error tagging MVP | #422 | `4d3b517` |
| #413 | 3.4 — Prediction-before-run mode | #423 | `a5d5924` |
| #414 | 3.5 — Error-pattern remediation recommendations | #424 | `2a321e7` |
| #415 | 3.6 — Adaptive scaffold selector | #425 | `7ea6d35` |
| #416 | 3.7 — Debugging skill lane (code-capable) | #426 | `2921dfb` |
| #417 | 3.8 — Cross-context mastery rules | #427 | `f280452` |
| #418 | 3.9 — Code Lab in capstone milestones | #428 | `fe6469b` |

Each issue was closed with a `## Final closure audit` mapping every acceptance
criterion to evidence on `main`.

## If new issues appear

The loop (session cron `8575493c`, every 30 min) keeps checking `gh issue list`.
For any new issue it should: read the issue body + relevant specs/docs, implement
on a `feat/*` branch, run `pnpm lint/typecheck/test/build` (plus
`verify:interview-catalog`/`check:links` when content/catalog changes), open a PR
with `Completion status: partial` + `Part of #N`, auto-merge on green, then close
with a final audit.

## Notes / constraints (durable)

- App router is at `app/` (not `src/app/`).
- Code runner: `mock` is the default deterministic provider; `piston` is the real
  (keyless) provider. Mock can't surface real compile/sanitizer errors — design
  Code Lab tasks with literal/echo output so the mock can produce deterministic
  results; tie real diagnostics to the #412 classifier via tests.
- Code-capable items/milestones register their Code Lab config in
  `src/features/code-lab/code-lab-catalog.ts` keyed by item/milestone id, so all
  `/api/code/*` routes resolve them. This avoids new learning-item rows and keeps
  seed↔DB parity untouched.
- Hidden tests live in the server-only `code-lab-hidden-tests.ts`; never leak I/O.
- Monaco e2e: drive edits via the exposed `window.__cppfanCodeLabEditor` `setValue`
  (keyboard automation drops chars across browsers).
- Closure guard: never put a close-word (close/fix/resolve) immediately before
  `#<n>` in a PR body; declare `Completion status:` on PRs referencing
  completion-tracked issues.
- Local e2e runs on chromium/iphone/ipad here; CI runs the full matrix.
