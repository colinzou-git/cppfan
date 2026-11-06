import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exerciseCatalog } from "@/features/exercises/exercise-catalog";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("ThreadSanitizer concurrency CI integrity (#707)", () => {
  it("discovers exactly the native concurrency packages via skill metadata", () => {
    const ids = execFileSync("node", ["scripts/exercises/list-concurrency-exercises.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8"
    }).trim().split("\n");
    const expected = exerciseCatalog
      .filter((ex) => ex.skillIds.some((id) => id.startsWith("cpp.concurrency.")))
      .map((ex) => ex.id)
      .sort();
    expect(ids).toEqual(expected);
    expect(ids.length).toBeGreaterThanOrEqual(9);
  });

  it("has a dedicated mandatory TSan gate, separate from ASan/UBSan", () => {
    const ci = read(".github/workflows/ci.yml");
    const checker = read("scripts/exercises/verify-concurrency-tsan.sh");
    const existing = read("scripts/exercises/verify-all.sh");
    expect(ci).toContain("name: C++ concurrency ThreadSanitizer");
    expect(ci).toContain("bash scripts/exercises/verify-concurrency-tsan.sh");
    expect(checker).toContain("-fsanitize=thread");
    expect(checker).not.toContain("-fsanitize=address");
    expect(checker).toContain("WARNING: ThreadSanitizer: data race");
    expect(checker).toContain("tsan-smoke.cpp");
    expect(checker).toContain("list-concurrency-exercises.mjs");
    expect(checker).toContain("timeout 45s");
    expect(existing).toContain("-fsanitize=address,undefined");
    expect(ci).toContain("bash scripts/exercises/verify-all.sh");
  });

  it("keeps the deliberate data race in a CI proof file only", () => {
    const fixture = read("scripts/exercises/tsan-smoke.cpp");
    expect(fixture).toContain("int shared = 0");
    expect(fixture).toContain("std::thread a(worker)");
    expect(fixture).toContain("std::thread b(worker)");
    expect(fixture).toContain("++shared");
  });
});
