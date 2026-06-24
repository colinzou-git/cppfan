# Status — Code button + cross-device autosave/resume

Working status file for the in-progress feature. A `/loop` (hourly) may resume
this; read this doc first, continue the next unchecked slice, commit + push each
slice, then update this doc.

## Locked decisions (do not re-ask)

1. **'Code' button** on Labs (capstone milestones), Exercises catalog, and
   Interview coding questions — links to the full-screen `/lab/[itemId]` page.
   Only items with an in-app Code Lab config can open it; exercises and interview
   coding questions need **new editor configs** (starter code + tests), which is
   the larger part of the work.
2. **'Mark started' replaced**: on capstone milestones, clicking 'Code'
   auto-marks the milestone `started` (preserving the started→completed flow with
   reflection + Mark complete). The standalone 'Mark started' button goes away for
   in-app-lab milestones.
3. **Autosave**: in-progress editor code autosaves to a **Supabase cross-device
   drafts table** (new table + RLS migration), falling back to **localStorage**
   when signed out. Resumes the same code on any device.

## Plan (slices, in order — land each as its own commit)

- [x] **Slice 1 — Labs 'Code' button + auto-mark-started.** DONE. In
  `capstone-tracks-view.tsx`, `inAppLab` milestones show a 'Code' button
  (`capstone-milestone-code`) linking to `/lab/[milestoneId]`; clicking it
  auto-marks `started` when status is none. 'Mark started' now only renders for
  non-inAppLab milestones. Follow-up (not blocking): the `/lab` page shows a
  generic "Code Lab" title for milestone ids absent from `learning_items`, and
  the inline `CodeLabMilestone` editor still renders on the capstone page — decide
  later whether to collapse it to a preview now that a full-page path exists.
- [x] **Slice 2 — Autosave/resume foundation.** DONE. Migration
  `20260623130000_create_code_lab_drafts.sql` (one row per user+item, RLS CRUD
  own). Server `code-draft-service.ts` (load/upsert, best-effort self-skip).
  Route `app/api/code/draft/route.ts` (GET load, PUT upsert). Client
  `code-draft-client.ts`. Hook `use-code-draft.ts` (localStorage-first hydrate,
  then cross-device Supabase; debounced save; flush on unmount) wired into
  `useCodeLabController` and exposed as `draftStatus`. Save indicator
  (`code-lab-draft-status`) in the workspace. Applies to embedded + full-page
  labs. Migration deploys via the db CI job / supabase-production-migrations —
  not runnable on this host; verify in CI.
- [ ] **Slice 3 — Exercises 'Code' button.** BLOCKED on a product decision.
  Findings: exercises (`exercise-catalog.ts`, e.g. `dsa-two-sum-sorted`) are
  **repo-based, multi-file `.hpp`** exercises run via `scripts/exercises/*.sh` /
  Codespace. None has an in-app Code Lab config, and the in-app runner is
  single-file Judge0 — so `/lab/[id]` cannot run them faithfully without
  authoring a new single-file config + tests per exercise (large content effort,
  changes the exercise's nature). Options for the user:
  (a) author in-app single-file configs for a chosen subset; (b) point the
  exercise 'Code' button at the Codespace/repo flow instead of `/lab`;
  (c) skip exercises.
- [ ] **Slice 4 — Interview coding 'Code' button.** BLOCKED on a product
  decision. Findings: interview coding problems (`problem-catalog.ts`, ids like
  `iv.sliding.longest-window-under-budget`) already have their **own judge +
  submission pipeline** (`judge-client.ts`, `judge-test-suites.ts`), separate
  from the Code Lab. Routing them to `/lab` would duplicate or conflict with that
  flow. Options: (a) add a 'Code' affordance into the existing interview judge UI
  instead of `/lab`; (b) map specific interview problems to in-app Code Lab
  configs; (c) skip interview. Note: some diagnostic items are `learning_item`s
  that may already be code-capable — those could get the button cheaply.

## Decisions made (user, 2026-06-23)

- Exercises: **skip for now** (repo-based, no in-app runner).
- Interview: **add a 'Code' affordance into the existing interview judge UI**, not
  `/lab` (interview keeps its own judge pipeline). STILL TODO — needs the judge
  UI surface located in `session-runner.tsx` / interview problem flow.
- Inline capstone editor: **collapse to a read-only preview**; editing/running
  moves to `/lab`.

- [x] **Slice 5 — Collapse inline capstone editor to a preview.** DONE.
  `MilestoneCodePreview` (read-only starter-code preview) replaces the inline
  `CodeLabMilestone` (component + its unit test deleted). Completion gate
  re-based: `canMarkMilestoneComplete` accepts `hasPassingAttempt`, fed by a new
  best-effort `getPassingCodeLabItemIds` server query (passing
  `code_lab_attempts`), wired through both `/labs` and `/labs/tracks/[id]`.
  Rationale: marking complete already requires sign-in, and signed-in users run
  tests on `/lab` (attempt recorded), so no capability is lost — running just
  moves to `/lab`. e2e + gate unit tests updated.

## Remaining

- [ ] **Slice 4 — Interview 'Code' affordance** in the existing judge UI. Locate
  where interview coding problems are presented/submitted (session-runner +
  judge-client) and add a Code affordance there. Not yet started.

## Constraints / parity notes

- Dev host can't run Supabase/Docker (see memory) — migrations apply via CI
  integration job + `supabase-production-migrations` workflow; verify there, not
  locally. Code self-skips DB when unconfigured/signed-out.
- Migrations are high-risk: follow the `code_lab_attempts` migration as the
  pattern; RLS must restrict drafts to the owning user.
- Gate: `pnpm lint && pnpm typecheck && pnpm test` before each commit/push.
- Auto-deploy promotes green `main` to production, so each pushed slice deploys.

## Progress log

- (init) Decisions captured; hourly resume loop armed (cron `1cad5f65`). Starting
  Slice 1.
