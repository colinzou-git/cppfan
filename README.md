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
- Read-only learning item viewer at `/learn/[itemId]`, linked from the skill map preview
- Vitest unit test setup
- Playwright end-to-end test setup
- GitHub Actions CI
- Mobile-first landing page

Learning content is read-only so far and intentionally does **not** implement quiz
attempts, grading history, FSRS, review cards, mastery scoring, or code execution yet.
The next feature is the quiz attempt flow and basic grading — still not FSRS.

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
supabase --version       # ready for migration work
```

`pnpm verify` mirrors the CI "App checks" gate, so a clean run locally means CI should
pass too. Run `pnpm verify:e2e` when you also need the end-to-end suite (it downloads
Chromium and WebKit first).

Applying a migration from a Codespace still requires `supabase login` and
`supabase link --project-ref <ref>` (DB password). For a one-off migration, the Supabase
SQL Editor in the browser is often less friction — see "Database setup" below.

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

Apply these migrations in order. Each can be applied through either the Supabase
SQL Editor (paste and run the SQL) or the Supabase CLI migration flow.

```text
supabase/migrations/20260611113000_create_profiles.sql
supabase/migrations/20260612011000_create_skill_map.sql
supabase/migrations/20260612120000_create_learning_items.sql
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
selects it, and grading runs server-side (added with the quiz attempt feature). The
`/learn/[itemId]` viewer falls back to the bundled seed
(`src/features/learning-items/learning-item-seed.ts`) until this migration is applied.

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

The skill map and the first learning-item content layer are now implemented as
read-only data layers with a dashboard preview and a `/learn/[itemId]` viewer. The next
feature is the quiz attempt flow and basic grading:

```text
Add quiz attempt flow and basic grading
```

Non-goals for the next step:

- Do not implement FSRS yet.
- Do not implement review cards yet.
- Do not implement the full recommendation engine or mastery scoring yet.
