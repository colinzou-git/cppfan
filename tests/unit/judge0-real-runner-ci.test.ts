import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("Judge0 real-runner CI wiring", () => {
  it("keeps the external runner optional and injects only server-side configuration", () => {
    const workflow = read(".github/workflows/judge0-real-runner.yml");

    expect(workflow).toContain("vars.CODE_RUNNER_REAL_E2E_ENABLED == 'true'");
    expect(workflow).toContain("CODE_RUNNER_PROVIDER: judge0");
    expect(workflow).toContain("CODE_RUNNER_BASE_URL: ${{ vars.CODE_RUNNER_BASE_URL }}");
    expect(workflow).toContain("CODE_RUNNER_API_KEY: ${{ secrets.CODE_RUNNER_API_KEY }}");
    expect(workflow).toContain("CODE_RUNNER_JUDGE0_CPP_LANGUAGE_ID");
    expect(workflow).toContain('CPPFAN_REQUIRE_REAL_CODE_RUNNER: "true"');
    expect(workflow).toContain("VPS_SSH_PRIVATE_KEY: ${{ secrets.VPS_SSH_PRIVATE_KEY }}");
    expect(workflow).toContain("VPS_SSH_KNOWN_HOSTS: ${{ secrets.VPS_SSH_KNOWN_HOSTS }}");
    expect(workflow).toContain('install -m 600 /dev/null "${key_path}"');
    expect(workflow).toContain("-o BatchMode=yes");
    expect(workflow).toContain("-o IdentitiesOnly=yes");
    expect(workflow).toContain("-o ExitOnForwardFailure=yes");
    expect(workflow).toContain("-o StrictHostKeyChecking=yes");
    expect(workflow).toContain('-L "127.0.0.1:23580:127.0.0.1:${VPS_JUDGE0_PORT}"');
    expect(workflow).toContain("Judge0 SSH tunnel is reachable.");
    expect(workflow).toContain("bash scripts/ci/verify-judge0.sh");
    expect(workflow).toContain(
      "pnpm test:e2e:authenticated tests/e2e/authenticated-*.spec.ts --project=chromium"
    );
    expect(workflow).toContain("${{ runner.temp }}/judge0-ssh-tunnel.log");
    expect(workflow).not.toContain("ssh-keyscan");
    expect(workflow).not.toContain("NEXT_PUBLIC_CODE_RUNNER");
  });

  it("performs a real submission without printing the authentication token", () => {
    const preflight = read("scripts/ci/verify-judge0.sh");

    expect(preflight).toContain("X-Auth-Token: ${CODE_RUNNER_API_KEY}");
    expect(preflight).toContain("/submissions?base64_encoded=true&wait=true");
    expect(preflight).toContain('status_id}" != "3"');
    expect(preflight).toContain('stdout_text}" != "42"');
    expect(preflight).not.toContain('echo "${CODE_RUNNER_API_KEY}');
    expect(preflight).not.toContain("set -x");
  });

  it("documents the repository handoff and production separation", () => {
    const runbook = read("docs/JUDGE0_REAL_RUNNER_CI.md");

    expect(runbook).toContain("CODE_RUNNER_REAL_E2E_ENABLED=true");
    expect(runbook).toContain("CODE_RUNNER_API_KEY=<Judge0 AUTHN_TOKEN>");
    expect(runbook).toContain("VPS_SSH_PRIVATE_KEY");
    expect(runbook).toContain("VPS_SSH_KNOWN_HOSTS");
    expect(runbook).toContain("CODE_RUNNER_BASE_URL=http://127.0.0.1:23580");
    expect(runbook).toContain("GitHub Actions variables configure CI only");
    expect(runbook).toContain("Never prefix the API token with `NEXT_PUBLIC_`");
  });
});
