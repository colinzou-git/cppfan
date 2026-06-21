import { describe, expect, it } from "vitest";
import { classifyVisibleTestFailures } from "@/features/code-lab/test-failure-classifier";
import type { CodeTestResult, CodeTestCaseResult } from "@/features/code-lab/code-lab-types";

function result(visible: CodeTestCaseResult[]): CodeTestResult {
  return {
    status: "ok",
    passed: 0,
    total: visible.length,
    visible,
    hiddenPassed: 0,
    hiddenTotal: 0,
    compileOutput: "",
    provider: "mock",
    simulated: true
  };
}

const failed = (name: string): CodeTestCaseResult => ({ name, passed: false, hidden: false });

describe("classifyVisibleTestFailures", () => {
  it("tags a binary-search duplicate boundary failure", () => {
    const tags = classifyVisibleTestFailures({
      testResults: [result([failed("duplicate values (first occurrence)")])],
      skillTags: ["dsa.searching.binary_search_on_array"]
    });
    expect(tags.map((t) => t.tag)).toContain("dsa.binary_search.boundary_update");
    expect(tags[0].source).toBe("test");
  });

  it("tags a graph visited failure", () => {
    const tags = classifyVisibleTestFailures({
      testResults: [result([failed("revisits a cycle node")])],
      skillTags: ["dsa.graphs.bfs"]
    });
    expect(tags.map((t) => t.tag)).toContain("dsa.graphs.missing_visited");
  });

  it("tags a DP base-case failure", () => {
    const tags = classifyVisibleTestFailures({
      testResults: [result([failed("smallest input base case")])],
      skillTags: ["dsa.dp.base_case"]
    });
    expect(tags.map((t) => t.tag)).toContain("dsa.dp.bad_base_case");
  });

  it("does not tag passing tests or unrelated skills", () => {
    const tags = classifyVisibleTestFailures({
      testResults: [result([{ name: "duplicate values", passed: true, hidden: false }])],
      skillTags: ["dsa.searching.binary_search_on_array"]
    });
    expect(tags).toEqual([]);
  });
});
