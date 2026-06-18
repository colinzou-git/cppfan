// Wrong-answer remediation (#126, ADR 0005). A stable catalog of instructional
// error tags, a mapping from distractor choice ids to those tags, and pure
// deterministic logic for observing error patterns. The choice->tag mapping is
// PROTECTED grading metadata: it lives server-side (choice_error_tags, locked
// like is_correct) and is returned only AFTER a submission. This module is the
// typed seed mirror + the pure rules; per-user evidence storage and the UI are
// paired with per-user evidence storage and UI after submission.

export type ErrorTagInfo = {
  /** Learner-friendly name of the misconception, used in recommendation reasons. */
  label: string;
  /** A concise explanation shown when the pattern is observed. */
  explanation: string;
  /** Existing learning item used as a contrasting follow-up after remediation. */
  followUpItemId: string;
};

/** Stable instructional error-tag catalog. Keys are the stable tag ids. */
export const ERROR_TAGS = {
  "cpp.references.copy_vs_alias": {
    label: "references are aliases, not copies or pointers",
    explanation:
      "A C++ reference is another name for an existing object. It must bind to something that already exists, cannot be null, and is not created with new -- assigning through it changes the original.",
    followUpItemId: "cpp.references.const_correctness.mc_constref"
  },
  "cpp.structs_classes.struct_default_access": {
    label: "struct members are public by default",
    explanation:
      "In a struct, members are public by default (private in a class). It is a fixed language rule, not compiler-dependent.",
    followUpItemId: "cpp.structs_classes.syntax.code_reading_object"
  },
  "dsa.complexity.loop_cost": {
    label: "a single loop over n is O(n)",
    explanation:
      "One loop that visits each of n elements a constant amount of work is O(n) -- not O(1) (work grows with n) and not O(n^2) (that needs a nested loop over n).",
    followUpItemId: "dsa.complexity.growth_rates.mc_order"
  }
} as const satisfies Record<string, ErrorTagInfo>;

export type InstructionalTag = keyof typeof ERROR_TAGS;

export function isInstructionalTag(value: string): value is InstructionalTag {
  return Object.prototype.hasOwnProperty.call(ERROR_TAGS, value);
}

export type ChoiceErrorTag = { choice_id: string; instructional_tag: InstructionalTag };

/**
 * Distractor choice -> instructional tag, for at least three existing modules.
 * Only wrong choices appear here; the correct choice has no tag.
 */
export const choiceErrorTags: ChoiceErrorTag[] = [
  // References: choosing null / new / default-0 all miss that a reference aliases.
  { choice_id: "cpp.references.references.mc_init.b", instructional_tag: "cpp.references.copy_vs_alias" },
  { choice_id: "cpp.references.references.mc_init.c", instructional_tag: "cpp.references.copy_vs_alias" },
  { choice_id: "cpp.references.references.mc_init.d", instructional_tag: "cpp.references.copy_vs_alias" },
  // Structs/classes: Private/Protected/compiler-dependent miss the public default.
  {
    choice_id: "cpp.structs_classes.syntax.mc_default_access.b",
    instructional_tag: "cpp.structs_classes.struct_default_access"
  },
  {
    choice_id: "cpp.structs_classes.syntax.mc_default_access.c",
    instructional_tag: "cpp.structs_classes.struct_default_access"
  },
  {
    choice_id: "cpp.structs_classes.syntax.mc_default_access.d",
    instructional_tag: "cpp.structs_classes.struct_default_access"
  },
  // Complexity: O(1)/O(n^2)/O(log n) misjudge a single loop's cost.
  { choice_id: "dsa.complexity.big_o.mc_single_loop.b", instructional_tag: "dsa.complexity.loop_cost" },
  { choice_id: "dsa.complexity.big_o.mc_single_loop.c", instructional_tag: "dsa.complexity.loop_cost" },
  { choice_id: "dsa.complexity.big_o.mc_single_loop.d", instructional_tag: "dsa.complexity.loop_cost" }
];

/** The instructional tag for a selected (wrong) choice, or null. Seed fallback. */
export function getErrorTagForChoice(choiceId: string): InstructionalTag | null {
  return choiceErrorTags.find((entry) => entry.choice_id === choiceId)?.instructional_tag ?? null;
}

/** A pattern is observed once a learner has accrued at least this many recent hits. */
export const OBSERVE_THRESHOLD = 2;

/**
 * Deterministic pattern detection from recent per-tag hit counts. Returns each
 * observed tag at most once (no unbounded duplicate recommendations) in catalog
 * order, so the result is stable for identical evidence.
 */
export function observedPatterns(
  tagHits: Partial<Record<InstructionalTag, number>>,
  threshold: number = OBSERVE_THRESHOLD
): InstructionalTag[] {
  return (Object.keys(ERROR_TAGS) as InstructionalTag[]).filter((tag) => (tagHits[tag] ?? 0) >= threshold);
}

/** Learner-facing reason naming the observed misconception. */
export function remediationReason(tag: InstructionalTag): string {
  return `Recommended because you missed questions about ${ERROR_TAGS[tag].label}.`;
}
