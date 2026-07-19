import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("test-environment policy", () => {
  it("requires Claude to discover environments before declaring work blocked", () => {
    const claude = read("CLAUDE.md");

    expect(claude).toContain("## Test environment discovery");
    expect(claude).toContain("pnpm test:e2e:authenticated");
    expect(claude).toContain("## Environment limitation analysis");
    expect(claude).toContain("supabase/config.toml");
    expect(claude).toContain("tests/e2e/authenticated-*.spec.ts");
  });

  it("documents the environment matrix and exposes it in PR and issue workflows", () => {
    const environments = read("docs/TEST_ENVIRONMENTS.md");
    const prTemplate = read(".github/pull_request_template.md");
    const issueTemplate = read(".github/ISSUE_TEMPLATE/implementation.md");

    expect(environments).toContain("| Authenticated browser |");
    expect(environments).toContain("pnpm test:e2e:authenticated");
    expect(environments).toContain("Production operator");

    expect(prTemplate).toContain("### Test environment selection");
    expect(prTemplate).toContain(
      "Authenticated browser E2E with disposable local Supabase"
    );
    expect(prTemplate).toContain("## Environment limitation analysis");

    expect(issueTemplate).toContain("## Required validation environments");
    expect(issueTemplate).toContain(
      "Authenticated browser with disposable local Supabase"
    );
  });
});
