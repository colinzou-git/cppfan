#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const args = process.argv.slice(2);
const divider = args.indexOf("--");
if (divider < 1 || divider === args.length - 1) {
  console.error("Usage: node scripts/ai/quiet-run.mjs <label> -- <command> [args...]");
  process.exit(2);
}

const label = args.slice(0, divider).join(" ");
const [rawCommand, ...commandArgs] = args.slice(divider + 1);
const command = process.platform === "win32" && ["npm", "npx", "pnpm", "yarn"].includes(rawCommand)
  ? `${rawCommand}.cmd`
  : rawCommand;
const logPath = resolve(".ai", "repomix-output.quiet.log");
const startedAt = Date.now();
const result = spawnSync(command, commandArgs, { cwd: process.cwd(), env: process.env, encoding: "utf8" });
const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

mkdirSync(dirname(logPath), { recursive: true });
writeFileSync(logPath, output, "utf8");
const duration = ((Date.now() - startedAt) / 1000).toFixed(1);
const shortLogPath = relative(process.cwd(), logPath);

if (result.status === 0) {
  console.log(`PASS ${label} (${duration}s) — full log: ${shortLogPath}`);
  process.exit(0);
}

console.error(`FAIL ${label} (${duration}s, exit ${result.status ?? "unknown"})`);
const tail = output.trimEnd().split(/\r?\n/).slice(-80).join("\n");
if (tail) console.error(tail);
console.error(`Full log: ${shortLogPath}`);
process.exit(result.status ?? 1);
