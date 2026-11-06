import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("infrastructure CI dependency and live preflight diagnostics", () => {
  it("installs the GDB service's deps using the pinned root pnpm lockfile", () => {
    const ci = read(".github/workflows/ci.yml");
    const service = read("services/gdb-debugger/package.json");
    const root = read("package.json");
    expect(ci).toContain("corepack prepare pnpm@10.0.0 --activate");
    expect(ci).toContain("run: pnpm install --frozen-lockfile");
    expect(ci).not.toContain("run: npm install");
    expect(ci).toContain("working-directory: services/gdb-debugger");
    for (const dep of ["typescript", "vitest", "@types/node"]) {
      expect(JSON.parse(root).devDependencies[dep]).toBeTruthy();
      expect(JSON.parse(service).devDependencies[dep]).toBeTruthy();
    }
  });

  it("runs bounded read-only remote diagnostics on failed real-service checks", () => {
    const diagnostics = read("scripts/ci/diagnose-remote-services.sh");
    for (const name of ["judge0", "terminal"]) {
      const workflow = read(
        name === "judge0"
          ? ".github/workflows/judge0-real-runner.yml"
          : ".github/workflows/terminal-real-service-e2e.yml"
      );
      expect(workflow).toContain("Diagnose remote service preflight (read-only)");
      expect(workflow).toContain("if: failure()");
      expect(workflow).toContain("continue-on-error: true");
      expect(workflow).toContain("diagnose-remote-services.sh " + name);
    }
    expect(diagnostics).toContain("--output /dev/null");
    expect(diagnostics).toContain("--max-time 4");
    expect(diagnostics).toContain("StrictHostKeyChecking=yes");
    expect(diagnostics).toContain("docker ps --format");
    expect(diagnostics).not.toContain("set -x");
    expect(diagnostics).not.toContain("docker restart");
    expect(diagnostics).not.toContain("systemctl restart");
  });
});
