// Pure mapping from a learner's recent wrong answers to observed-misconception
// remediation suggestions (#126). Maps each wrong selected choice to its
// instructional error tag (seed mapping, the same data the protected
// choice_error_tags table holds), tallies per tag, and surfaces a tag once it
// crosses the observe threshold — so repeated mistakes do not create unbounded
// duplicate recommendations. DB-independent and unit-testable.
import {
  ERROR_TAGS,
  getErrorTagForChoice,
  observedPatterns,
  remediationReason,
  type InstructionalTag
} from "./error-tags";

export type WrongAttempt = { learning_item_id: string; selected_choice_id: string | null };

export type RemediationRec = {
  tag: InstructionalTag;
  /** Learner-facing misconception name. */
  title: string;
  /** Reason naming the observed misconception. */
  reason: string;
  /** A learning item that exercised the misconception, to re-practice. */
  itemId: string | null;
};

/**
 * Observed-misconception remediation suggestions from recent wrong attempts, in
 * stable catalog order, each at most once. Empty when no tag crosses the
 * threshold.
 */
export function remediationRecsFromAttempts(attempts: WrongAttempt[], threshold?: number): RemediationRec[] {
  const hits: Partial<Record<InstructionalTag, number>> = {};
  const itemByTag: Partial<Record<InstructionalTag, string>> = {};

  for (const attempt of attempts) {
    if (!attempt.selected_choice_id) {
      continue;
    }
    const tag = getErrorTagForChoice(attempt.selected_choice_id);
    if (!tag) {
      continue;
    }
    hits[tag] = (hits[tag] ?? 0) + 1;
    if (!itemByTag[tag]) {
      itemByTag[tag] = attempt.learning_item_id;
    }
  }

  return observedPatterns(hits, threshold).map((tag) => ({
    tag,
    title: ERROR_TAGS[tag].label,
    reason: remediationReason(tag),
    itemId: itemByTag[tag] ?? null
  }));
}
