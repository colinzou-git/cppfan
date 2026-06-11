# cppFan

cppFan is an adaptive web app for learning C++, data structures, and algorithms through short lessons, immediate practice, FSRS-based review scheduling, skill event logging, and mastery tracking.

## Current status

This scaffold adds the first real web app foundation:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible component setup
- Supabase auth/client placeholders
- Protected dashboard placeholder
- Vitest unit test setup
- Playwright end-to-end test setup
- GitHub Actions CI
- Mobile-first landing page

Learning features are intentionally not implemented yet. The next feature should be Supabase Auth with Google/email login.

## Requirements

- Node.js 22 LTS or newer recommended
- pnpm 10 or newer
- A Supabase project when you are ready to configure auth

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

The scaffold is safe to run without Supabase environment variables. Auth-related pages will show setup guidance until these are configured:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

When configuring Supabase later:

1. Create a Supabase project.
2. Enable Google login if desired.
3. Add local redirect URL:
   - `http://localhost:3000/auth/callback`
4. Add production redirect URL after deployment:
   - `https://YOUR_DOMAIN/auth/callback`
5. Copy project URL and anon key into `.env.local`.

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
- `specs/000-ai-dev-foundation/spec.md`

## Next recommended GitHub issue

Work on roadmap item 003:

```text
Configure Supabase Auth with Google and email login
```

Non-goals for the next step:

- Do not implement learning features yet.
- Do not implement FSRS yet.
- Do not create learning database tables yet.
