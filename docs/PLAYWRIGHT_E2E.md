# Playwright E2E Notes

The E2E suite is a small smoke suite that verifies cppFan works on:

- desktop Chromium
- iPhone viewport
- iPad viewport

## Why the runner is conservative

On Windows, the suite previously showed all tests passing but still returned exit code 1 because a Playwright worker process did not exit cleanly after the test stop phase.

The current config avoids that by:

- running one worker at a time
- disabling video capture
- disabling local traces unless running in CI retry mode
- using `pnpm build && pnpm start` instead of `pnpm dev`
- disabling Next telemetry during the Playwright web server

This is slower than full parallel mode, but more stable for a small scaffold smoke suite.

## Run

```powershell
pnpm test:e2e
```

The Playwright web server command builds and starts the production Next.js server automatically.
