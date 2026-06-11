# Supabase Auth Setup

This document describes the auth implementation added for cppFan.

## Implemented

- Supabase browser client for Client Components.
- Supabase server client for Server Components, Server Actions, and Route Handlers.
- Next.js root `proxy.ts` to refresh Supabase auth cookies.
- Google OAuth sign-in from `/login`.
- Email magic-link sign-in from `/login`.
- `/auth/callback` route to exchange the OAuth/OTP code for a Supabase session.
- `/dashboard` auth gate:
  - If Supabase is not configured, it shows scaffold guidance.
  - If Supabase is configured and no user is logged in, it redirects to `/login?next=/dashboard`.
  - If a user is logged in, it shows the signed-in learner and a sign-out button.
- Playwright auth smoke tests.

## Environment variables

Preferred:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Fallback for legacy Supabase projects:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Supabase dashboard checklist

1. Create a Supabase project.
2. Copy Project URL to `NEXT_PUBLIC_SUPABASE_URL`.
3. Copy publishable key to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Authentication → URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://127.0.0.1:3000/auth/callback`
5. Authentication → Providers:
   - Enable Email.
   - Enable Google after Google Cloud OAuth client is ready.

## Google Cloud checklist

1. Create a Google Cloud project.
2. Configure OAuth consent screen.
3. Create OAuth Client ID:
   - Application type: Web application.
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - production domain later
   - Authorized redirect URI:
     - use the callback URL shown by Supabase's Google provider page.
4. Copy Client ID and Client Secret into Supabase Authentication → Providers → Google.

## Local validation

Without Supabase env vars:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

With Supabase env vars:

```powershell
pnpm dev
```

Then open:

```text
http://localhost:3000/login
```

Manual tests:

1. Google button should redirect to Google/Supabase OAuth.
2. Email form should send a magic link.
3. Clicking the magic link should return to `/auth/callback` and then `/dashboard`.
4. Dashboard should show the signed-in learner email.
5. Sign out should return to `/login?message=signed-out`.

## Non-goals

- No profile table yet.
- No onboarding table yet.
- No learning content database yet.
- No FSRS tables yet.
- No RLS policies yet.
