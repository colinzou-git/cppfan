# Judge0 real-runner CI

cppFan normally uses the deterministic `mock` runner in CI. The optional
`Judge0 real-runner E2E` job proves that the authenticated browser workflow can
compile and run real C++ against the project-owned Judge0 deployment.

The ordinary App, DB, C++, and authenticated jobs remain independent of this
external service. The real-runner job is enabled only when the repository
variable below is explicitly set to `true`.

## Required GitHub Actions configuration

Repository variables (`Settings -> Secrets and variables -> Actions -> Variables`):

```text
VPS_SSH_HOST=15.204.89.92
VPS_SSH_USER=ubuntu
VPS_JUDGE0_PORT=2358
CODE_RUNNER_BASE_URL=http://127.0.0.1:23580
CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID=54
CODE_RUNNER_JUDGE0_ENABLE_COMPILER_OPTIONS=false
CODE_RUNNER_REAL_E2E_ENABLED=true
```

Repository secrets (`Settings -> Secrets and variables -> Actions -> Secrets`):

```text
VPS_SSH_PRIVATE_KEY=<dedicated passwordless Ed25519 private key>
VPS_SSH_KNOWN_HOSTS=<hashed, verified Ed25519 known_hosts entry>
CODE_RUNNER_API_KEY=<Judge0 AUTHN_TOKEN>
```

`CODE_RUNNER_BASE_URL` is the API root. Do not append `/submissions`, `/docs`,
or another path. The cppFan adapter appends the Judge0 resource paths itself.

The workflow binds the GitHub runner's `127.0.0.1:23580` to the VPS
`127.0.0.1:2358` through SSH. Judge0 remains private on the VPS and every API
request still uses the standard `X-Auth-Token` header.

The current VPS deployment has previously exposed C++ GCC as language id `54`.
The CI preflight verifies the configured id against `/languages`, so a changed
Judge0 image fails with an actionable list of the C++ ids currently available.

Set `CODE_RUNNER_REAL_E2E_ENABLED=true` only after every other variable and
secret is configured and the dedicated key has been verified with a
noninteractive SSH login.

## SSH trust and key requirements

The private key must be an Ed25519 key used only by this workflow, with no
passphrase. Install only its public key in the VPS user's `authorized_keys`.
Verify the VPS Ed25519 host fingerprint through an existing trusted channel
before creating `VPS_SSH_KNOWN_HOSTS`; never accept a key discovered during the
workflow. Store a hashed known-hosts entry.

The validated Ed25519 fingerprint for `15.204.89.92` is:

```text
SHA256:eG+MRz7IJm9stjid8QDw0aPL7JmfhNyXYBGTkwcrdd0
```

The workflow:

1. installs the private key and known-hosts entry with mode `600`;
2. uses strict host checking plus `BatchMode`, `IdentitiesOnly`, and
   `ExitOnForwardFailure`;
3. opens the local port forward and waits for the authenticated `/languages`
   endpoint;
4. runs the real compile/run preflight;
5. runs every authenticated browser spec on Chromium using Judge0;
6. uploads only tunnel and Playwright diagnostics on failure.

## CI behavior

When `CODE_RUNNER_REAL_E2E_ENABLED` is not `true`, the job is skipped and normal
CI continues to use the deterministic mock.

When enabled, the job:

1. establishes the dedicated SSH tunnel and performs the real compile/run
   preflight;
2. starts a disposable local Supabase stack through the canonical authenticated
   Playwright command;
3. runs every `authenticated-*.spec.ts` test on Chromium with
   `CODE_RUNNER_PROVIDER=judge0`;
4. uploads Playwright diagnostics on failure.

The environment variable `CPPFAN_REQUIRE_REAL_CODE_RUNNER=true` is also present
in this job. Real-runner-specific browser tests for issues #607 and #610 should
assert that their execution result reports `provider=judge0` and
`simulated=false`; they must not silently accept the mock provider.

## Production deployment

GitHub Actions variables configure CI only. The deployed Next.js application
must separately receive the same `CODE_RUNNER_*` values in Vercel or its actual
server environment. Never prefix the API token with `NEXT_PUBLIC_`.
