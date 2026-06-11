# cppFan Profile and Onboarding Patch Manifest

Apply this zip at the repo root and overwrite files.

## Assumption

Apply this after the Supabase Auth patch.

## Files changed or added

- `supabase/migrations/20260611113000_create_profiles.sql`
- `src/lib/auth/redirect.ts`
- `src/features/profile/profile-actions.ts`
- `src/features/profile/profile-constants.ts`
- `src/features/profile/profile-form.tsx`
- `src/features/profile/profile-queries.ts`
- `src/features/profile/profile-types.ts`
- `app/onboarding/page.tsx`
- `app/profile/page.tsx`
- `app/dashboard/page.tsx`
- `tests/e2e/onboarding.spec.ts`
- `tests/e2e/landing.spec.ts`
- `README.md`
- `docs/PROFILE_ONBOARDING.md`
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

## Supabase manual step

Apply:

```text
supabase/migrations/20260611113000_create_profiles.sql
```

in Supabase SQL Editor or via Supabase CLI.

## Next feature after this patch

Add skill map database and seed content.
