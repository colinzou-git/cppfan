# Next App Scaffold Notes

This scaffold implements roadmap items 002 through 004:

1. Scaffold Next.js + Supabase app.
2. Configure Supabase Auth with Google and email login.
3. Add profile and onboarding.

## Included

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible setup
- Supabase browser/server clients
- Supabase session refresh through root `proxy.ts`
- Landing page
- Dashboard placeholder
- Login page with Google OAuth and email magic link
- Auth callback route
- Dashboard sign-out
- Profile and onboarding flow
- Profile migration with RLS
- Vitest setup
- Playwright setup
- GitHub Actions CI
- README setup steps

## Intentionally not included

- Skill map database
- Learning content database
- FSRS integration
- Skill event database
- Mastery scoring implementation
- Billing, teams, admin, or SaaS extras

## Next recommended PR

Add skill map database and seed content.

Allowed edit zones for next PR should include:

- `supabase/migrations/**`
- `src/features/skills/**`
- `app/dashboard/**`
- `docs/SKILL_ENGINE.md`
- `tests/unit/**`
- `tests/e2e/**`
- `README.md`
- relevant docs
