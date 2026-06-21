import { describe, expect, it } from "vitest";
import {
  getDefaultRemediationAction,
  getRemediationRuleForTag
} from "@/features/code-lab/error-remediation-rules";

describe("error remediation rules", () => {
  it("maps key tags to expected actions", () => {
    expect(getRemediationRuleForTag("dsa.binary_search.boundary_update")?.action).toBe(
      "use_boundary_checklist"
    );
    expect(getRemediationRuleForTag("cpp.recursion.missing_base_case")?.action).toBe(
      "try_completion_item"
    );
    expect(getRemediationRuleForTag("dsa.graphs.missing_visited")?.action).toBe("trace_with_ai");
    expect(getRemediationRuleForTag("cpp.compile.syntax")?.action).toBe("review_related_skill");
  });

  it("provides learner-facing title and reason", () => {
    const rule = getRemediationRuleForTag("cpp.loop.off_by_one");
    expect(rule?.title.length).toBeGreaterThan(0);
    expect(rule?.reason.length).toBeGreaterThan(0);
  });

  it("falls back to retry_code_lab for tags without a rule", () => {
    expect(getDefaultRemediationAction("cpp.references.copy_vs_alias")).toBe("retry_code_lab");
  });
});
