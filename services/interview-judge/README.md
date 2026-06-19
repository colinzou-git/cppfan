# cppFan interview judge worker

This directory is the repository-owned boundary for #178. It is intentionally
outside `app/` and outside Next.js server actions: the web app may enqueue a
submission, but learner C++ must run only in a separate worker service.

## Runtime Boundary

Production Stage B uses a separate worker process/container or microVM:

- no outbound network
- read-only root filesystem
- ephemeral `/workspace` tmpfs for each submission
- non-root uid/gid
- dropped Linux capabilities
- seccomp/microVM syscall isolation
- CPU, wall-time, memory, process, file-size, output, source-size, and test-count limits
- cleanup on success, cancellation, timeout, and worker loss

The CI-safe TypeScript modules in this directory define the protocol, policy, and
worker runner contract. `worker-runner.ts` orchestrates compile/run commands over
an injected process executor; `docker-executor.ts` wraps those commands in the
local/Codespaces Docker isolation envelope; `process-launcher.ts` supervises the
Docker CLI with timeout and output caps for local worker wiring; and
`workspace-lifecycle.ts` materializes `submission.cpp` in a per-submission
temporary directory and cleans it up with `withJudgeWorkspace()`. Unit tests use
fake launchers so `pnpm test` never executes learner code.

## Local Manifest

`buildSandboxRunManifest()` models the local/Codespaces invocation:

```text
docker run --rm --network=none --read-only \
  --tmpfs=/tmp:rw,nosuid,nodev,noexec \
  --mount type=bind,source=<temporary workspace>,target=/workspace \
  --workdir /workspace \
  --user=65532:65532 --cap-drop=ALL \
  --security-opt=no-new-privileges \
  --pids-limit 32 --memory 256m cppfan/interview-judge:local
```

The worker receives `JudgeWorkerRequest` records with:

- exact compiler/standard (`gcc` or `clang`, `c++17` or `c++20`)
- task kind (`compile_only` or `compile_and_run`)
- visible and hidden test metadata
- hashes for server-held fixtures, never raw hidden inputs or expected outputs
- idempotent submission id

## Evidence Contract

Results return only structured status, visible/hidden counts, runtime/memory
diagnostics, and sanitized logs. Hidden test names, inputs, and expected outputs
do not cross the worker/web boundary until a separate catalog policy permits it.
