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
CODE_RUNNER_REAL_E2E_ENABLED=true
CODE_RUNNER_BASE_URL=https://<judge0-api-root>
CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID=54
CODE_RUNNER_JUDGE0_ENABLE_COMPILER_OPTIONS=false
```

Repository secret (`Settings -> Secrets and variables -> Actions -> Secrets`):

```text
CODE_RUNNER_API_KEY=<Judge0 AUTHN_TOKEN>
```

`CODE_RUNNER_BASE_URL` is the API root. Do not append `/submissions`, `/docs`,
or another path. The cppFan adapter appends the Judge0 resource paths itself.

The secret is optional only for a localhost-only or otherwise unauthenticated
Judge0 deployment. A publicly reachable deployment should require the standard
`X-Auth-Token` header and HTTPS.

The current VPS deployment has previously exposed C++ GCC as language id `54`.
The CI preflight verifies the configured id against `/languages`, so a changed
Judge0 image fails with an actionable list of the C++ ids currently available.

## VPS endpoint requirement

A GitHub-hosted runner must be able to reach `CODE_RUNNER_BASE_URL`. Keeping the
container port private is preferred; publish it through an HTTPS reverse proxy
or private tunnel rather than exposing the raw Docker port.

The following command can be run on the VPS after exporting the same values to
verify the exact contract used by CI and the app:

```bash
CODE_RUNNER_PROVIDER=judge0 \
CODE_RUNNER_BASE_URL=http://127.0.0.1:2358 \
CODE_RUNNER_API_KEY="$JUDGE0_TOKEN" \
CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID=54 \
CODE_RUNNER_JUDGE0_ENABLE_COMPILER_OPTIONS=false \
bash scripts/ci/verify-judge0.sh
```

The script:

1. calls `/languages` and verifies that the selected id is C++;
2. submits a Base64-encoded C++ translation unit using `wait=true`;
3. polls when Judge0 returns a pending token;
4. requires `Accepted` and stdout `42`;
5. never prints the authentication token.

## CI behavior

When `CODE_RUNNER_REAL_E2E_ENABLED` is not `true`, the job is skipped and normal
CI continues to use the deterministic mock.

When enabled, the job:

1. validates all Judge0 variables and performs the real compile/run preflight;
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
