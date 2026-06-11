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
- Vitest unit test setup
- Playwright end-to-end test setup
- GitHub Actions CI
- Mobile-first landing page

Learning features are intentionally not implemented yet. The next feature should be the skill map database and seed content.

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

Apply this migration before testing real onboarding persistence:

```text
supabase/migrations/20260611113000_create_profiles.sql
```

You can apply it through either:

1. Supabase SQL Editor: paste and run the SQL.
2. Supabase CLI migration flow.

The table added is:

```text
public.profiles
```

It stores one row per authenticated user and uses RLS so each learner can only read, insert, and update their own profile.

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

Work on roadmap item 005:

```text
Add skill map database and seed content
```

Non-goals for the next step:

- Do not implement FSRS yet.
- Do not implement quiz attempts yet.
- Do not implement the full recommendation engine yet.
