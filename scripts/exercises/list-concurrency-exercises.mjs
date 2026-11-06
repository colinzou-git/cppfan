#!/usr/bin/env node
// List all native concurrency exercise IDs using stable package metadata (#707).
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function listConcurrencyExercises(root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")) {
  const base = join(root, "exercises");
  const ids = [];
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "_harness") continue;
    const dir = join(base, entry.name);
    const manifest = join(dir, "exercise.json");
    if (!existsSync(manifest)) continue;
    const data = JSON.parse(readFileSync(manifest, "utf8"));
    if (data.id !== entry.name) {
      throw new Error(`Exercise metadata ID mismatch in ${manifest}: ${data.id}`);
    }
    if (!Array.isArray(data.skill_ids)) {
      throw new Error(`Missing skill_ids in ${manifest}`);
    }
    if (!data.skill_ids.some((id) => typeof id === "string" && id.startsWith("cpp.concurrency."))) continue;
    if (!existsSync(join(dir, "tests", "tests.cpp")) || !existsSync(join(dir, "solution"))) {
      throw new Error(`Concurrency exercise ${data.id} lacks tests or a reference solution`);
    }
    ids.push(data.id);
  }
  if (ids.length === 0) throw new Error("No concurrency exercise manifests found; refusing to skip TSan");
  return ids.sort();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  for (const id of listConcurrencyExercises()) console.log(id);
}
