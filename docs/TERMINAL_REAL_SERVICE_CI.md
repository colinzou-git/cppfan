# Interactive Terminal real-service CI

cppFan keeps ordinary CI deterministic and network-independent. The optional
`Interactive Terminal real-service E2E` workflow proves the complete deployed
path:

```text
GitHub-hosted runner
  -> strict authenticated SSH forwards
    -> VPS Judge0 on runner 127.0.0.1:23580
    -> VPS execution service on runner 127.0.0.1:23581
      -> Next.js Code Lab APIs
        -> focused authenticated Chromium tests
```

The same execution-service deployable hosts the interactive Terminal and GDB
routes. Do not create a second Terminal daemon.

## Repository settings

Actions secrets:

```text
VPS_SSH_PRIVATE_KEY
VPS_SSH_KNOWN_HOSTS
CODE_RUNNER_API_KEY
CODE_TERMINAL_API_KEY
```

Actions variables:

```text
VPS_SSH_HOST
VPS_SSH_USER
VPS_JUDGE0_PORT
VPS_TERMINAL_PORT=3008
CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID
CODE_RUNNER_JUDGE0_ENABLE_COMPILER_OPTIONS
CODE_TERMINAL_REAL_E2E_ENABLED=true
```

Use the actual loopback port of the deployed `services/gdb-debugger` process if
it differs from `3008`. Configure every secret and variable before enabling the
workflow. Fork pull requests skip the secret-bearing job.

No key, session capability, provider token, or raw service response belongs in
workflow output, artifacts, committed files, or issue comments.

## VPS deployment prerequisite

Build and deploy the current `services/gdb-debugger` image/service on the same
VPS environment family already used for debugging. The service must bind only
to the configured VPS loopback port and must use the same bearer value stored in
`CODE_TERMINAL_API_KEY`.

On the VPS:

```bash
curl -fsS http://127.0.0.1:3008/health | jq .
```

Expected:

```json
{"status":"ok"}
```

The deployed build must include the shared files/compiler-flags Terminal start
contract. Repository YAML alone is not deployment proof.

## Manual verification

Open **Actions → Interactive Terminal real-service E2E → Run workflow**. The job:

1. installs the dedicated key and independently verified known-host entry;
2. opens strict key-only forwards to Judge0 and the Terminal service;
3. runs the direct Judge0 and Terminal preflights;
4. starts disposable local Supabase;
5. runs only `authenticated-terminal-real.spec.ts` on Chromium;
6. uploads sanitized diagnostics on failure;
7. always stops the SSH process.

The application is started with both real-provider requirements. A missing or
misconfigured Terminal provider is therefore an explicit failure and can never
fall back to `mock`.

## Terminal preflight

`scripts/ci/verify-code-terminal.sh` proves:

- unauthenticated health;
- compile/start and cursor polling;
- multiple live inputs including spaces;
- an empty `getline` line;
- EOF and natural exit;
- nested fixture materialization;
- manual Stop and its transcript event.

The artifact summary contains only:

```text
health=ok
multi_input=ok
empty_line=ok
eof=ok
fixture=ok
stop=ok
```

## Rotating the Terminal API key

1. generate a new high-entropy bearer key;
2. update `DEBUGGER_API_KEY`/`CODE_DEBUGGER_API_KEY` for the existing VPS
   service and restart it;
3. verify `/health` locally on the VPS;
4. replace the `CODE_TERMINAL_API_KEY` Actions secret;
5. manually dispatch the workflow and retain the green run URL;
6. remove the old key from the deployment secret store.

Never place the key in a command line captured by shell history or workflow
logs.

## Diagnostics and closure evidence

On failure, download `terminal-real-service-diagnostics`. It may contain the SSH
tunnel log, sanitized preflight summary, Playwright report, and test traces. It
must not contain API keys or Terminal session credentials.

Issue closure requires a green workflow URL/run ID and evidence that the direct
preflight and focused stdin, Stop, function-mode, fixture, provider, and
service-failure cases passed. Keep the issue open if the workflow is merely
committed, skipped, or unable to reach the deployed service.

Ordinary CI remains mock-based so pull requests stay fast and do not depend on a
private network or VPS availability. See
[Judge0 real-runner CI](./JUDGE0_REAL_RUNNER_CI.md) for the complementary
one-shot runner tunnel.
