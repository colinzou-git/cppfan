# cppFan Supabase env validation fix

This patch prevents the app from crashing when `.env.local` contains placeholder or malformed Supabase values.

## Problem

The app crashed with:

```text
Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
```

That happens when `NEXT_PUBLIC_SUPABASE_URL` is non-empty but not a real URL.

Examples that crash without this fix:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_URL=
```

## Fix

`src/lib/supabase/env.ts` now treats Supabase as configured only when:

- `NEXT_PUBLIC_SUPABASE_URL` is a valid `http://` or `https://` URL
- and either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is non-empty

## Apply

Unzip at the repo root and overwrite files.

Then restart dev server:

```powershell
Ctrl+C
pnpm dev
```

## Also fix `.env.local`

Until Supabase is ready, use blank values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=cppFan
```

When Supabase is ready, use a real URL:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_REAL_KEY
```
