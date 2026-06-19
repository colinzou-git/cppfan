#!/usr/bin/env node

import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function git(args) {
  return spawnSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

if (process.env.CI) {
  console.log("[code-index] hook setup skipped in CI");
  process.exit(0);
}

const worktree = git(["rev-parse", "--is-inside-work-tree"]);
const rootResult = git(["rev-parse", "--show-toplevel"]);
if (worktree.status !== 0 || worktree.stdout.trim() !== "true" || rootResult.status !== 0) {
  console.log("[code-index] hook setup skipped outside a Git worktree");
  process.exit(0);
}

const current = git(["config", "--local", "--get", "core.hooksPath"]);
const currentPath = current.status === 0 ? current.stdout.trim() : "";

if (currentPath && currentPath !== ".githooks") {
  console.warn(`[code-index] existing Git hook path preserved: ${currentPath}`);
  process.exit(0);
}

const configured = git(["config", "--local", "core.hooksPath", ".githooks"]);
if (configured.status !== 0) {
  console.warn(configured.stderr.trim() || "[code-index] unable to configure Git hooks");
  process.exit(0);
}

console.log("[code-index] automatic refresh hooks enabled");

const repositoryRoot = rootResult.stdout.trim();
const refreshScript = join(repositoryRoot, "scripts", "ai", "refresh-code-index.mjs");
if (existsSync(refreshScript)) {
  spawnSync(process.execPath, [refreshScript, "hook-enable"], {
    cwd: repositoryRoot,
    stdio: "inherit"
  });
}
