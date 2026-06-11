# Next App Scaffold Notes

This scaffold implements roadmap item 002 and extends roadmap item 003: Scaffold Next.js + Supabase app, then configure Supabase Auth with Google and email login.

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
- Vitest setup
- Playwright setup
- GitHub Actions CI
- README setup steps

## Intentionally not included

- Profile database table
- Onboarding flow
- Supabase database migrations
- Learning content database
- FSRS integration
- Skill event database
- Mastery scoring implementation
- Billing, teams, admin, or SaaS extras

## Next recommended PR

Add profile and onboarding.

Allowed edit zones for next PR should include:

- `app/onboarding/**`
- `app/dashboard/**`
- `src/features/profile/**`
- `src/lib/supabase/**`
- `supabase/migrations/**`
- `.env.example`
- `tests/e2e/onboarding*.spec.ts`
- `README.md`
- relevant docs
