// Closure guard for completion-tracked issues (#147, parent #132).
//
// Pure, dependency-free logic so it is unit-testable (tests/unit/closure-guard.test.ts)
// and reusable by the GitHub Action wrapper (closure-guard-action.mjs). It decides
// whether a CLOSED issue is allowed to stay closed. A completion/parent/roadmap/
// multi-slice issue may close only when every requirement is verified; a focused
// one-PR bug/chore issue closes normally.

// Comment phrases that explicitly record unfinished work.
export const REMAINING_WORK_PATTERNS = [
  /still open/i,
  /\bstays open\b/i,
  /not closing/i,
  /remaining (?:work|for|per|slice|item)/i,
  /follow-up slice/i,
  /\bto-?do\b.*remain/i
];

// A final closure-evidence audit comment (required before a tracked issue closes).
export const FINAL_AUDIT_MARKER = /(^|\n)#{1,6}\s*final closure audit/i;

// Title patterns that mark an issue as completion/parent/roadmap tracked.
export const COMPLETION_TITLE_PATTERNS = [
  /^roadmap:/i,
  /\bcomplete\b/i,
  /\bfrom #\d+/i,
  /\bprogression\b/i,
  /coverage (?:from|for)/i
];

const CHECKBOX_ANY = /^[ \t]*[-*] \[[ xX]\]/gm;
const CHECKBOX_UNCHECKED = /^[ \t]*[-*] \[ \]/m;

export function hasUncheckedBoxes(text = "") {
  return CHECKBOX_UNCHECKED.test(text ?? "");
}

export function checkboxCount(text = "") {
  return ((text ?? "").match(CHECKBOX_ANY) || []).length;
}

export function mentionsRemainingWork(text = "") {
  return REMAINING_WORK_PATTERNS.some((re) => re.test(text ?? ""));
}

export function hasFinalAudit(comments = []) {
  return comments.some((c) => FINAL_AUDIT_MARKER.test(c ?? ""));
}

function normalizeLabels(labels = []) {
  return new Set(
    labels.map((l) => (typeof l === "string" ? l : (l?.name ?? "")).toLowerCase()).filter(Boolean)
  );
}

/**
 * Whether an issue is "completion-tracked" (its full scope must be done before it
 * may close). True when the title matches a roadmap/completion pattern, OR it has
 * the `planning` label, OR its body carries several checkboxes (a multi-slice
 * acceptance checklist). Focused one-PR bug/chore issues are none of these.
 */
export function isCompletionTracked({ title = "", labels = [], body = "" } = {}) {
  if (COMPLETION_TITLE_PATTERNS.some((re) => re.test(title))) return true;
  if (normalizeLabels(labels).has("planning")) return true;
  if (checkboxCount(body) >= 3) return true;
  return false;
}

/**
 * Evaluate whether a closed issue is allowed to stay closed.
 *
 * @param {object} input
 * @param {string} input.body                 issue body markdown
 * @param {string[]} input.comments           comment bodies (chronological)
 * @param {boolean} input.completionTracked   from isCompletionTracked()
 * @param {('partial'|'complete'|null)} input.linkedPrCompletion completion status of a PR that closed the issue, if known
 * @returns {{ allowed: boolean, violations: string[] }}
 */
export function evaluateIssueClosure({
  body = "",
  comments = [],
  completionTracked = false,
  linkedPrCompletion = null
} = {}) {
  const violations = [];

  if (!completionTracked) {
    // Focused one-PR bug/chore issue: closes normally. Only block if a linked PR
    // explicitly declared the work partial.
    if (linkedPrCompletion === "partial") {
      violations.push("Linked PR is marked partial.");
    }
    return { allowed: violations.length === 0, violations };
  }

  if (linkedPrCompletion === "partial") {
    violations.push("Linked PR is marked partial; a partial PR cannot close a completion-tracked issue.");
  }
  if (hasUncheckedBoxes(body)) {
    violations.push("Issue body still has unchecked acceptance/task items (`- [ ]`).");
  }
  if (comments.some((c) => mentionsRemainingWork(c))) {
    violations.push('A comment records remaining work (e.g. "still open" / "not closing" / "remaining work").');
  }
  if (!hasFinalAudit(comments)) {
    violations.push("No `## Final closure audit` evidence comment is present.");
  }

  return { allowed: violations.length === 0, violations };
}
