# Playwright E2E Notes

See [`TEST_ENVIRONMENTS.md`](TEST_ENVIRONMENTS.md) before choosing between the
public and authenticated browser suites.

The E2E suite is a small smoke suite that verifies cppFan works on:

- desktop Chromium
- iPhone viewport
- iPad viewport
- wide desktop (27-inch-like) viewport

The `wide-desktop` project uses a 1920x1080 viewport to catch regressions in
27-inch-monitor layouts (#433). The `tests/e2e/wide-layout.spec.ts` smoke suite
runs only in that project and asserts stable bounding-box relationships (e.g. the
right rail is to the right of the main column, cards share a row), not
pixel-perfect screenshots.

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

## Authenticated Supabase Flow

Backend-dependent browser tests use one canonical command:

```bash
pnpm test:e2e:authenticated
```

The command reuses a running local Supabase stack or starts a disposable one,
exports the generated local URL/anon/service-role values, runs every
`tests/e2e/authenticated-*.spec.ts` on Chromium, iPhone, and iPad, then stops the
stack only when it started it. It refuses non-local Supabase URLs and never needs
production credentials.

Use `pnpm test:e2e` for signed-out/catalog/local-fallback browser coverage. Use
`pnpm test:e2e:authenticated` for real Auth, persistence, RPC, and owner-scoped
workflow coverage.

To run a focused authenticated spec or project while retaining automatic backend
setup, pass Playwright arguments through the script:

```bash
pnpm test:e2e:authenticated -- \
  tests/e2e/authenticated-my-content-kinds.spec.ts \
  --project=chromium
```

CI calls the same package command in the `Authenticated integration` job. Adding
a correctly named `authenticated-*.spec.ts` requires no workflow edit.
