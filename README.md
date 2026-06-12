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
- First C++ learning content (structs/classes module) mirrored in a TypeScript seed
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
pnpm verify:e2e          # installs browsers, then runs Playwright e2e
pnpm db:migrate          # apply all database migrations (needs SUPABASE_DB_URL secret)
```

`pnpm verify` mirrors the CI "App checks" gate, so a clean run locally means CI should
pass too. Run `pnpm verify:e2e` when you also need the end-to-end suite (it downloads
Chromium and WebKit first).

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

Both are **per-user data** with RLS scoped to `auth.uid() = user_id`. Review cards are
created from eligible learning items the first time a signed-in learner opens `/review`,
and FSRS scheduling runs through the `ts-fsrs` wrapper in `src/lib/fsrs/scheduler.ts`.
Review logs are append-only (select/insert, no update/delete). Signed out or
pre-migration, `/review` shows a read-only preview of eligible items instead of a live
queue. FSRS card state is intentionally **not** the same as skill mastery (see
`docs/SKILL_ENGINE.md`).

The skill event ledger migration adds:

```text
public.skill_events
```

This is **per-user, append-only** evidence (select/insert only, RLS scoped to
`auth.uid() = user_id`) using the stable event names from
`docs/EVENT_SCHEMA_STABLE_NAMES.md`. Quiz attempts and review ratings emit events
best-effort when signed in. Mastery is derived from this ledger by the rule-based scorer
in `src/features/mastery/mastery-scoring.ts` — deterministic, explainable, and computed
**separately from FSRS card state** (a learner can have a stable review card yet still be
weak in the broader skill). The dashboard skill-mastery preview reflects this; signed out
or pre-migration it shows an explanatory empty state.

## Google OAuth setup

In Supabase:

1. Create a Supabase project.
2. Go to Authentication → Providers.
3. Enable Google.
4. Add the Google Client ID and Client Secret from Google Cloud.

In Google Cloud:

1. Create an OAuth client ID with type Web application.
2. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - your production domain later
3. Add the authorized redirect URI shown by Supabase’s Google provider page.

In Supabase Auth URL settings, add redirect URLs:

```text
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/callback
```

After deployment, also add:

```text
https://YOUR_DOMAIN/auth/callback
```

## Email magic-link setup

Supabase email magic links use `signInWithOtp`.

For local development, make sure Supabase Auth allows:

```text
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/callback
```

The login page sends magic links with:

```text
/auth/callback?next=/dashboard
```

The callback route exchanges the code for a session and redirects to the safe `next` path.

## Project docs

Keep these planning docs from the bootstrap phase:

- `CLAUDE.md`
- `docs/PROJECT_BRIEF.md`
- `docs/DEVELOPMENT_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/AI_GUARDRAILS.md`
- `docs/EVENT_SCHEMA.md`
- `docs/EVENT_SCHEMA_STABLE_NAMES.md`
- `docs/SKILL_ENGINE.md`
- `docs/ROADMAP_ISSUES.md`
- `docs/AUTH_SETUP.md`
- `docs/PROFILE_ONBOARDING.md`
- `specs/000-ai-dev-foundation/spec.md`

## Next recommended GitHub issue

The initial roadmap (issues #1–#6) is complete: skill map, learning items, quiz attempts,
FSRS reviews, the skill event ledger with rule-based mastery, and the recommendation
engine with a daily plan. The dashboard daily plan (`src/features/recommendations/`)
orders due reviews, regressed/weak skills, the next lesson, and recommended prerequisites,
explaining each suggestion.

Tracked follow-ups:

- Expand the curriculum beyond the structs/classes module (issue #16).

Done since the initial roadmap: the answer-key hardening (server-side grading RPC +
column lockdown) and the CI Node 24 action bump.

Out of scope for now: an ML mastery model and in-browser code execution.
