import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const temporaryDirectories: string[] = [];
const projectRoot = process.cwd();
const setupScript = join(projectRoot, "scripts", "ai", "enable-code-index-hooks.mjs");

function createRepository() {
  const directory = mkdtempSync(join(tmpdir(), "cppfan-hooks-"));
  temporaryDirectories.push(directory);
  execFileSync("git", ["init", "--quiet"], { cwd: directory });
  return directory;
}

function configuredHookPath(directory: string) {
  return execFileSync("git", ["config", "--local", "--get", "core.hooksPath"], {
    cwd: directory,
    encoding: "utf8"
  }).trim();
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("code-index Git hooks", () => {
  it("enables the repository-managed hook path", () => {
    const directory = createRepository();

    execFileSync(process.execPath, [setupScript], {
      cwd: directory,
      env: { ...process.env, CI: "" },
      encoding: "utf8"
    });

    expect(configuredHookPath(directory)).toBe(".githooks");
  });

  it("preserves an existing custom hook path", () => {
    const directory = createRepository();
    execFileSync("git", ["config", "--local", "core.hooksPath", ".custom-hooks"], { cwd: directory });

    const result = spawnSync(process.execPath, [setupScript], {
      cwd: directory,
      env: { ...process.env, CI: "" },
      encoding: "utf8"
    });

    expect(result.status).toBe(0);
    expect(configuredHookPath(directory)).toBe(".custom-hooks");
  });

  it("ships executable commit, merge, checkout, and rewrite hooks", () => {
    for (const hookName of ["post-commit", "post-merge", "post-checkout", "post-rewrite"]) {
      const hookPath = join(projectRoot, ".githooks", hookName);
      const content = readFileSync(hookPath, "utf8");
      expect(content).toContain(`refresh-code-index.mjs" ${hookName}`);

      if (process.platform !== "win32") {
        expect(statSync(hookPath).mode & 0o111).not.toBe(0);
      }
    }
  });

  it("limits post-checkout refreshes to branch switches", () => {
    const hook = readFileSync(join(projectRoot, ".githooks", "post-checkout"), "utf8");
    expect(hook).toContain('${3:-0}');
    expect(hook).toContain('!= "1"');
  });
});
