/**
 * Stable Code Lab error-tag vocabulary (#410). A small, intentionally-incomplete
 * initial set. Later phases (deterministic tagging, remediation, mastery) consume
 * these; keep additions deliberate and backward-compatible — never renumber or
 * repurpose an existing tag. AI-derived tags are advisory weak evidence only.
 */
export const CODE_ERROR_TAGS = [
  "cpp.compile.syntax",
  "cpp.compile.type_mismatch",
  "cpp.compile.missing_include",
  "cpp.compile.name_not_declared",
  "cpp.loop.off_by_one",
  "cpp.vector.out_of_bounds",
  "cpp.function.missing_return",
  "cpp.recursion.missing_base_case",
  "cpp.references.copy_vs_alias",
  "cpp.ownership.raw_pointer_owner_confusion",
  "cpp.raii.manual_resource_management",
  "dsa.binary_search.boundary_update",
  "dsa.graphs.missing_visited",
  "dsa.dp.bad_base_case",
  "dsa.dp.bad_state_definition"
] as const;

export type CodeErrorTag = (typeof CODE_ERROR_TAGS)[number];

const TAG_SET: ReadonlySet<string> = new Set(CODE_ERROR_TAGS);

export function isCodeErrorTag(value: unknown): value is CodeErrorTag {
  return typeof value === "string" && TAG_SET.has(value);
}

/** Where a tag came from. Deterministic sources outrank advisory AI inference. */
export type CodeTagSource = "compiler" | "runtime" | "test" | "ai";

export type CodeTagConfidence = "low" | "medium" | "high";

/**
 * One classified error tag for a Code Lab attempt (#412). Deterministic
 * classifications (compiler/runtime/test) are derived from real runner/test
 * output; AI classifications stay weak evidence (#410).
 */
export type CodeTagClassification = {
  tag: CodeErrorTag;
  source: CodeTagSource;
  confidence: CodeTagConfidence;
  message: string;
};
