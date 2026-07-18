// Shared fixture hashing for the isolated judge (#178/#608). The hash binds a
// test's stdin + expected stdout without exposing either across the web-app
// boundary — the same value is computed for native catalog fixtures and for
// user-authored interview tests, so a worker test can be matched to its
// server/worker-only fixture by hash alone.
import { createHash } from "node:crypto";

/** SHA-256 of the (stdin, expectedStdout) pair. Never the raw values. */
export function fixtureHashFor(stdin: string, expectedStdout: string): string {
  return createHash("sha256").update(`${stdin}\0${expectedStdout}`).digest("hex");
}
