import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Lightweight documentation-consistency check (#101): keep the README's
// operational guidance from drifting away from package.json and the
// migrations directory.

const root = process.cwd();
const readme = readFileSync(join(root, "README.md"), "utf8");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
};

// pnpm built-in subcommands that are not package scripts.
const PNPM_BUILTINS = new Set([
  "install",
  "exec",
  "dlx",
  "add",
  "remove",
  "run",
  "create",
  "why",
  "store",
  "update",
  "outdated",
  "list",
  "link",
  "unlink",
  "import",
  "rebuild",
  "prune",
  "dedupe",
  "audit",
  "publish",
  "pack",
  "init",
  "config",
  "setup",
  "env",
  "patch"
]);

describe("README documentation consistency", () => {
  it("only references pnpm scripts that exist in package.json", () => {
    const referenced = new Set<string>();
    for (const match of readme.matchAll(/pnpm\s+([a-z][\w:-]*)/g)) {
      const token = match[1];
      if (!PNPM_BUILTINS.has(token)) {
        referenced.add(token);
      }
    }

    expect(referenced.size).toBeGreaterThan(0); // sanity: README documents commands

    const scripts = new Set(Object.keys(pkg.scripts));
    const missing = [...referenced].filter((name) => !scripts.has(name));
    expect(missing, `README documents pnpm commands not in package.json: ${missing.join(", ")}`).toEqual([]);
  });

  it("does not hardcode a manual migration filename list (the directory is the source of truth)", () => {
    // Guards the #101 decision to replace the long, drift-prone filename list
    // with durable instructions. A stray reference or two is fine; a list is not.
    const filenameRefs = readme.match(/supabase\/migrations\/\d{14}_[\w-]+\.sql/g) ?? [];
    expect(
      filenameRefs.length,
      `README hardcodes ${filenameRefs.length} migration filenames; list with \`ls supabase/migrations\` instead`
    ).toBeLessThan(3);
  });

  // #148: the repo must not look like an un-applied scaffold/patch bundle.
  it("has no package/patch-era operational docs at the repo root", () => {
    const stale = [
      "FILE_MANIFEST.md",
      "FILE_MANIFEST_AUTH_PATCH.md",
      "FILE_MANIFEST_PROFILE_ONBOARDING_PATCH.md",
      "PATCH_README.md"
    ];
    const present = stale.filter((name) => existsSync(join(root, name)));
    expect(present, `obsolete scaffold/patch docs still present: ${present.join(", ")}`).toEqual([]);
  });

  it("keeps obsolete scaffold/patch operational phrasing out of active setup docs", () => {
    const OBSOLETE = [/unzip/i, /app scaffold/i, /overwrite (the )?files/i, /apply (the|this) patch/i];
    for (const file of ["README.md", "CLAUDE.md"]) {
      const text = readFileSync(join(root, file), "utf8");
      for (const pattern of OBSOLETE) {
        expect(pattern.test(text), `${file} contains obsolete phrasing matching ${pattern}`).toBe(false);
      }
    }
  });
});
