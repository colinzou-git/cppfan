import { describe, expect, it } from "vitest";
import {
  classifyCodeAttempt,
  dedupeClassifications,
  pickPrimaryCodeErrorTag
} from "@/features/code-lab/code-error-classifier";
import type { CodeRunResult, CodeTestResult } from "@/features/code-lab/code-lab-types";
import type { CodeTagClassification } from "@/features/code-lab/code-error-tags";

const compileRun: CodeRunResult = {
  status: "compile_error",
  compileOutput: "error: expected ';' before 'return'",
  stdout: "",
  stderr: "",
  exitCode: 1,
  timedOut: false,
  durationMs: 1,
  memoryKb: null,
  provider: "mock",
  simulated: true
};

describe("dedupeClassifications", () => {
  it("keeps the highest-confidence entry per tag+source", () => {
    const items: CodeTagClassification[] = [
      { tag: "cpp.loop.off_by_one", source: "test", confidence: "low", message: "a" },
      { tag: "cpp.loop.off_by_one", source: "test", confidence: "medium", message: "b" }
    ];
    const deduped = dedupeClassifications(items);
    expect(deduped).toHaveLength(1);
    expect(deduped[0].confidence).toBe("medium");
  });
});

describe("pickPrimaryCodeErrorTag", () => {
  it("prefers a deterministic source over AI, then confidence", () => {
    const primary = pickPrimaryCodeErrorTag([
      { tag: "cpp.loop.off_by_one", source: "ai", confidence: "high", message: "" },
      { tag: "cpp.compile.syntax", source: "compiler", confidence: "high", message: "" }
    ]);
    expect(primary?.source).toBe("compiler");
  });

  it("returns null for no items", () => {
    expect(pickPrimaryCodeErrorTag([])).toBeNull();
  });
});

describe("classifyCodeAttempt", () => {
  it("classifies a compile error from a run result", () => {
    const { classifications, primary } = classifyCodeAttempt({ runResult: compileRun });
    expect(classifications.map((c) => c.tag)).toContain("cpp.compile.syntax");
    expect(primary?.source).toBe("compiler");
  });

  it("classifies test failures with skill context", () => {
    const test: CodeTestResult = {
      status: "ok",
      passed: 0,
      total: 1,
      visible: [{ name: "first occurrence of duplicate", passed: false, hidden: false }],
      hiddenPassed: 0,
      hiddenTotal: 0,
      compileOutput: "",
      provider: "mock",
      simulated: true
    };
    const { classifications } = classifyCodeAttempt({
      testResult: test,
      skillTags: ["dsa.searching.binary_search_on_array"]
    });
    expect(classifications.map((c) => c.tag)).toContain("dsa.binary_search.boundary_update");
  });

  it("never throws and returns empty for a clean run", () => {
    const clean: CodeRunResult = { ...compileRun, status: "success", compileOutput: "", exitCode: 0 };
    expect(classifyCodeAttempt({ runResult: clean }).classifications).toEqual([]);
  });
});
