#!/usr/bin/env node

import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const event = process.argv[2] ?? "manual";
const strict = process.argv.includes("--strict");

if (process.env.CPPFAN_SKIP_CODE_INDEX === "1") {
  console.log(`[code-index] skipped after ${event}: CPPFAN_SKIP_CODE_INDEX=1`);
  process.exit(0);
}

const rootResult = spawnSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"]
});

if (rootResult.status !== 0) {
  console.log(`[code-index] skipped after ${event}: not inside a Git worktree`);
  process.exit(0);
}

const repositoryRoot = rootResult.stdout.trim();
const typescriptPackage = join(repositoryRoot, "node_modules", "typescript", "package.json");
const indexer = join(repositoryRoot, "scripts", "ai", "code-index.mjs");

if (!existsSync(indexer)) {
  console.log(`[code-index] skipped after ${event}: indexer is unavailable`);
  process.exit(0);
}

if (!existsSync(typescriptPackage)) {
  console.log(`[code-index] skipped after ${event}: run pnpm install first`);
  process.exit(0);
}

const result = spawnSync(process.execPath, [indexer], {
  cwd: repositoryRoot,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"]
});

if (result.status === 0) {
  const summary = result.stdout.trim();
  console.log(`[code-index] refreshed after ${event}${summary ? ` — ${summary}` : ""}`);
  process.exit(0);
}

const details = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
console.warn(`[code-index] refresh failed after ${event}${details ? `\n${details}` : ""}`);
process.exit(strict ? result.status ?? 1 : 0);
