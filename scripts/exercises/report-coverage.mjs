#!/usr/bin/env node
/*
 * Generate the finite coverage report for the write-code exercise catalog (#473).
 *
 * Reads the shared coverage-area spec (exercise-coverage-areas.json) and every
 * on-disk exercises/<id>/exercise.json package, then:
 *   - prints a concise coverage table;
 *   - writes docs/EXERCISE_CATALOG_COVERAGE.md deterministically;
 *   - emits duplicate/quality diagnostics as warnings;
 *   - exits nonzero ONLY when a required area is below its floor (a hard gap),
 *     so the catalog can never quietly regress below meaningful representation.
 *
 * Usage:
 *   node scripts/exercises/report-coverage.mjs           # regenerate the doc
 *   node scripts/exercises/report-coverage.mjs --check    # fail if out of date
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AREAS_PATH = join(ROOT, "src", "features", "exercises", "exercise-coverage-areas.json");
const EXERCISES_DIR = join(ROOT, "exercises");
const DOC_PATH = join(ROOT, "docs", "EXERCISE_CATALOG_COVERAGE.md");
const MIN_TESTS = 4;

function loadAreas() {
  return JSON.parse(readFileSync(AREAS_PATH, "utf8"));
}

function loadExercises() {
  return readdirSync(EXERCISES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "_harness")
    .map((d) => {
      try {
        return JSON.parse(readFileSync(join(EXERCISES_DIR, d.name, "exercise.json"), "utf8"));
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .map((raw) => ({
      id: raw.id,
      title: raw.title ?? "",
      skillIds: raw.skill_ids ?? [],
      difficulty: raw.difficulty ?? "",
      requiredTests: raw.required_tests ?? []
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function matches(exercise, prefixes) {
  return exercise.skillIds.some((s) => prefixes.some((p) => s === p || s.startsWith(`${p}.`)));
}

function buildReport(areas, exercises) {
  return areas.map((area) => {
    const ids = exercises.filter((e) => matches(e, area.skillPrefixes)).map((e) => e.id).sort();
    return {
      areaId: area.id,
      title: area.title,
      minimumExercises: area.minimumExercises,
      exerciseIds: ids,
      count: ids.length,
      gap: Math.max(0, area.minimumExercises - ids.length)
    };
  });
}

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function buildDiagnostics(areas, exercises) {
  const out = [];
  const byTitle = new Map();
  for (const e of exercises) {
    const k = normalizeTitle(e.title);
    byTitle.set(k, [...(byTitle.get(k) ?? []), e.id]);
  }
  for (const [k, ids] of byTitle) if (ids.length > 1) out.push(`duplicate_title: "${k}" → ${ids.sort().join(", ")}`);

  const bySkill = new Map();
  for (const e of exercises) {
    const k = [...e.skillIds].sort().join("|");
    bySkill.set(k, [...(bySkill.get(k) ?? []), e.id]);
  }
  for (const [k, ids] of bySkill) {
    if (ids.length > 3) out.push(`near_duplicate_skill_set: ${ids.length} share [${k}] → ${ids.sort().join(", ")}`);
  }

  for (const e of exercises) {
    if (e.requiredTests.length < MIN_TESTS) out.push(`too_few_tests: ${e.id} has ${e.requiredTests.length} (< ${MIN_TESTS})`);
  }

  const uncovered = exercises.filter((e) => !areas.some((a) => matches(e, a.skillPrefixes))).map((e) => e.id);
  if (uncovered.length > 0) out.push(`uncovered_exercise: ${uncovered.sort().join(", ")}`);
  return out;
}

function renderDoc(report, diagnostics, total) {
  const lines = [];
  lines.push("# Exercise Catalog Coverage");
  lines.push("");
  lines.push("Generated from the on-disk `exercises/<id>/exercise.json` packages by");
  lines.push("`scripts/exercises/report-coverage.mjs` (#473). Do not edit manually — run");
  lines.push("`pnpm report:exercise-coverage` to regenerate.");
  lines.push("");
  lines.push(`Current catalog: **${total}** exercises across **${report.length}** required areas.`);
  lines.push("");
  lines.push("| Area | Minimum | Current | Gap |");
  lines.push("|---|---:|---:|---:|");
  for (const r of report) {
    lines.push(`| ${r.title} | ${r.minimumExercises} | ${r.count} | ${r.gap} |`);
  }
  lines.push("");
  lines.push("## Exercises by area");
  lines.push("");
  for (const r of report) {
    lines.push(`### ${r.title}`);
    lines.push("");
    for (const id of r.exerciseIds) lines.push(`- \`${id}\``);
    lines.push("");
  }
  lines.push("## Diagnostics (advisory)");
  lines.push("");
  if (diagnostics.length === 0) {
    lines.push("No duplicate/quality diagnostics.");
  } else {
    for (const d of diagnostics) lines.push(`- ${d}`);
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  const check = process.argv.includes("--check");
  const areas = loadAreas();
  const exercises = loadExercises();
  const report = buildReport(areas, exercises);
  const diagnostics = buildDiagnostics(areas, exercises);
  const doc = renderDoc(report, diagnostics, exercises.length);

  // Console table.
  for (const r of report) {
    const flag = r.gap > 0 ? `GAP ${r.gap}` : "ok";
    console.log(`${r.gap > 0 ? "✗" : "✓"} ${r.title.padEnd(56)} ${String(r.count).padStart(3)} / ${r.minimumExercises}  ${flag}`);
  }
  console.log(`\n${exercises.length} exercises · ${diagnostics.length} diagnostic(s)`);

  const gaps = report.filter((r) => r.gap > 0);

  if (check) {
    let current = "";
    try {
      current = readFileSync(DOC_PATH, "utf8");
    } catch {
      current = "";
    }
    if (current !== doc) {
      console.error("\nEXERCISE_CATALOG_COVERAGE.md is out of date. Run: pnpm report:exercise-coverage");
      process.exitCode = 1;
      return;
    }
  } else {
    writeFileSync(DOC_PATH, doc);
    console.log(`\nWrote ${DOC_PATH}`);
  }

  if (gaps.length > 0) {
    console.error(`\n${gaps.length} required area(s) below floor: ${gaps.map((g) => g.areaId).join(", ")}`);
    process.exitCode = 1;
  }
}

main();
