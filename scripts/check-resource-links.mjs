#!/usr/bin/env node
// Resource-link checker (#176). Collects every external URL referenced by the
// resource catalog and the interview problem catalog and probes each one. It is
// deliberately tolerant of temporary network failures (timeouts / DNS / resets
// are reported as "unverified", never as failures) but reports definitively
// stale links (4xx) and exits non-zero only for those, so a flaky network never
// breaks the check while a removed page still surfaces.
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Repo root — from this module's location when available, else the cwd. */
function repoRootDir() {
  try {
    return resolve(fileURLToPath(new URL("..", import.meta.url)));
  } catch {
    return process.cwd();
  }
}

const SOURCES = [
  "src/features/resources/resource-catalog.ts",
  "src/features/interview/problem-catalog.ts"
];

/** Collect unique http(s) URLs referenced as `url: "..."` in the given sources. */
export async function collectResourceUrls(sources = SOURCES) {
  const repoRoot = repoRootDir();
  const urls = new Set();
  for (const relative of sources) {
    const text = await readFile(resolve(repoRoot, relative), "utf8");
    for (const match of text.matchAll(/url:\s*"(https?:\/\/[^"]+)"/g)) {
      urls.add(match[1]);
    }
  }
  return [...urls].sort();
}

/**
 * Classify an HTTP status into the checker's verdicts. 4xx (except 429 rate
 * limiting) is "stale"; everything else reachable is "ok".
 */
export function classifyStatus(status) {
  if (status === 429) return "unverified";
  if (status >= 400 && status < 500) return "stale";
  return "ok";
}

async function probe(url, timeoutMs = 10_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const attempt = async (method) =>
    fetch(url, { method, redirect: "follow", signal: controller.signal, headers: { "user-agent": "cppfan-link-checker" } });
  try {
    let response = await attempt("HEAD");
    // Some hosts reject/!allow HEAD; retry with GET before trusting a 4xx.
    if (response.status >= 400 && response.status < 500 && response.status !== 410) {
      response = await attempt("GET");
    }
    return { url, verdict: classifyStatus(response.status), status: response.status };
  } catch (error) {
    return { url, verdict: "unverified", status: null, reason: error?.name ?? "network_error" };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const urls = await collectResourceUrls();
  const results = [];
  // Bounded concurrency so the check stays polite to external hosts.
  const queue = [...urls];
  const workers = Array.from({ length: 8 }, async () => {
    for (;;) {
      const url = queue.shift();
      if (!url) return;
      results.push(await probe(url));
    }
  });
  await Promise.all(workers);

  const stale = results.filter((r) => r.verdict === "stale");
  const unverified = results.filter((r) => r.verdict === "unverified");
  const ok = results.filter((r) => r.verdict === "ok");

  for (const r of stale) console.error(`STALE  ${r.status}  ${r.url}`);
  for (const r of unverified) console.warn(`UNVERIFIED  ${r.reason ?? r.status}  ${r.url}`);
  console.log(`Resource links: ${urls.length} checked — ${ok.length} ok, ${unverified.length} unverified (tolerated), ${stale.length} stale.`);

  process.exit(stale.length > 0 ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("check-resource-links.mjs")) {
  await main();
}
