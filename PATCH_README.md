# cppFan Playwright runner fix

This patch fixes the case where all E2E assertions pass, but the command exits with code 1 because a Playwright worker process does not exit cleanly on Windows.

## Files changed

- `playwright.config.ts`
- `docs/PLAYWRIGHT_E2E.md`

## Key changes

- `workers: 1`
- `fullyParallel: false`
- `video: "off"`
- local trace disabled
- web server uses `pnpm build && pnpm start` instead of `pnpm dev`
- `NEXT_TELEMETRY_DISABLED=1` for the E2E server

## Apply

Unzip at the repo root and overwrite files.

Then run:

```powershell
pnpm test:e2e
```

A full check is:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```
