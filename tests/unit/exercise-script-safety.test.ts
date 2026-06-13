import { execFileSync } from "node:child_process";
import { describe, it } from "vitest";

// Regression coverage for exercise-id validation hardening (#127). The actual
// assertions live in scripts/exercises/selftest.sh (shell-level), which this
// test executes so it runs as part of `pnpm test` / CI. Skipped only where bash
// is unavailable (e.g. a bare Windows shell); CI (Linux) and Codespaces run it.

function bashAvailable(): boolean {
  try {
    execFileSync("bash", ["-c", "true"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

describe("exercise script safety (#127)", () => {
  it.runIf(bashAvailable())("rejects path-traversal/symlink/invalid ids and accepts valid ones", () => {
    // Throws (failing the test) if the selftest exits non-zero.
    execFileSync("bash", ["scripts/exercises/selftest.sh"], { cwd: process.cwd(), stdio: "pipe" });
  });
});
