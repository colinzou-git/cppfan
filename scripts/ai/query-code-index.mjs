#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const args = process.argv.slice(2);
const query = args.find((argument) => !argument.startsWith("--"));
const indexFlag = args.indexOf("--index");
const limitFlag = args.indexOf("--limit");
const indexPath = indexFlag >= 0 ? args[indexFlag + 1] : ".ai/repo-map.code-index.json";
const limit = limitFlag >= 0 ? Number(args[limitFlag + 1]) : 25;

if (!query) {
  console.error("Usage: node scripts/ai/query-code-index.mjs <text> [--limit N] [--index path]");
  process.exit(2);
}

let index;
try {
  index = JSON.parse(await readFile(indexPath, "utf8"));
} catch {
  console.error(`Code index not found at ${indexPath}. Run: node scripts/ai/code-index.mjs`);
  process.exit(1);
}

const needle = query.toLowerCase();
const results = [];

for (const symbol of index.symbols ?? []) {
  const searchable = `${symbol.name} ${symbol.kind} ${symbol.path}`.toLowerCase();
  if (searchable.includes(needle)) {
    const score = symbol.name.toLowerCase() === needle ? 0 : symbol.name.toLowerCase().startsWith(needle) ? 1 : 2;
    results.push({ score, text: `symbol ${symbol.name} (${symbol.kind}) ${symbol.path}:${symbol.line}${symbol.exported ? " exported" : ""}` });
  }
}

for (const imported of index.imports ?? []) {
  const searchable = `${imported.module} ${imported.path}`.toLowerCase();
  if (searchable.includes(needle)) {
    const score = imported.module.toLowerCase() === needle ? 0 : imported.module.toLowerCase().startsWith(needle) ? 1 : 3;
    results.push({ score, text: `import ${imported.module} <- ${imported.path}` });
  }
}

for (const filePath of index.files ?? []) {
  if (filePath.toLowerCase().includes(needle)) results.push({ score: 4, text: `file ${filePath}` });
}

results.sort((left, right) => left.score - right.score || left.text.localeCompare(right.text));
const selected = results.slice(0, Number.isFinite(limit) && limit > 0 ? limit : 25);

if (selected.length === 0) console.log(`No code-index matches for: ${query}`);
else {
  for (const result of selected) console.log(result.text);
  if (results.length > selected.length) console.log(`... ${results.length - selected.length} more matches`);
}
