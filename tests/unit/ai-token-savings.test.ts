import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const temporaryDirectories: string[] = [];
const projectRoot = process.cwd();

function temporaryDirectory() {
  const directory = mkdtempSync(join(tmpdir(), "cppfan-token-savings-"));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("AI token-savings observability", () => {
  it("logs query estimates and reports controlled comparisons", () => {
    const directory = temporaryDirectory();
    const indexPath = join(directory, "index.json");
    const metricsPath = join(directory, "metrics.jsonl");
    const usagePath = join(directory, "usage.jsonl");

    writeFileSync(
      indexPath,
      JSON.stringify({
        summary: { files: 2, symbols: 1, imports: 0, characters: 4000, estimatedTokens: 1000 },
        files: ["src/target.ts", "src/other.ts"],
        fileStats: [
          { path: "src/target.ts", characters: 1600, estimatedTokens: 400 },
          { path: "src/other.ts", characters: 2400, estimatedTokens: 600 }
        ],
        symbols: [{ name: "targetFunction", kind: "function", path: "src/target.ts", line: 3, exported: true }],
        imports: []
      }),
      "utf8"
    );

    const queryOutput = execFileSync(
      process.execPath,
      [join(projectRoot, "scripts", "ai", "query-code-index.mjs"), "targetFunction", "--index", indexPath],
      {
        cwd: projectRoot,
        env: { ...process.env, CPPFAN_TOKEN_METRICS_PATH: metricsPath },
        encoding: "utf8"
      }
    );

    expect(queryOutput).toContain("targetFunction");
    const metric = JSON.parse(readFileSync(metricsPath, "utf8").trim()) as {
      estimatedQueryTokens: number;
      estimatedMatchedFileTokens: number;
      estimatedAvoidedVsMatchedFiles: number;
    };
    expect(metric.estimatedQueryTokens).toBeGreaterThan(0);
    expect(metric.estimatedMatchedFileTokens).toBe(400);
    expect(metric.estimatedAvoidedVsMatchedFiles).toBeGreaterThan(0);

    const recorder = join(projectRoot, "scripts", "ai", "record-ai-usage.mjs");
    for (const [variant, value] of [
      ["baseline", "42000"],
      ["indexed", "27000"]
    ] as const) {
      execFileSync(
        process.execPath,
        [
          recorder,
          "--task",
          "issue-123",
          "--provider",
          "claude",
          "--variant",
          variant,
          "--value",
          value,
          "--unit",
          "tokens",
          "--output",
          usagePath
        ],
        { cwd: projectRoot, encoding: "utf8" }
      );
    }

    const report = execFileSync(
      process.execPath,
      [
        join(projectRoot, "scripts", "ai", "token-savings-report.mjs"),
        "--metrics",
        metricsPath,
        "--usage",
        usagePath
      ],
      { cwd: projectRoot, encoding: "utf8" }
    );

    expect(report).toContain("Estimated tokens avoided");
    expect(report).toContain("issue-123 / claude: 42000 -> 27000 tokens");
    expect(report).toContain("saved 15000 (35.7%)");
  });
});
