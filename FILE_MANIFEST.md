# cppFan App Scaffold File Manifest

Unzip this package at the root of `colinzou-git/cppfan`, review the changes, then push to `main`.

## New or replaced root files

- `package.json`
- `tsconfig.json`
- `next-env.d.ts`
- `next.config.ts`
- `eslint.config.mjs`
- `postcss.config.mjs`
- `components.json`
- `.env.example`
- `.gitignore`
- `.prettierrc.json`
- `README.md`
- `vitest.config.ts`
- `vitest.setup.ts`
- `playwright.config.ts`

## App files

- `app/layout.tsx`
- `app/providers.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/dashboard/page.tsx`
- `app/login/page.tsx`
- `app/auth/callback/route.ts`
- `app/not-found.tsx`

## Components and source files

- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/learning-loop-diagram.tsx`
- `src/lib/utils.ts`
- `src/lib/supabase/env.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/features/dashboard/use-dashboard-store.ts`
- `src/features/review/review-machine.ts`
- `src/features/learning/learning-loop.ts`

## Tests

- `tests/unit/learning-loop.test.ts`
- `tests/e2e/landing.spec.ts`

## CI and docs

- `.github/workflows/ci.yml`
- `docs/SKILL_ENGINE.md`
- `docs/NEXT_APP_SCAFFOLD.md`
- `public/manifest.webmanifest`
- `public/README.md`

## Commands to run after unzipping

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install
pnpm test:e2e
```
