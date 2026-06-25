# cppFan GDB debugger service (#442)

A small, OVH-hosted HTTP service that compiles and debugs untrusted C++ with
`g++ -g -O0` + `gdb --interpreter=mi2` in an isolated, network-less sandbox. The
cppFan Next.js app **proxies** to it through `app/api/code/debug/*`; the browser
never reaches this service directly and never receives its API key.

This runs on the **same OVH environment family as Judge0** (the existing code
runner). It is intentionally a separate deployable from the Next app.

## Status

This package currently contains the pure, unit-tested core:

- `src/gdb-mi-parser.ts` — parse GDB/MI records (stop reason, frame, stack,
  variables, console/error streams).
- `src/output-buffer.ts` — byte-capped stdout/stderr buffer.
- `src/security.ts` — sandbox limits + start-payload validation.

The runtime (`server.ts`, `session-manager.ts`, `gdb-mi-session.ts`) and the
container (`Dockerfile`, `docker-compose.yml`) land in the next slice. Deploying
the built image to OVH is a manual operations step (it needs the OVH host and a
`gdb`/`g++` toolchain), so the full end-to-end debugger is **code-complete here
but not live until that deploy**.

## Endpoints (planned)

| Method | Path | Purpose |
|--------|------|---------|
| GET  | `/health`       | liveness |
| POST | `/debug/start`  | compile + launch under gdb, return first stopped snapshot |
| POST | `/debug/action` | continue / pause / step over/into/out / restart |
| POST | `/debug/stop`   | kill the inferior + gdb, delete the workspace |

All POST requests authenticate with a bearer token equal to the app's
`CODE_DEBUGGER_API_KEY`.

## Sandbox limits

See `src/security.ts` (`DEBUG_LIMITS`): 10s compile, 5min wall, 2min idle, 256MB
memory, 64 processes, 64KB output, 20 breakpoints, 20 watches, 500 steps. The
debugged program gets no network and a temp-only workspace that is deleted on
stop.

## App configuration

The Next app enables this provider with server-only env (see
`docs/EVENT_SCHEMA.md` is unrelated; debugger envs live in the app's runtime
config):

```bash
CODE_DEBUGGER_PROVIDER=gdb-service
CODE_DEBUGGER_BASE_URL=http://<ovh-host>:3008
CODE_DEBUGGER_API_KEY=<server-side-token>
```

With `CODE_DEBUGGER_PROVIDER` unset (the normal CI configuration) the app's Debug
tab shows a friendly "not configured" state and needs no service.

## Develop

```bash
cd services/gdb-debugger
npm install
npm test       # runs the parser/buffer/security unit tests
```

The pure-core tests are also picked up by the repo-root Vitest run, so CI guards
them without a gdb toolchain.
