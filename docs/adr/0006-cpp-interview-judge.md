# ADR 0006: Isolated C++ Interview Judge with Hidden Tests

## Status

Accepted (sandbox approach approved by the maintainer, 2026-06-14). Tracks
roadmap issue #178. Depends on the interview catalog (#176), timed sessions
(#177), server-authoritative evidence (#141), and the exercise packages (#81/#98).
Implemented in staged slices; this ADR is the required architecture decision and
threat model that precede the worker implementation.

## Context

Interview readiness must not rely on a learner self-asserting that tests passed.
cppFan needs real compilation and hidden-test evidence. The hard constraint:
**learner-submitted C++ must never run inside the Next.js/Vercel process** (or any
process that holds secrets, the database, or other users' data). Hidden test
inputs/outputs must stay server-side and never leak through logs or results.

## Options considered

1. **Codespaces / local exercise packages** — the learner runs the package's
   tests in their own Codespace/local toolchain (today's #81 model, compiled in CI
   via `verify-all.sh`, #98). Strong isolation (it is the learner's own machine),
   zero server execution, but it is honor-system for *hidden* tests and produces
   no server-trusted result.
2. **Self-hosted isolated worker** — a separate service that compiles and runs
   submissions in a locked-down sandbox (rootless container with seccomp/landlock,
   e.g. nsjail/bubblewrap, or a microVM such as Firecracker), pulled from a queue.
   Strong isolation + hidden-test secrecy + trusted results; higher ops/maintenance
   and cost.
3. **External judge API** — delegate execution to a third party. Low maintenance,
   but sends learner code off-platform (privacy), weakens hidden-test secrecy, and
   adds cost/quota/latency coupling.
4. **Hybrid / staged** — combine the above by stage.

## Decision

Adopt a **staged hybrid**:

- **Stage A (now): Codespaces/local packages, validated in CI.** The existing
  write-code exercises run in the learner's environment; CI compiles every
  reference solution + starter with sanitizers (#98). No untrusted code runs on
  cppFan infrastructure. Used for practice and worked-example evidence (honor
  system, clearly labeled).
- **Stage B (production hidden-test judging): a self-hosted isolated worker**,
  separate from the web app, invoked through a durable queue. This is the only
  place untrusted learner C++ executes. It holds hidden tests server-side and
  returns only structured results. The "clear value" of a separate sandbox
  (per the project's same-Codespace default) is precisely that it runs untrusted
  code safely — which an in-process or shared environment cannot.
- An **external judge API** is kept as a documented fallback only, not the
  primary path, because of code-privacy and hidden-test-secrecy concerns.

The web app never compiles or runs learner code; it enqueues a submission and
reads back a result that is persisted via the server-authoritative path (#141)
and integrated with sessions (#177).

## Threat model and mitigations

Untrusted submissions are assumed hostile. Each attack maps to a control:

| Threat | Mitigation |
| --- | --- |
| Infinite loop / CPU burn | CPU + wall-time limits; kill on exceed -> `timeout` |
| Fork bomb / extra processes | process/thread cap (rlimit/cgroup) |
| Memory exhaustion | memory limit -> `memory_limit` |
| Disk fill / huge output | file-size + output byte caps (truncate) |
| Filesystem escape / tamper | read-only rootfs + ephemeral per-submission workspace; non-root; mount namespace |
| Network exfiltration | no outbound network (network namespace with no interfaces) |
| Crash / UB / signals | run under a supervisor; map to `runtime_error` |
| Hidden-test disclosure | tests live server-side; results expose only pass/fail categories + counts, never inputs/expected; logs are truncated/sanitized |
| Cross-user leakage | per-submission ephemeral workspace; results keyed to the owning user (RLS); idempotent submission ids |
| Resource abuse | per-user + global rate/concurrency limits; bounded source size + test count |

## Default limits (Stage B)

CPU ~2s, wall ~5s, memory ~256 MB, ≤32 processes, output ≤256 KB, source ≤64 KB,
≤200 tests per submission. These are the documented starting points; the worker
treats them as configuration.

## Statuses

`accepted`, `wrong_answer`, `compile_error`, `runtime_error`, `timeout`,
`memory_limit`, `infrastructure_error`. Runtime/memory are recorded as diagnostic
measurements, not percentile rankings.

## Per-submission record

compiler + standard, source hash + version, compile result, visible/hidden test
summary (counts + which categories failed — not inputs/outputs), diagnostic
runtime/memory, session/problem version, and whether hints/prior-solution
exposure occurred. Submissions are idempotent by submission id. The database
record is authoritative for the web app; worker-specific fixture material stays
inside the worker-side hidden-test store.

## Local development

A reproducible local/Codespaces worker mode runs the *same* protocol and limits
where practical. CI validates reference solutions and intentionally-failing
submissions (Stage A, #98) **without** production credentials and without running
untrusted code in CI.

The repository-owned Stage B boundary is under `services/interview-judge/`.
`protocol.ts` defines the queue/worker request shape, and `sandbox-policy.ts`
defines the local run manifest, isolation profile, capability matrix, rate limits,
idempotent queue behavior, cancellation/worker-loss handling, and security
regression cases. The Next.js app talks through `src/features/interview/judge-client.ts`,
which validates and enqueues only; compiler and process execution APIs stay out
of `app/`, API routes, and server actions.

Durable submission metadata is stored in `public.interview_judge_submissions`
through `src/features/interview/judge-submission-store.ts`. Rows are owned by a
single learner under RLS, keyed by an idempotent `submission_id`, and store source
hash/version, problem/session metadata, queue/result status, visible/hidden pass
counts, and runtime/memory diagnostics. The table intentionally does not store
raw source text or hidden fixture inputs/expected outputs.

## Consequences

- Clear separation: the web app never executes learner code; a dedicated sandbox
  worker does. Hidden tests and results are server-authoritative.
- Cost/ops for the Stage B worker are deferred until that slice; Stage A already
  gives compile evidence today.

## Non-goals

- No execution of learner code in the Next.js/Vercel process, ever.
- No percentile/ranking noise from runtime measurements.
- No reliance on an external judge for the primary path.
- This ADR does not stand up the worker; it fixes the design + threat model that
  the worker and the typed judge contract (`src/features/interview/judge-contract.ts`)
  implement in later slices.
