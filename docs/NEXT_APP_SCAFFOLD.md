# Next App Scaffold Notes

This scaffold implements roadmap item 002: Scaffold Next.js + Supabase app.

## Included

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible setup
- Supabase browser/server placeholders
- Landing page
- Dashboard placeholder
- Login page scaffold
- Auth callback route
- Vitest setup
- Playwright setup
- GitHub Actions CI
- README setup steps

## Intentionally not included

- Real Google OAuth setup
- Email login implementation
- Supabase database migrations
- Learning content database
- FSRS integration
- Skill event database
- Mastery scoring implementation
- Billing, teams, admin, or SaaS extras

## Next recommended PR

Configure Supabase Auth with Google and email login.

Allowed edit zones for next PR should include:

- `src/lib/supabase/**`
- `app/login/**`
- `app/auth/**`
- `app/dashboard/**`
- `.env.example`
- `tests/e2e/auth*.spec.ts`
- `README.md`
- relevant docs
