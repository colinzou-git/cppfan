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
- [ ] **Slice 3 — Exercises 'Code' button.** Strategy: add Code Lab configs for
  exercises that can run in-app (or link only those that have one; flag the rest).
  Needs design — record approach here before building.
- [ ] **Slice 4 — Interview coding 'Code' button.** Same config strategy for
  interview coding questions surfaced by the session runner.

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
