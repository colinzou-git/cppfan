import type { CodeTagClassification } from "./code-error-tags";
import type { CodeTestResult } from "./code-lab-types";
import type { BoundaryChecklist } from "./boundary-checklist-types";

/**
 * Deterministic test-failure classifier (#412). Maps failed VISIBLE tests to
 * stable tags using item skill tags / boundary checklists and the failing test
 * name. Conservative and pattern-based; never throws and never reads hidden test
 * details (those are not present on the result anyway).
 */

type Category = "binary_search" | "graphs" | "dp" | "arrays";

function categoriesFor(skillTags: string[], checklists: BoundaryChecklist[]): Set<Category> {
  const found = new Set<Category>();
  const haystack = [
    ...skillTags,
    ...checklists.map((checklist) => checklist.id)
  ]
    .join(" ")
    .toLowerCase();

  if (/binary_search|binary search/.test(haystack)) found.add("binary_search");
  if (/graph|\bbfs\b|\bdfs\b/.test(haystack)) found.add("graphs");
  if (/\bdp\b|dynamic/.test(haystack)) found.add("dp");
  if (/array|vector|traversal/.test(haystack)) found.add("arrays");
  return found;
}

export function classifyVisibleTestFailures(input: {
  testResults: CodeTestResult[];
  skillTags: string[];
  boundaryChecklists?: BoundaryChecklist[];
}): CodeTagClassification[] {
  const categories = categoriesFor(input.skillTags, input.boundaryChecklists ?? []);
  const out: CodeTagClassification[] = [];

  for (const result of input.testResults) {
    for (const test of result.visible) {
      if (test.passed) continue;
      const name = test.name.toLowerCase();

      if (categories.has("binary_search") && /dup|first|last|boundary|occurrence/.test(name)) {
        out.push({
          tag: "dsa.binary_search.boundary_update",
          source: "test",
          confidence: "medium",
          message: "A binary-search boundary case failed — check how lo/hi update around duplicates."
        });
      }
      if (categories.has("graphs") && /visit|seen|repeat|cycle|revisit/.test(name)) {
        out.push({
          tag: "dsa.graphs.missing_visited",
          source: "test",
          confidence: "medium",
          message: "A graph traversal case failed — a visited set may be missing or misused."
        });
      }
      if (categories.has("dp") && /base|smallest|n ?= ?0|n ?= ?1|empty/.test(name)) {
        out.push({
          tag: "dsa.dp.bad_base_case",
          source: "test",
          confidence: "medium",
          message: "A DP base-case test failed — check the smallest-input base case."
        });
      }
      if (categories.has("arrays") && /empty|one element|single|first|last|boundary/.test(name)) {
        out.push({
          tag: "cpp.loop.off_by_one",
          source: "test",
          confidence: "low",
          message: "A boundary test failed — check the first/last element handling in your loop."
        });
      }
    }
  }

  return out;
}
