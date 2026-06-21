# cppFan

cppFan is an adaptive web app for learning C++, data structures, and algorithms through short lessons, immediate practice, FSRS-based review scheduling, skill event logging, and mastery tracking.

## Current status

cppFan is a working adaptive learning app, not a scaffold. The full learning loop is in
place — skill map → learning items → quiz attempts with server-side grading → FSRS reviews
→ skill event ledger → rule-based mastery → a daily plan that recommends what to do next.
Mastery and recommendations are rule-based (no ML) and stay separate from FSRS card state.
Arbitrary code execution stays off the web server by design; write-code practice runs in
Codespaces (see "Write-code exercises").

### Platform

- Next.js App Router + TypeScript, Tailwind, shadcn/ui-compatible components
- Supabase browser/server clients with session refresh via `proxy.ts`
- Google OAuth + passwordless magic-link login, auth callback, profile/onboarding flow
- Per-user data (`profiles`, `learning_item_attempts`, `review_cards`, `review_logs`,
  `skill_events`) protected by RLS; shared curriculum tables (`skills`,
  `skill_prerequisites`, `learning_items`, `learning_item_skills`,
  `learning_item_choices`) are read-only to anon/authenticated
- Answer keys hardened: `learning_item_choices.is_correct` is not client-readable; grading
  runs server-side via the `grade_learning_item_choice` `SECURITY DEFINER` RPC
- FSRS scheduling (`ts-fsrs` wrapper in `src/lib/fsrs/scheduler.ts`) and a `/review` queue
- Mobile-first UI across Windows PC, iPhone, and iPad viewports

### Curriculum

The curriculum spans the full roadmap (#65), each module mirrored in Supabase migrations
**and** the TypeScript seed for signed-out/offline/pre-migration fallback:

- **C++:** program basics, values/types, control flow, functions, references/pointers/const,
  structs & classes, constructors, value semantics, RAII, smart pointers, STL containers,
  templates/concepts/ranges, tooling (testing/debugging/build), object-oriented design,
  concurrency, and utility libraries (file I/O, chrono, random, variant)
- **DSA:** complexity, arrays, searching, sorting, stacks/queues, hashing, recursion,
  trees/heaps/DSU, graphs, algorithmic techniques (prefix sums/sliding window/greedy/DP),
  string algorithms, and math (bit manipulation/number theory/combinatorics/geometry)
- Curated external resource catalog at `/resources` and a guided project-lab catalog at `/labs`
- Design landed (ADRs / docs) for adaptive practice & Parsons (#72), placement &
  remediation (#73), and sequenced capstones (#82); a first write-code exercise workflow
  (#81) ships under `exercises/`

### CI and tests

GitHub Actions runs these jobs on every PR:

- **App checks** — `pnpm verify` (lint + typecheck + Vitest unit tests + build) plus
  Playwright e2e. Unit tests validate the **TypeScript seed** (the signed-out/offline
  fallback) and app logic.
- **DB migrations** — spins up Postgres, applies **every** migration in
  `supabase/migrations/` in order, and smoke-tests the grading RPC and answer-key column
  permissions (`scripts/ci/`).
- **Authenticated integration** (#96) — starts a **disposable local Supabase stack**
  (`supabase start`), creates two real authenticated learners, and runs the full
  learn → grade → attempt → review → rate → event loop, proving cross-user and anonymous
  RLS denial, that answer keys are not client-readable, and that grading is
  database-authoritative. Uses the local stack's well-known dev keys — **no production
  credential**.

To run the authenticated integration suite locally or in a Codespace (needs Docker and
the [Supabase CLI](https://supabase.com/docs/guides/cli)):

```bash
supabase start
eval "$(supabase status -o env \
  --override-name api.url=SUPABASE_URL \
  --override-name auth.anon_key=SUPABASE_ANON_KEY \
  --override-name auth.service_role_key=SUPABASE_SERVICE_ROLE_KEY)"
export SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY
pnpm test:integration
supabase stop
```

The suite self-skips when the `SUPABASE_*` variables are unset, so `pnpm test` and
`pnpm verify:codespace` remain green without a running stack.

## Requirements

- Node.js 22 LTS or newer recommended
- pnpm 10 or newer
- A Supabase project when you are ready to configure auth/profile persistence

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Develop from a browser (Codespaces / iPhone)

The repo ships a `.devcontainer` so you can do real terminal work without a local
machine — useful from an iPhone. Open the repo in a GitHub Codespace (mobile Safari or
the GitHub app) and the container comes up with Node 22, pnpm 10, the GitHub CLI, and the
Supabase CLI, with dependencies installed. Then:

```bash
pnpm dev                 # port 3000 is auto-forwarded
pnpm verify              # lint + typecheck + test + build (the CI gate, one command)
pnpm verify:codespace    # install/check/build, optional DB migration, e2e by default
pnpm verify:e2e          # installs required browsers, then runs Playwright e2e
pnpm db:migrate          # apply all database migrations (needs SUPABASE_DB_URL secret)
pnpm db:verify           # verify the live answer-key hardening via the anon REST API
```

`pnpm verify` mirrors the CI "App checks" gate, so a clean run locally means CI should
pass too. Run `pnpm verify:codespace` when you want the single Codespace health check: it
installs dependencies, runs lint/typecheck/unit/build, applies migrations if
`SUPABASE_DB_URL` is present, runs Playwright e2e by default, and prints the live
Supabase smoke checks that still need a browser/session.

If you want to skip Playwright for a faster run:

```bash
SKIP_E2E=1 pnpm verify:codespace
```

Run `pnpm verify:e2e` when you only need the end-to-end suite; it installs the required
Playwright browsers first.

Apply database changes with `pnpm db:migrate` — a single command that runs every
migration idempotently. It needs a `SUPABASE_DB_URL` Codespace secret; see
"Database setup" below.

## Validation commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

For Playwright on a new machine, install browsers first:

```bash
pnpm exec playwright install
```

## Documentation

This README is the canonical setup and operations entry point. Focused docs:

- Auth setup: [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md)
- AI Chat setup, privacy, dictation, and operations: [docs/AI_CHAT.md](docs/AI_CHAT.md)
- Database migrations: "Database setup" below (`pnpm db:migrate`)
- Codespaces / iPhone workflow: "Develop from a browser" above
- Write-code exercises: [docs/WRITE_CODE_EXERCISES.md](docs/WRITE_CODE_EXERCISES.md)
- In-app C++ Code Lab (editor, runner, tests, AI review): [docs/CODE_LAB.md](docs/CODE_LAB.md)
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · skill engine: [docs/SKILL_ENGINE.md](docs/SKILL_ENGINE.md) · events: [docs/EVENT_SCHEMA_STABLE_NAMES.md](docs/EVENT_SCHEMA_STABLE_NAMES.md)
- End-to-end tests: [docs/PLAYWRIGHT_E2E.md](docs/PLAYWRIGHT_E2E.md)

## Supabase setup

The app is safe to run without Supabase environment variables. Auth and onboarding pages will show setup guidance until these are configured:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Legacy projects can also use:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The code prefers `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Database setup

### One command (recommended)

All database migrations are applied with a single command — the only manual database
step you need:

```bash
pnpm db:migrate
```

It runs every file in `supabase/migrations/` in order via `psql`. The migrations are
idempotent, so it is safe to re-run and it always brings the database up to date
(including new migrations as they are added). It needs a `SUPABASE_DB_URL` environment
variable — the Postgres connection string from **Supabase → Project Settings → Database →
Connection string → URI**.

In a GitHub Codespace, add it once as a Codespace secret (repo **Settings → Secrets and
variables → Codespaces → New repository secret**, name `SUPABASE_DB_URL`), reopen the
terminal, then run `pnpm db:migrate`. (`psql` ships in the devcontainer; the script also
installs it on demand.)

> Convention: manual operational steps for this project funnel through scripts so there
> is a single command to run from a Codespace. Database changes go through `pnpm db:migrate`.

### Manual alternative

If you can't use `pnpm db:migrate`, paste each file from `supabase/migrations/` into the
Supabase **SQL Editor** and run them in **ascending filename order** — the timestamp prefix
(`YYYYMMDDHHMMSS_*.sql`) is the apply order. Every migration is idempotent, so re-running is
safe.

There is no hand-maintained list to keep in sync: the `supabase/migrations/` directory is
the source of truth. List the files in apply order with:

```bash
ls supabase/migrations
```

CI's **DB migrations** job applies every file in this directory to a fresh Postgres on each
PR, so the full set is always validated.

The `profiles` migration adds:

```text
public.profiles
```

It stores one row per authenticated user and uses RLS so each learner can only read, insert, and update their own profile.

The skill map migration adds:

```text
public.skills
public.skill_prerequisites
```

These hold shared curriculum content (not per-user data). RLS is enabled and grants
read-only access to anonymous and authenticated users; writes are reserved for
service-role/admin tooling. The migration also seeds the first C++ modules and is
idempotent (safe to re-run) thanks to `on conflict` upserts.

The dashboard skill map preview falls back to the bundled TypeScript seed
(`src/features/skills/skill-seed.ts`) until this migration is applied, so the preview
renders even before the database has the tables.

The learning item migration adds:

```text
public.learning_items
public.learning_item_skills
public.learning_item_choices
```

These also hold shared curriculum content with read-only RLS for anon/authenticated
users, and seed the first C++ module (structs/classes). The migration is idempotent.
`learning_item_choices.is_correct` is the answer key: the client display query never
selects it, and grading runs server-side. The `/learn/[itemId]` viewer falls back to the
bundled seed (`src/features/learning-items/learning-item-seed.ts`) until this migration
is applied.

The learning item attempt migration adds:

```text
public.learning_item_attempts
```

This is **per-user data**: RLS lets a learner select and insert only their own attempts
(`auth.uid() = user_id`), with no update/delete (a retry is a new row). Grading happens
in the `submitAnswer` server action — it works even when signed out or pre-migration
(grading against the seed), and records an attempt only when the learner is signed in.

The answer key is hardened: a later migration revokes column-level read access to
`is_correct` for `anon`/`authenticated` (display columns stay readable) and adds a
`SECURITY DEFINER` function `grade_learning_item_choice(...)` that grades server-side
without exposing the column. `submitAnswer` prefers this RPC and falls back to seed-based
grading when it is unavailable, so grading works offline and pre-migration. CI's **DB
migrations** job applies this migration and smoke-tests both the grading RPC and the
`is_correct` column lockdown on a fresh Postgres; `pnpm db:verify` additionally confirms the
lockdown against the live deployed database over the anon REST API.

The review scheduling migration adds:

```text
public.review_cards
public.review_logs
```

These are per-user data with RLS scoped to `auth.uid() = user_id`. Review cards are
upserted and rescheduled by the app; review logs are append-only evidence. Until this
migration is applied, the `/review` page shows an empty/pre-migration state and grading
still works from the learning-item seed.

The skill event migration adds:

```text
public.skill_events
```

This append-only event ledger records learning and review evidence using stable event
names from `docs/EVENT_SCHEMA_STABLE_NAMES.md`. It powers the rule-based mastery preview
on the dashboard. Until applied, event recording no-ops and the dashboard shows an empty
state.

## Environment variables

Create `.env.local` from `.env.example` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

For local DB migration from a Codespace, set `SUPABASE_DB_URL` as a Codespaces secret,
not in `.env.local`.

## Deployment

The app is a standard Next.js app and can be deployed to Vercel. Configure the same
public Supabase environment variables in the hosting provider.
