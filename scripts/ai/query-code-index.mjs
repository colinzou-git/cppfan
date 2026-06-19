#!/usr/bin/env node

import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";

const args = process.argv.slice(2);
const query = args.find((argument) => !argument.startsWith("--"));
const indexFlag = args.indexOf("--index");
const limitFlag = args.indexOf("--limit");
const indexPath = indexFlag >= 0 ? args[indexFlag + 1] : ".ai/repo-map.code-index.json";
const limit = limitFlag >= 0 ? Number(args[limitFlag + 1]) : 25;
const metricsPath = process.env.CPPFAN_TOKEN_METRICS_PATH ?? ".ai/repo-map.token-metrics.jsonl";

function estimateTokens(characters) {
  return Math.ceil(characters / 4);
}

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
    results.push({
      score,
      path: symbol.path,
      text: `symbol ${symbol.name} (${symbol.kind}) ${symbol.path}:${symbol.line}${symbol.exported ? " exported" : ""}`
    });
  }
}

for (const imported of index.imports ?? []) {
  const searchable = `${imported.module} ${imported.path}`.toLowerCase();
  if (searchable.includes(needle)) {
    const score = imported.module.toLowerCase() === needle ? 0 : imported.module.toLowerCase().startsWith(needle) ? 1 : 3;
    results.push({ score, path: imported.path, text: `import ${imported.module} <- ${imported.path}` });
  }
}

for (const filePath of index.files ?? []) {
  if (filePath.toLowerCase().includes(needle)) results.push({ score: 4, path: filePath, text: `file ${filePath}` });
}

results.sort((left, right) => left.score - right.score || left.text.localeCompare(right.text));
const selected = results.slice(0, Number.isFinite(limit) && limit > 0 ? limit : 25);
const outputLines = selected.map((result) => result.text);
if (results.length > selected.length) outputLines.push(`... ${results.length - selected.length} more matches`);

if (selected.length === 0) console.log(`No code-index matches for: ${query}`);
else for (const line of outputLines) console.log(line);

if (process.env.CPPFAN_DISABLE_TOKEN_METRICS !== "1") {
  const fileStats = new Map((index.fileStats ?? []).map((entry) => [entry.path, entry]));
  const selectedPaths = [...new Set(selected.map((result) => result.path).filter(Boolean))];
  const matchedFileTokens = selectedPaths.reduce(
    (total, filePath) => total + (fileStats.get(filePath)?.estimatedTokens ?? 0),
    0
  );
  const outputText = outputLines.join("\n");
  const queryTokens = estimateTokens(outputText.length);
  const repositoryTokens = index.summary?.estimatedTokens ?? 0;
  const event = {
    timestamp: new Date().toISOString(),
    query,
    limit: Number.isFinite(limit) ? limit : 25,
    matches: results.length,
    returned: selected.length,
    matchedFiles: selectedPaths.length,
    estimatedQueryTokens: queryTokens,
    estimatedMatchedFileTokens: matchedFileTokens,
    estimatedRepositoryTokens: repositoryTokens,
    estimatedAvoidedVsMatchedFiles: Math.max(0, matchedFileTokens - queryTokens),
    estimatedAvoidedVsRepository: Math.max(0, repositoryTokens - queryTokens),
    estimateMethod: "characters-divided-by-4"
  };

  try {
    await mkdir(dirname(metricsPath), { recursive: true });
    await appendFile(metricsPath, `${JSON.stringify(event)}\n`, "utf8");
  } catch {
    // Metrics must never interfere with navigation.
  }
}
