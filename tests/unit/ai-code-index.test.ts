import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("AI code index tooling", () => {
  it("indexes and queries repository symbols", () => {
    const directory = mkdtempSync(join(tmpdir(), "cppfan-code-index-"));
    temporaryDirectories.push(directory);
    const indexPath = join(directory, "index.json");

    const buildOutput = execFileSync(process.execPath, ["scripts/ai/code-index.mjs", indexPath], {
      cwd: process.cwd(),
      encoding: "utf8"
    });
    const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
      summary: { files: number; symbols: number; imports: number };
      symbols: Array<{ name: string; path: string }>;
    };

    expect(buildOutput).toMatch(/Indexed \d+ files/);
    expect(index.summary.files).toBeGreaterThan(0);
    expect(index.summary.symbols).toBeGreaterThan(0);
    expect(index.summary.imports).toBeGreaterThan(0);
    expect(index.symbols).toContainEqual(
      expect.objectContaining({ name: "getExerciseById", path: "src/features/exercises/exercise-catalog.ts" })
    );

    const queryOutput = execFileSync(
      process.execPath,
      ["scripts/ai/query-code-index.mjs", "getExerciseById", "--index", indexPath],
      { cwd: process.cwd(), encoding: "utf8" }
    );

    expect(queryOutput).toContain("getExerciseById");
    expect(queryOutput).toContain("src/features/exercises/exercise-catalog.ts");
  }, 20_000);
});
