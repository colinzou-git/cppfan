import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("authenticated E2E wiring", () => {
  it("exposes one canonical package command and makes CI use it", () => {
    const pkg = JSON.parse(read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const workflow = read(".github/workflows/ci.yml");

    expect(pkg.scripts?.["test:e2e:authenticated"]).toBe(
      "bash scripts/e2e/run-authenticated.sh"
    );
    expect(workflow).toContain("run: pnpm test:e2e:authenticated");

    // CI must not keep a second filename registry that can drift from the glob.
    expect(workflow).not.toContain("authenticated-learning-loop.spec.ts");
    expect(workflow).not.toContain("authenticated-onboarding.spec.ts");
  });

  it("discovers authenticated specs by naming convention", () => {
    const runner = read("scripts/e2e/run-authenticated.sh");
    const specs = readdirSync(join(root, "tests/e2e")).filter((name) =>
      /^authenticated-.*\.spec\.ts$/.test(name)
    );

    expect(specs.length).toBeGreaterThan(0);
    expect(runner).toContain("tests/e2e/authenticated-*.spec.ts");
    expect(runner).toContain("http://127.0.0.1:*");
    expect(runner).toContain("http://localhost:*");
    expect(runner).toContain("supabase stop --no-backup");
  });
});
