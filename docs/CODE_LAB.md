# Code Lab (in-app C++ editor, Judge0 runner, tests, AI review)

The Code Lab (#407) lets learners write C++ inside cppFan, run it, run visible
and hidden tests, and ask the AI to review the result — without leaving the
learning flow.

The Code Lab now has a **real GDB-backed Debug tab** (#442) — breakpoints, step
controls, variable/watch inspection, and a call stack, driven by an actual
`gdb --interpreter=mi2` process, **not** an AI approximation. It is separate from
the older AI trace (an educational approximation). The Debug tab is real only when
the GDB debugger service is configured; otherwise it shows a friendly
"not configured" state. Compiler output and test results remain the source of
truth for mastery — debugging never records `code_passed` or marks a skill
mastered.

## How it appears

The Code Lab is **metadata-driven**. It renders wherever a learning item carries
Code Lab metadata, via the shared `MaybeCodeLab` mount in the learning-item view.
An item opts in through `codeLabConfigs` in
`src/features/code-lab/code-lab-catalog.ts`; items without config render no
editor.

Bundled seed examples include:

- `cpp.program_basics.structure.lesson` — print a greeting
- `cpp.program_basics.io.lesson` — echo a line of input
- `cpp.program_basics.statements_comments.lesson` — print two lines

The full-page Code Lab (`/lab/<itemId>`) also resolves project labs (#439),
write-code exercises (#440), and **interview problems** (#444, keyed by `iv.*` id
via `interview-code-lab-configs.ts`), so the Interview page Code button opens the
same workspace + Debug tab as Labs/Exercises. The timed interview session stays
reachable via its own button.

### Two layouts, one controller (#431)

Code Lab state (run/test/review/trace, predictions, remediation, scaffold) lives
in the shared `useCodeLabController` hook so both layouts behave identically:

- **Embedded** — `CodeLab` renders inside the lesson page next to the prompt.
  Its header has a **Full screen** link to the dedicated route.
- **Full page** — `CodeLabWorkspace` at `/lab/[itemId]` gives the editor the
  whole viewport height. On `xl`+ it is a three-column layout — problem panel,
  centered editor, tabbed output dock (Output / Tests / Input / AI) whose header
  carries the file title and run/test controls. The columns are **user-resizable**
  (default 1/6 · 1/2 · 1/3; widths persist to `localStorage`). Below `xl` it
  collapses to a single scrolling column so iPhone/iPad stay usable. The route
  404s for non-Code-Lab items. Column math is the pure, unit-tested
  `column-sizes.ts`.

The AI tab hosts an **in-context chat** (`CodeLabChat`): it reuses the shared
tutor transport and markdown renderer, and attaches the **current editor code**
as the `learnerDraft` of a `lab_item` chat context at send time — so questions
are always answered against the code on screen. The context builder is the pure
`code-lab-chat-context.ts`, unit-tested against the chat API's own normalizer.
Sending requires sign-in (the panel surfaces the tutor's auth/availability
notices); compiler output and tests remain authoritative over AI replies.

## Runner architecture

Untrusted C++ is **never** executed in the Next.js/Vercel process. Browser UI
calls `/api/code/run` and `/api/code/test`; those server routes call the
server-only runner adapter in `src/features/code-lab/code-runner*.ts`.

Supported providers:

- `mock` — deterministic, network-free simulator for local dev and CI. It does
  not compile real C++; results are marked `simulated: true`.
- `judge0` — real C++ compile/run through your Judge0 CE/Extra CE instance.
- `piston` — legacy/self-hosted Piston support retained for compatibility, but
  not used by default.

When `CODE_RUNNER_PROVIDER` is unset, cppFan uses `mock`. Real compile/run is
explicitly enabled with `CODE_RUNNER_PROVIDER=judge0`.

## Judge0 configuration

For your OVH Judge0 instance, set these locally and in Vercel:

```bash
CODE_RUNNER_PROVIDER=judge0
CODE_RUNNER_BASE_URL=http://15.204.89.92:2358
CODE_RUNNER_API_KEY=<your Judge0 AUTHN_TOKEN>
CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID=54
CODE_RUNNER_TIMEOUT_MS=5000
CODE_RUNNER_MEMORY_MB=128
```

`54` is `C++ (GCC 9.2.0)` on the validated Judge0 CE v1.13.1 installation.

The app sends the token as `X-Auth-Token` from the server adapter only. The token
is never included in client bundles or API responses. Do not commit the real
token to the repo.

Optional compiler options:

```bash
CODE_RUNNER_JUDGE0_ENABLE_COMPILER_OPTIONS=true
```

Leave this `false` unless the Judge0 instance has compiler options enabled. The
Code Lab still passes curated server-side flags internally; it does not allow the
browser to send arbitrary compiler flags to Judge0.

## Runner health check

Use the health endpoint before debugging the UI:

```bash
curl http://localhost:3000/api/code/runner-health
```

For Vercel:

```bash
curl https://cppfan.vercel.app/api/code/runner-health
```

The endpoint returns provider, configured/reachable state, HTTP status, and the
configured C++ language id. It never returns `CODE_RUNNER_API_KEY`.

## Run/Test behavior

`runCode()` compiles/runs the current source with optional stdin, maps Judge0
statuses into cppFan's existing result shape, and applies deterministic error
classifications.

`runTests()` runs visible tests and server-only hidden tests. Hidden test inputs
and expected outputs live in `code-lab-hidden-tests.ts`, never in client-readable
metadata. The client only receives a hidden passed/total count.

Judge0 status mapping:

- `3 Accepted` -> `success`
- `6 Compilation Error` -> `compile_error`
- `5 Time Limit Exceeded` -> `timeout`
- `7..12 Runtime Error` -> `runtime_error`
- `13 Internal Error` or unknown statuses -> `runner_error`

## Attempt storage and skill evidence

When Supabase is configured and the learner is signed in, each Run/Test/Review is
recorded best-effort in `public.code_lab_attempts` with RLS per learner. Run/Test
still work signed-out and pre-migration.

Real, non-simulated Code Lab attempts also append skill events best-effort:

- `code_attempted` for each item `skillTag` on real Run/Test attempts.
- `code_passed` for each item `skillTag` only when a real Test attempt passes all
  visible and hidden tests.

The event metadata includes item id, provider, simulated flag, run status,
visible/hidden pass counts, duration, memory, and AI review flag. Mock/simulated
runs are not promoted into mastery-strength code evidence.

## AI review

AI review reuses the AI Chat provider (`AI_PROVIDER`, `GROQ_API_KEY`,
`AI_CHAT_ENABLED`). It builds context from the item prompt, skill tags, learner
code, and compiler/run/test summaries, then returns short hint-first feedback.
When no provider is configured, the panel shows a friendly unavailable state and
Run/Test keep working.

## AI trace

"Trace with AI" produces an approximate, AI-generated educational walkthrough of
how the code likely executed for a selected input or visible test case. It is not
runtime inspection. Compile errors are treated as blockers; hidden tests are
never sent to the prompt.

Relevant files:

- `app/api/code/run/route.ts`
- `app/api/code/test/route.ts`
- `app/api/code/review/route.ts`
- `app/api/code/trace/route.ts`
- `app/api/code/runner-health/route.ts`
- `src/features/code-lab/code-runner-adapter.ts`
- `src/features/code-lab/code-runner.ts`
- `src/features/code-lab/code-lab-service.ts`
- `src/features/code-lab/code-attempt-service.ts`

## Debug tab (real GDB, #442)

The full-page workspace (`/lab/<itemId>`) has a **Debug** right-dock tab beside
Output, Tests, (Input,) and AI. It is a real debugger — `g++ -g -O0` +
`gdb --interpreter=mi2` — not the AI trace.

- **Breakpoints** toggle from the Monaco gutter (tap/click) or an
  add-by-line-number control (required for iPhone/iPad). They persist per item in
  `localStorage` (`cppfan:code-debug-breakpoints:<itemId>`), like code drafts; they
  are **not** synced to Supabase.
- **Sessions are ephemeral.** Nothing is persisted server-side; a session is reaped
  on idle/wall timeout, and a page refresh ends it (restart to debug again).
- **Source edits during a session** mark it stale: only Stop/Restart stay enabled,
  because the running program no longer matches the editor.
- **AI "Explain current step"** runs only when the learner clicks it — never
  automatically — and is grounded strictly in the runtime snapshot.
- **Mastery is unchanged.** Debugging records no skill events and never marks a
  skill mastered or `code_passed`; Run/Test remain the evidence.

### Security model

Untrusted C++ **never** runs inside the Next.js/Vercel process. The browser calls
Next API routes (`app/api/code/debug/{start,action,stop,health,explain}`), which
proxy to the OVH GDB service (`services/gdb-debugger`). The browser never receives
`CODE_DEBUGGER_API_KEY`. The service compiles and debugs in an isolated,
network-less, temp-only workspace with bounded compile/wall/idle timeouts, memory,
processes, output, breakpoints, watches, and steps (`services/gdb-debugger/src/security.ts`).

### Configuration (server-only)

```bash
CODE_DEBUGGER_PROVIDER=gdb-service
CODE_DEBUGGER_BASE_URL=http://<ovh-host>:3008
CODE_DEBUGGER_API_KEY=<server-side-token>
CODE_DEBUGGER_TIMEOUT_MS=300000
```

With `CODE_DEBUGGER_PROVIDER` **unset** (the normal CI configuration) the Debug tab
still renders; Start Debugging returns a friendly "Real debugger service is not
configured." state and no external service is needed. Deploy the service with
`services/gdb-debugger` (Docker) on the same OVH environment family as Judge0.

## Interactive Terminal (live cin/getline, #664)

**Run** starts an interactive **Terminal** session instead of a one-shot execution.
The program compiles on the execution service, spawns with piped stdin/stdout/stderr,
and stays alive so the learner can answer later `std::cin` / `std::getline` reads
without restarting. Both the full-page workspace and the embedded lab share one
controller (`useCodeTerminal`) and one panel (`CodeTerminalPanel`).

- **Terminal vs Input Args.** The full-page right dock renames **Output → Terminal**
  and **Input → Input Args**. Input Args is the *initial stdin* written once at
  launch (not `main(argc, argv)` command-line input); standard input stays open
  afterward so live input in the Terminal answers later reads. Its contents are
  sent exactly as authored — no newline is added or removed.
- **Combined transcript.** Compiler diagnostics, stdout, stderr, learner input, and
  system notices appear in one chronological, escaped (never HTML), whitespace-
  preserving log. It auto-follows only while you are near the bottom and offers a
  "Jump to latest" control otherwise.
- **Run/Stop.** While compiling/running, Run becomes **Stop**, and **Run Tests** is
  disabled so the two execution paths never compete. Editing the source during a
  session marks it as running an older version; Stop before running the change.
- **Send / Send EOF.** Enter sends the composer text plus `\n` (empty lines are
  allowed, for getline); **Send EOF** closes stdin without killing the process, so
  `while (getline(...))` loops can finish intentionally.
- **Session ending.** A session ends only through an explicit/real event: Stop, EOF
  then natural exit, natural exit, compile/runtime failure, or a hard server safety
  limit. A quiet program waiting on input is **never** killed by a client heuristic —
  only the hard wall/idle/retain/resource caps end it, and they surface a visible
  system message.
- **Learning rules.** A Terminal Run records exactly one attempt when the session
  reaches a final state (polling never duplicates it) and may emit `code_attempted`,
  but **never** `code_passed`/mastery — only the one-shot **Run Tests** path produces
  pass evidence. Run Tests stays one-shot, deterministic, and never leaks hidden tests.

### Terminal security model

Untrusted C++ **never** runs inside Next.js/Vercel and the browser never receives
`CODE_TERMINAL_API_KEY` or the service URL. The browser calls Next API routes
(`app/api/code/terminal/{start,poll,input,stop,attempt,health}`), which proxy to the
execution service's `/terminal/{start,poll,input,stop}` (same OVH deployable as the
GDB debugger). Sessions use cryptographically random ids **and** an unguessable
per-session capability token required on every poll/input/stop; a browser-supplied
id alone can never reach a foreign session. The service bounds source, initial and
per-write and cumulative live input, output bytes, event count, processes, memory,
compile time, wall time, and retained-session time, kills the whole process group on
Stop/reap, and deletes the temp workspace on every terminal state
(`services/gdb-debugger/src/{terminal-session,terminal-event-buffer,security}.ts`).

### Terminal configuration (server-only)

```bash
CODE_TERMINAL_PROVIDER=execution-service
CODE_TERMINAL_BASE_URL=http://<ovh-host>:3008
CODE_TERMINAL_API_KEY=<server-side-token>
CODE_TERMINAL_TIMEOUT_MS=30000
CODE_TERMINAL_POLL_MS=250
```

Provider selection (`code-terminal-service.ts`): `execution-service` + a base URL →
the real OVH adapter; `mock` → the deterministic in-memory mock; **unset/misconfigured**
→ the mock in non-production (local dev, CI, Playwright work offline) but an explicit
"Interactive terminal service is not configured" state in production, so a real
deployment never pretends live input works. Health: `GET /api/code/terminal/health`.

### Terminal service smoke test

With the service running (`cd services/gdb-debugger && npm run build && npm start`)
and `DEBUGGER_API_KEY` set, drive a full session over curl:

```bash
BASE=http://localhost:3008; KEY=<server-side-token>
SRC='#include <iostream>\nint main(){int x; std::cin>>x; std::cout<<"got "<<x<<"\\n";}'
# start
RESP=$(curl -s -H "authorization: Bearer $KEY" -H 'content-type: application/json' \
  -d "{\"source\":\"$SRC\"}" "$BASE/terminal/start")
SID=$(echo "$RESP" | jq -r .sessionId); TOK=$(echo "$RESP" | jq -r .sessionToken)
# input
curl -s -H "authorization: Bearer $KEY" -H 'content-type: application/json' \
  -d "{\"sessionId\":\"$SID\",\"sessionToken\":\"$TOK\",\"data\":\"7\\n\"}" "$BASE/terminal/input"
# poll for output
curl -s -H "authorization: Bearer $KEY" -H 'content-type: application/json' \
  -d "{\"sessionId\":\"$SID\",\"sessionToken\":\"$TOK\",\"after\":0}" "$BASE/terminal/poll"
# stop
curl -s -H "authorization: Bearer $KEY" -H 'content-type: application/json' \
  -d "{\"sessionId\":\"$SID\",\"sessionToken\":\"$TOK\"}" "$BASE/terminal/stop"
```

The `services/gdb-debugger` real-child-process integration tests
(`terminal-session.integration.test.ts`) exercise the same behaviors and require a
`g++` toolchain; they are skipped automatically where one is unavailable, so ordinary
`pnpm verify` never needs production credentials.

## Troubleshooting

### `/languages` works but submissions fail

Check the worker logs on the Judge0 host:

```bash
cd ~/judge0-v1.13.1
docker compose logs --tail=200 workers
```

If you see cgroup/isolate/`/box/main.cpp` errors, the host is not providing the
Linux sandbox mode Judge0 expects. The OVH Ubuntu VPS with cgroup v1 controller
mounts is the validated path; WSL2 was not sufficient.

### `401 Unauthorized`

The value in `CODE_RUNNER_API_KEY` must match `AUTHN_TOKEN` in `judge0.conf`, and
Judge0 must be restarted after changing `judge0.conf`.

### `runner_unconfigured`

Check:

```bash
CODE_RUNNER_PROVIDER=judge0
CODE_RUNNER_BASE_URL=http://15.204.89.92:2358
CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID=54
```

### Slow or unstable tests on VPS-1

Keep strict limits first:

```bash
CODE_RUNNER_TIMEOUT_MS=5000
CODE_RUNNER_MEMORY_MB=128
```

If multiple learners use Code Lab or hidden tests become slow, upgrade the Judge0
host to OVH VPS-2. cppFan only needs the same environment variables pointed at
the upgraded runner.

### Debugger tab shows "not configured"

Set `CODE_DEBUGGER_PROVIDER=gdb-service` and `CODE_DEBUGGER_BASE_URL`. With them
unset, the Debug tab intentionally shows the unconfigured state and runs no
service (the normal CI configuration).

### Breakpoints do not hit

Confirm the code compiles with `-g -O0` (the service uses both) and the
breakpoint line is executable (not a blank line or a declaration-only line).

### Variables show as unavailable

GDB cannot show optimized-out or out-of-scope variables; the service compiles with
`-O0`, so this usually means the variable is not yet in scope at the current line.

### Debug session disappeared after refresh

Debug sessions are ephemeral and server-side in-memory. A refresh ends the
session — click Restart/Start Debugging to begin a new one.

## Adding a code-capable item

1. Add an entry to `codeLabConfigs` keyed by the learning item id.
2. Include `starterCode`, visible tests, optional hidden test count, and
   `skillTags`.
3. Put hidden inputs/expected outputs in the server-only hidden-test module.
4. Keep tasks single-file C++ unless a future multi-file runner is explicitly
   added.
5. Verify Run, Test, AI review, trace, and skill-event evidence with unit or e2e
   coverage.
