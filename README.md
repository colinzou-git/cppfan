# cppFan

cppFan is an adaptive web app for learning C++, data structures, and algorithms through short lessons, immediate practice, FSRS-based review scheduling, skill event logging, and mastery tracking.

## Current status

This scaffold now includes the first auth/profile-ready web app foundation:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible component setup
- Supabase browser/server clients
- Supabase session refresh through Next.js `proxy.ts`
- Google OAuth login UI
- Passwordless email magic-link login UI
- Auth callback route
- Protected dashboard placeholder with sign-out
- Profile and onboarding flow
- `profiles` table migration with RLS
- Skill map data layer: `skills` and `skill_prerequisites` migration with RLS
- C++ skill seed (structs/classes, constructors, RAII, smart pointers) mirrored in TypeScript
- Read-only dashboard skill map preview with database-to-seed fallback
- Learning item data layer: `learning_items`, `learning_item_skills`, `learning_item_choices` migration with RLS
- First C++ learning content (structs/classes and constructors modules) mirrored in a TypeScript seed
- Learning item viewer at `/learn/[itemId]`, linked from the skill map preview
- Quiz attempt flow: answer a multiple-choice item, server-side grading, retry
- `learning_item_attempts` migration with per-user RLS; attempts recorded when signed in
- FSRS review scheduling: `review_cards` + `review_logs` migration with per-user RLS
- `ts-fsrs` wrapper (`src/lib/fsrs/scheduler.ts`) and a `/review` queue with rating + reschedule
- Skill event ledger: `skill_events` migration with per-user RLS, stable event names
- Rule-based mastery scoring v1 and a dashboard skill-mastery preview
- Rule-based recommendation engine and a dashboard daily plan
- Vitest unit test setup
- Playwright end-to-end test setup
- GitHub Actions CI
- Mobile-first landing page

The full initial learning loop is in place: skill map → learning items → quiz attempts
with grading → FSRS reviews → skill event ledger → rule-based mastery → a daily plan that
recommends what to do next. Mastery and recommendations are rule-based (no ML), and
mastery stays separate from FSRS card state. Code execution is still intentionally out of
scope.

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
pnpm verify:codespace    # install/check/build, optional DB migration, optional e2e
pnpm verify:e2e          # installs required browsers, then runs Playwright e2e
pnpm db:migrate          # apply all database migrations (needs SUPABASE_DB_URL secret)
```

`pnpm verify` mirrors the CI "App checks" gate, so a clean run locally means CI should
pass too. Run `pnpm verify:codespace` when you want the single Codespace health check: it
installs dependencies, runs lint/typecheck/unit/build, applies migrations if
`SUPABASE_DB_URL` is present, and prints the live Supabase smoke checks that still need a
browser/session. Set `RUN_E2E=1` to include the Playwright suite:

```bash
RUN_E2E=1 pnpm verify:codespace
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

## Supabase setup

The scaffold is safe to run without Supabase environment variables. Auth and onboarding pages will show setup guidance until these are configured:

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

Each migration can also be pasted into the Supabase **SQL Editor** and run in this order:

```text
supabase/migrations/20260611113000_create_profiles.sql
supabase/migrations/20260612011000_create_skill_map.sql
supabase/migrations/20260612120000_create_learning_items.sql
supabase/migrations/20260613090000_create_learning_item_attempts.sql
supabase/migrations/20260613100000_create_review_cards.sql
supabase/migrations/20260613110000_create_skill_events.sql
supabase/migrations/20260613120000_harden_learning_item_choices.sql
supabase/migrations/20260613130000_seed_constructors_items.sql
```

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
grading when it is unavailable, so grading works offline and pre-migration. (The column
lockdown's effect must be confirmed against the live database, since CI does not run
migrations.)

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
