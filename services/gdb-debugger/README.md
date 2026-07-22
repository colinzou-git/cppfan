# cppFan execution service — GDB debugger (#442) + interactive Terminal (#664)

A small, OVH-hosted HTTP service that compiles and runs untrusted C++ in an
isolated, network-less sandbox. It hosts two independent features:

- **GDB debugger** (#442): `g++ -g -O0` + `gdb --interpreter=mi2` stepping.
- **Interactive Terminal** (#664): compile, spawn the binary directly with piped
  stdin/stdout/stderr, keep stdin open for live `cin`/`getline` input, and stream
  an ordered transcript the app polls by cursor.

The cppFan Next.js app **proxies** to it through `app/api/code/debug/*` and
`app/api/code/terminal/*`; the browser never reaches this service directly and
never receives its API key. It runs on the **same OVH environment family as
Judge0** and is a separate deployable from the Next app. A terminal session never
invokes debug actions or vice versa.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET  | `/health`          | liveness (`sessions`, `terminals` counts) |
| POST | `/debug/start`     | compile + launch under gdb, return first stopped snapshot |
| POST | `/debug/action`    | continue / pause / step over/into/out / restart |
| POST | `/debug/stop`      | kill the inferior + gdb, delete the workspace |
| POST | `/terminal/start`  | compile + spawn the binary, write Input Args once, keep stdin open |
| POST | `/terminal/poll`   | events after a cursor + current status (retained after exit) |
| POST | `/terminal/input`  | write one live-input payload, or close stdin on `{ "eof": true }` |
| POST | `/terminal/stop`   | kill the process group (idempotent) |

All POST requests authenticate with a bearer token equal to the app's
`CODE_DEBUGGER_API_KEY`. Terminal sessions additionally require an unguessable
per-session `sessionToken` (returned by `/terminal/start`) on every poll/input/stop;
a browser-supplied `sessionId` alone can never reach a foreign session.

## Sandbox limits

See `src/security.ts`:

- `DEBUG_LIMITS`: 10s compile, 5min wall, 2min idle, 256MB memory, 64 processes,
  64KB output, 20 breakpoints, 20 watches, 500 steps.
- `TERMINAL_LIMITS`: 10s compile, 10min wall, 3min idle (no polling), 60s
  retain-after-exit, 256MB memory, 64 processes, 128KB output, 5000 events, 10KB
  initial stdin, 4KB per live-input write, 64KB cumulative live input.

The program gets no network and a temp-only workspace deleted on every terminal
state. A quiet program waiting on stdin is never killed for being quiet — only the
hard wall/idle/retain/resource caps end it, with a visible system message.

## App configuration

Server-only env in the Next app runtime:

```bash
# Debugger (#442)
CODE_DEBUGGER_PROVIDER=gdb-service
CODE_DEBUGGER_BASE_URL=http://<ovh-host>:3008
CODE_DEBUGGER_API_KEY=<server-side-token>

# Interactive Terminal (#664) — may reuse the same host/process
CODE_TERMINAL_PROVIDER=execution-service
CODE_TERMINAL_BASE_URL=http://<ovh-host>:3008
CODE_TERMINAL_API_KEY=<server-side-token>
```

With the providers unset (the normal CI configuration) the Debug tab shows a
friendly "not configured" state, and the Terminal uses the deterministic mock in
non-production while showing an explicit "not configured" state in production.

## Deploy / operate

Build and run the image on the OVH host (needs a `gdb`/`g++` toolchain). Deploying
is a manual operations step, so live behavior is **unverified until that deploy**.

```bash
cd services/gdb-debugger
npm install
npm run build && DEBUGGER_API_KEY=<token> npm start   # listens on :3008
```

A curl smoke sequence for the terminal (start → input → poll → stop) is in
`docs/CODE_LAB.md`.

## Develop / test

```bash
cd services/gdb-debugger
npm install
npm test       # parser/buffer/security unit tests + terminal event-buffer + real-child terminal integration
```

The terminal integration tests (`terminal-session.integration.test.ts`) compile and
run real programs, so they need `g++` and are skipped automatically where it is
unavailable. The service uses its own `vitest.config.ts` (node environment).
