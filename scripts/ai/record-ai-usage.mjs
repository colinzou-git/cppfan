#!/usr/bin/env node

import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const args = process.argv.slice(2);

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
}

const task = valueAfter("--task");
const provider = valueAfter("--provider");
const variant = valueAfter("--variant");
const unit = valueAfter("--unit");
const value = Number(valueAfter("--value"));
const outputPath = valueAfter("--output") ?? process.env.CPPFAN_PROVIDER_USAGE_PATH ?? ".ai/repo-map.provider-usage.jsonl";

if (!task || !provider || !["baseline", "indexed"].includes(variant) || !unit || !Number.isFinite(value) || value < 0) {
  console.error(
    "Usage: node scripts/ai/record-ai-usage.mjs " +
      "--task <id> --provider <claude|codex> --variant <baseline|indexed> " +
      "--value <number> --unit <tokens|plan-percent> [--output path]"
  );
  process.exit(2);
}

const record = {
  timestamp: new Date().toISOString(),
  task,
  provider,
  variant,
  value,
  unit
};

await mkdir(dirname(outputPath), { recursive: true });
await appendFile(outputPath, `${JSON.stringify(record)}\n`, "utf8");
console.log(`Recorded ${provider} ${variant} usage for ${task}: ${value} ${unit}`);
