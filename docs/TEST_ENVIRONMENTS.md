# cppFan Test Environments

This document is the source of truth for choosing the environment that matches
an acceptance criterion. A missing capability in one command does not mean the
repository lacks that capability.

## Selection rule

Choose the narrowest environment that exercises the real boundary under test.
Use more than one environment when a feature crosses boundaries.

| Environment | What it proves | What it does not prove | Command / CI job |
|---|---|---|---|
| Unit/component | pure logic, validation, rendering, action dispatch with mocks | real Auth, persistence, RPC, browser download/navigation | `pnpm test` |
| Public browser | production Next.js rendering, signed-out routes, catalogs, responsive behavior, local-only fallback | authenticated persistence or owner-scoped server actions | `pnpm test:e2e`; `App checks` |
| Authenticated browser | real local Auth cookies, RLS-backed reads/writes, RPCs, persisted reload behavior, downloads and cross-page workflows | production data or production provider configuration | `pnpm test:e2e:authenticated`; `Authenticated integration` |
| DB migration/smoke | migrations apply in order, constraints/RPC behavior, schema and seed parity | browser UX | `DB migrations`; `pnpm test:integration` |
| Production operator | one-time real-data reconciliation and production-only operational verification | ordinary feature correctness | explicit runbook/manual action only |

## Unit and component tests

Use for:

- parsers and schemas;
- exhaustive kind dispatch;
- deterministic learning/FSRS/mastery rules;
- React component behavior with mocked server actions;
- filename and URL generation.

Run:

```bash
pnpm test
```

Unit mocks prove local control flow. They do not replace an authenticated browser
test when the requirement includes real persistence, publishing, RLS-backed
queries, session cookies, reload behavior, or browser downloads.

## Public browser E2E

Use for pages and workflows that intentionally work without Supabase:

- public catalogs and lessons;
- signed-out auth gates;
- local-only authoring fallback;
- responsive desktop/iPhone/iPad behavior;
- accessibility and runtime-error scans.

Run:

```bash
pnpm test:e2e
```

This command intentionally does not configure Supabase. Do not use that fact to
declare an authenticated acceptance criterion blocked.

## Authenticated browser E2E

Use for:

- creating and signing in disposable learners;
- persisted drafts and reloads;
- publish/archive/restore/delete RPC workflows;
- review cards, goals, history, and interview sessions;
- owner-scoped data and RLS-backed page behavior;
- real browser downloads whose contents or filenames depend on stored records.

Run:

```bash
pnpm test:e2e:authenticated
```

The command from #629:

1. reuses or starts local Supabase;
2. reads generated local keys from `supabase status`;
3. refuses remote URLs;
4. exports server and `NEXT_PUBLIC_*` variables;
5. runs every `tests/e2e/authenticated-*.spec.ts` on Chromium, iPhone, and iPad;
6. cleans up a stack it started.

Authenticated specs should reuse:

- `hasAuthenticatedE2EEnv()`;
- `createAuthenticatedLearner()`;
- the returned `cleanup()` function in a `finally` block.

Example:

```ts
test.describe("authenticated feature", () => {
  test.skip(!hasAuthenticatedE2EEnv(), "requires disposable local Supabase");

  test("persists the workflow", async ({ page, context, baseURL }) => {
    const learner = await createAuthenticatedLearner(
      context,
      baseURL ?? "http://127.0.0.1:3000"
    );

    try {
      // Exercise the real browser workflow.
    } finally {
      await learner.cleanup();
    }
  });
});
```

Never use production Supabase credentials in an E2E specification.

## Database migration and integration validation

Use for SQL behavior that a browser test cannot isolate efficiently:

- migration ordering;
- constraints and indexes;
- RPC authority and idempotency;
- RLS matrices;
- migrated DB versus TypeScript seed parity.

The CI jobs use disposable services. Production data is not required.

## Production-only operator verification

Reserve this classification for work that inherently depends on existing real
production data or a production control plane, such as reconciling an unknown
legacy value already stored in production.

Production-only work must have:

- an explicit read-only inspection step;
- a documented operator command;
- rollback or transactional behavior;
- post-operation verification;
- issue evidence before closure.

Do not relabel ordinary Auth/persistence tests as production-only.

## Environment limitation analysis

Before deferring an acceptance criterion, provide:

```text
## Environment limitation analysis

Required capability:
Existing environments inspected:
- Unit/component:
- Public browser:
- Authenticated local Supabase:
- DB migration/integration:
- Production operator:

Why the existing disposable environment is insufficient:
Exact missing capability:
Smallest change that would enable the test:
```

If the smallest missing change is only “add this spec to the authenticated
suite,” implement it instead of deferring it.

## Examples

### My Content kind-aware publishing

- Unit/component: verify exhaustive kind-to-action dispatch.
- Authenticated browser: seed one valid draft per kind, publish from the list,
  reload, preview, and assert export filenames.
- Production: not required.

### Static exercise card layout

- Unit/component: grouped-view mapping if needed.
- Public browser: desktop/iPhone/iPad layout.
- Authenticated browser: not required unless user-specific progress is asserted.

### Production event-type reconciliation

- Unit/DB: test known mappings and rollback behavior on disposable Postgres.
- Production operator: inspect and reconcile real invalid rows.
