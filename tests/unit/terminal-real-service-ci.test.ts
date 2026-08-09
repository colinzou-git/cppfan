import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  resolve(".github/workflows/terminal-real-service-e2e.yml"),
  "utf8"
);
const preflight = readFileSync(
  resolve("scripts/ci/verify-code-terminal.sh"),
  "utf8"
);
const focusedSpec = readFileSync(
  resolve("tests/e2e/authenticated-terminal-real.spec.ts"),
  "utf8"
);

describe("real interactive Terminal CI contract (#667)", () => {
  it("pins real providers and loopback endpoints", () => {
    expect(workflow).toContain("CODE_TERMINAL_PROVIDER: execution-service");
    expect(workflow).toContain(
      "CODE_TERMINAL_BASE_URL: http://127.0.0.1:23581"
    );
    expect(workflow).toContain(
      'CPPFAN_REQUIRE_REAL_CODE_TERMINAL: "true"'
    );
    expect(workflow).toContain("CODE_RUNNER_PROVIDER: judge0");
    expect(workflow).not.toContain("CODE_TERMINAL_PROVIDER: mock");
    expect(preflight).not.toContain("CODE_TERMINAL_PROVIDER: mock");
  });

  it("uses strict SSH options, both forwards, and skips fork secret access", () => {
    for (const option of [
      "BatchMode=yes",
      "IdentitiesOnly=yes",
      "ExitOnForwardFailure=yes",
      "PasswordAuthentication=no",
      "KbdInteractiveAuthentication=no",
      "StrictHostKeyChecking=yes",
      "UserKnownHostsFile="
    ]) {
      expect(workflow).toContain(option);
    }
    expect(workflow).toContain(
      '127.0.0.1:23580:127.0.0.1:${VPS_JUDGE0_PORT}'
    );
    expect(workflow).toContain(
      '127.0.0.1:23581:127.0.0.1:${VPS_TERMINAL_PORT}'
    );
    expect(workflow).toContain(
      "github.event.pull_request.head.repo.full_name == github.repository"
    );
  });

  it("runs only the focused browser spec and covers the full service protocol", () => {
    expect(workflow).toContain("tests/e2e/authenticated-terminal-real.spec.ts");
    expect(workflow).not.toContain("tests/e2e/authenticated-*.spec.ts");
    expect(focusedSpec).toContain(
      'process.env.CPPFAN_REQUIRE_REAL_CODE_TERMINAL !== "true"'
    );
    for (const marker of [
      "/health",
      "/terminal/start",
      "/terminal/poll",
      "/terminal/input",
      "/terminal/stop",
      "eof:true",
      "fixture-ok",
      "stopped by you"
    ]) {
      expect(preflight).toContain(marker);
    }
  });

  it("contains no literal credential material", () => {
    for (const text of [workflow, preflight]) {
      expect(text).not.toMatch(/BEGIN (RSA|OPENSSH|EC) PRIVATE KEY/);
      expect(text).not.toMatch(/Bearer [A-Za-z0-9_-]{20,}/);
      expect(text).not.toMatch(/X-Auth-Token: [A-Za-z0-9_-]{20,}/);
    }
  });
});
