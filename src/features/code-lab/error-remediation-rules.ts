import type { CodeErrorTag } from "./code-error-tags";
import type { CodeRemediationAction, CodeRemediationRule } from "./error-remediation-types";

/**
 * Transparent tag → remediation rules (#414). Initial high-value mappings; each
 * rule names the action plus a learner-facing title/reason. Unknown/unmapped tags
 * produce no recommendation.
 */
const RULES: Record<string, CodeRemediationRule> = {
  "cpp.loop.off_by_one": {
    tag: "cpp.loop.off_by_one",
    action: "use_boundary_checklist",
    title: "Practice loop boundaries",
    reason: "Your loop bounds look off — work through first/last element cases."
  },
  "cpp.vector.out_of_bounds": {
    tag: "cpp.vector.out_of_bounds",
    action: "use_boundary_checklist",
    title: "Check index boundaries",
    reason: "An out-of-bounds access showed up — test empty and edge indices."
  },
  "cpp.recursion.missing_base_case": {
    tag: "cpp.recursion.missing_base_case",
    action: "try_completion_item",
    title: "Add the recursion base case",
    reason: "Your recursion may be missing a base case — try a guided completion."
  },
  "cpp.compile.syntax": {
    tag: "cpp.compile.syntax",
    action: "review_related_skill",
    title: "Review C++ syntax basics",
    reason: "A syntax error blocked compilation — a quick review may help."
  },
  "cpp.compile.name_not_declared": {
    tag: "cpp.compile.name_not_declared",
    action: "review_related_skill",
    title: "Review declarations and scope",
    reason: "A name was used before it was declared — review scope rules."
  },
  "cpp.raii.manual_resource_management": {
    tag: "cpp.raii.manual_resource_management",
    action: "try_parsons_item",
    title: "Practice RAII ordering",
    reason: "Manual resource handling appeared — try a Parsons RAII exercise."
  },
  "dsa.binary_search.boundary_update": {
    tag: "dsa.binary_search.boundary_update",
    action: "use_boundary_checklist",
    title: "Practice binary-search boundary updates",
    reason: "A binary-search boundary case failed — drill the lo/hi updates."
  },
  "dsa.graphs.missing_visited": {
    tag: "dsa.graphs.missing_visited",
    action: "trace_with_ai",
    title: "Trace your traversal",
    reason: "A visited-set issue appeared — trace how nodes are revisited."
  },
  "dsa.dp.bad_base_case": {
    tag: "dsa.dp.bad_base_case",
    action: "try_completion_item",
    title: "Fix the DP base case",
    reason: "A DP base-case test failed — try a guided completion of the base case."
  },
  "dsa.dp.bad_state_definition": {
    tag: "dsa.dp.bad_state_definition",
    action: "review_related_skill",
    title: "Review DP state definition",
    reason: "The DP state may be under-defined — review how to choose the state."
  }
};

export function getRemediationRuleForTag(tag: CodeErrorTag): CodeRemediationRule | null {
  return RULES[tag] ?? null;
}

export function getDefaultRemediationAction(tag: CodeErrorTag): CodeRemediationAction {
  return RULES[tag]?.action ?? "retry_code_lab";
}
