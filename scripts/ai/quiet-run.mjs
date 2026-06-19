#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

const args = process.argv.slice(2);
const divider = args.indexOf("--");

if (divider < 1 || divider === args.length - 1) {
  console.error("Usage: node scripts/ai/quiet-run.mjs <label> -- <command> [args...]");
  process.exit(2);
}

const label = args.slice(0, divider).join(" ");
const [rawCommand, ...commandArgs] = args.slice(divider + 1);
const safeLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "command";
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const logPath = resolve(".ai", "logs", `${timestamp}-${safeLabel}.log`);
const startedAt = Date.now();
const stdout = [];
const stderr = [];

const windowsCommands = new Set(["npm", "npx", "pnpm", "yarn"]);
const command = process.platform === "win32" && windowsCommands.has(rawCommand) ? `${rawCommand}.cmd` : rawCommand;

await mkdir(dirname(logPath), { recursive: true });

const child = spawn(command, commandArgs, {
  cwd: process.cwd(),
  env: process.env,
  shell: false,
  stdio: ["inherit", "pipe", "pipe"]
});

child.stdout.on("data", (chunk) => stdout.push(chunk.toString()));
child.stderr.on("data", (chunk) => stderr.push(chunk.toString()));

child.on("error", async (error) => {
  const message = `Unable to start ${command}: ${error.message}\n`;
  await writeFile(logPath, message, "utf8");
  console.error(`FAIL ${label} — ${message.trim()}`);
  console.error(`Full log: ${relative(process.cwd(), logPath)}`);
  process.exit(1);
});

child.on("close", async (code, signal) => {
  const duration = ((Date.now() - startedAt) / 1000).toFixed(1);
  const output = [
    `$ ${[rawCommand, ...commandArgs].join(" ")}`,
    "",
    "--- stdout ---",
    stdout.join(""),
    "--- stderr ---",
    stderr.join("")
  ].join("\n");

  await writeFile(logPath, output, "utf8");
  const shortLogPath = relative(process.cwd(), logPath);

  if (code === 0) {
    console.log(`PASS ${label} (${duration}s) — full log: ${shortLogPath}`);
    return;
  }

  const lines = `${stdout.join("")}\n${stderr.join("")}`.trimEnd().split(/\r?\n/);
  const tail = lines.slice(-80).join("\n");
  console.error(`FAIL ${label} (${duration}s, exit ${code ?? "signal"}${signal ? `, ${signal}` : ""})`);
  if (tail) {
    console.error(tail);
  }
  console.error(`Full log: ${shortLogPath}`);
  process.exit(code ?? 1);
});
