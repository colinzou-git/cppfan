// Deterministic observe/clear rules for error-pattern evidence (#126). Pure and
// DB-independent so the thresholds are unit-tested. A misconception is OBSERVED
// when its recent wrong count crosses the threshold and it is not already
// observed; a previously-observed misconception is CLEARED when its recent wrong
// count drops back below the threshold (e.g. after recent correct answers in the
// window). The actual events are appended to skill_events by the recorder.
import { OBSERVE_THRESHOLD, type InstructionalTag } from "./error-tags";

export type ErrorPatternDecision = {
  observe: InstructionalTag[];
  clear: InstructionalTag[];
};

export function decideErrorPatternEvents(input: {
  /** Recent wrong-answer hits per misconception tag (within the window). */
  wrongByTag: Partial<Record<InstructionalTag, number>>;
  /** Tags whose most recent error-pattern event was "observed" (not yet cleared). */
  observedTags: InstructionalTag[];
  threshold?: number;
}): ErrorPatternDecision {
  const threshold = input.threshold ?? OBSERVE_THRESHOLD;
  const observed = new Set(input.observedTags);

  const observe: InstructionalTag[] = [];
  const clear: InstructionalTag[] = [];

  // Observe: a tag at/over threshold that is not already in the observed state.
  for (const [tag, count] of Object.entries(input.wrongByTag) as [InstructionalTag, number | undefined][]) {
    if ((count ?? 0) >= threshold && !observed.has(tag)) {
      observe.push(tag);
    }
  }

  // Clear: a currently-observed tag whose recent wrong count fell below threshold.
  for (const tag of observed) {
    if ((input.wrongByTag[tag] ?? 0) < threshold) {
      clear.push(tag);
    }
  }

  return { observe, clear };
}
