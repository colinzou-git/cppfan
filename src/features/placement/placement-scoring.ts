// Deterministic placement scoring (#125, ADR 0005). Pure and DB-independent so
// it is unit-testable and reused on the server. Produces suggestions only —
// start_here / review_soon / probably_familiar — never a content lock or durable
// mastery.

export type PlacementLevel = "start_here" | "review_soon" | "probably_familiar";

export type PlacementModuleResult = {
  module_id: string;
  title: string;
  correct: number;
  total: number;
  level: PlacementLevel;
  reason: string;
};

const FAMILIAR_RATIO = 0.8;
const REVIEW_RATIO = 0.4;

/**
 * Classify a module from how many of its placement items the learner got right.
 * Thresholds are fixed so the result is deterministic and explainable. With no
 * evidence we suggest starting (the safe, non-locking default).
 */
export function classifyPlacement(correct: number, total: number): PlacementLevel {
  if (total <= 0) {
    return "start_here";
  }
  const ratio = correct / total;
  if (ratio >= FAMILIAR_RATIO) {
    return "probably_familiar";
  }
  if (ratio >= REVIEW_RATIO) {
    return "review_soon";
  }
  return "start_here";
}

/** A human-readable reason for a placement suggestion (shown to the learner). */
export function placementReason(title: string, correct: number, total: number, level: PlacementLevel): string {
  switch (level) {
    case "probably_familiar":
      return `You answered ${correct} of ${total} ${title} questions correctly — probably familiar.`;
    case "review_soon":
      return `You answered ${correct} of ${total} ${title} questions correctly — worth a review soon.`;
    default:
      return total > 0
        ? `You answered ${correct} of ${total} ${title} questions correctly — a good place to start.`
        : `No ${title} questions answered yet — a good place to start.`;
  }
}

/** Build a per-module placement result from raw correct/total tallies. */
export function summarizeModule(
  module: { module_id: string; title: string },
  correct: number,
  total: number
): PlacementModuleResult {
  const level = classifyPlacement(correct, total);
  return {
    module_id: module.module_id,
    title: module.title,
    correct,
    total,
    level,
    reason: placementReason(module.title, correct, total, level)
  };
}
