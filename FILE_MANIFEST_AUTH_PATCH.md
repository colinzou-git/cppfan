# cppFan Supabase Auth Patch Manifest

Apply this zip at the repo root and overwrite files.

## Files changed or added

- `.env.example`
- `.github/workflows/ci.yml`
- `README.md`
- `proxy.ts`
- `app/auth/callback/route.ts`
- `app/dashboard/page.tsx`
- `app/login/page.tsx`
- `app/login/login-client.tsx`
- `src/lib/auth/redirect.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/env.ts`
- `src/lib/supabase/proxy.ts`
- `src/lib/supabase/server.ts`
- `tests/e2e/auth.spec.ts`
- `tests/e2e/landing.spec.ts`
- `docs/AUTH_SETUP.md`
- `docs/NEXT_APP_SCAFFOLD.md`

## After applying

Run:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Then commit and push.

## Next feature after this patch

Add profile and onboarding.
