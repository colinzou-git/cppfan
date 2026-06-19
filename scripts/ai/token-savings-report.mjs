#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const args = process.argv.slice(2);
const metricsFlag = args.indexOf("--metrics");
const usageFlag = args.indexOf("--usage");
const jsonOutput = args.includes("--json");
const metricsPath = metricsFlag >= 0 ? args[metricsFlag + 1] : ".ai/repo-map.token-metrics.jsonl";
const usagePath = usageFlag >= 0 ? args[usageFlag + 1] : ".ai/repo-map.provider-usage.jsonl";

async function readJsonLines(path) {
  try {
    const text = await readFile(path, "utf8");
    return text
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

function sum(records, field) {
  return records.reduce((total, record) => total + (Number(record[field]) || 0), 0);
}

function percentSaved(baseline, actual) {
  return baseline > 0 ? ((baseline - actual) / baseline) * 100 : 0;
}

function formatNumber(value) {
  return Math.round(value).toLocaleString();
}

const queryEvents = await readJsonLines(metricsPath);
const usageRecords = await readJsonLines(usagePath);
const estimatedQueryTokens = sum(queryEvents, "estimatedQueryTokens");
const estimatedMatchedFileTokens = sum(queryEvents, "estimatedMatchedFileTokens");
const estimatedAvoidedVsMatchedFiles = sum(queryEvents, "estimatedAvoidedVsMatchedFiles");
const estimatedRepositoryTokens = sum(queryEvents, "estimatedRepositoryTokens");
const estimatedAvoidedVsRepository = sum(queryEvents, "estimatedAvoidedVsRepository");

const comparisons = [];
const groups = new Map();
for (const record of usageRecords) {
  const key = `${record.task}\u0000${record.provider}\u0000${record.unit}`;
  const group = groups.get(key) ?? { task: record.task, provider: record.provider, unit: record.unit };
  group[record.variant] = record;
  groups.set(key, group);
}

for (const group of groups.values()) {
  if (!group.baseline || !group.indexed) continue;
  const baseline = Number(group.baseline.value);
  const indexed = Number(group.indexed.value);
  comparisons.push({
    task: group.task,
    provider: group.provider,
    unit: group.unit,
    baseline,
    indexed,
    saved: baseline - indexed,
    percentSaved: percentSaved(baseline, indexed)
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  estimateMethod: "characters-divided-by-4",
  estimatedNavigation: {
    queries: queryEvents.length,
    compactQueryTokens: estimatedQueryTokens,
    matchedFileBaselineTokens: estimatedMatchedFileTokens,
    avoidedVsMatchedFiles: estimatedAvoidedVsMatchedFiles,
    percentSavedVsMatchedFiles: percentSaved(estimatedMatchedFileTokens, estimatedQueryTokens),
    wholeRepositoryBaselineTokens: estimatedRepositoryTokens,
    avoidedVsWholeRepository: estimatedAvoidedVsRepository,
    percentSavedVsWholeRepository: percentSaved(estimatedRepositoryTokens, estimatedQueryTokens)
  },
  controlledComparisons: comparisons
};

if (jsonOutput) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

console.log("AI token-savings report");
console.log("=======================");
console.log("");
console.log("Estimated index-navigation savings");
console.log(`Queries observed:                 ${formatNumber(queryEvents.length)}`);
console.log(`Compact query output:             ~${formatNumber(estimatedQueryTokens)} tokens`);
console.log(`Matched-file read baseline:       ~${formatNumber(estimatedMatchedFileTokens)} tokens`);
console.log(`Estimated tokens avoided:         ~${formatNumber(estimatedAvoidedVsMatchedFiles)} tokens`);
console.log(`Estimated reduction:              ${report.estimatedNavigation.percentSavedVsMatchedFiles.toFixed(1)}%`);
console.log("");
console.log("The estimate compares compact index output with reading every source file returned by those queries.");
console.log("It is not a provider bill and does not include files the agent later opens intentionally.");

if (comparisons.length > 0) {
  console.log("");
  console.log("Controlled provider comparisons");
  for (const comparison of comparisons) {
    console.log(
      `- ${comparison.task} / ${comparison.provider}: ${comparison.baseline} -> ${comparison.indexed} ` +
        `${comparison.unit}; saved ${comparison.saved} (${comparison.percentSaved.toFixed(1)}%)`
    );
  }
} else {
  console.log("");
  console.log("No controlled baseline/indexed provider comparisons have been recorded yet.");
  console.log("Use scripts/ai/record-ai-usage.mjs after comparable fresh-session runs.");
}
