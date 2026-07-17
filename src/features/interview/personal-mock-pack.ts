/*
 * Personal mock-pack composition + reconciliation (#613). A learner can assemble
 * their own mock from native and user-created interview problems. Each selection
 * stores the stable problem id plus, for a custom item, the immutable content
 * version it was added at. This module is the pure core that reconciles a stored
 * selection against the CURRENT candidate set: it flags items that became
 * unavailable or whose version changed and requests a replacement, rather than
 * silently substituting a different problem.
 *
 * Pure and I/O-free (candidates are passed in, resolved by
 * getInterviewPlanningCandidates); persistence + UI wrap this.
 */

import type { InterviewPlanningCandidate } from "./interview-planning-candidates";

export type PersonalMockSelection = {
  problemId: string;
  source: "native" | "user";
  /** Immutable version the item was added at (user items only). */
  contentVersionId?: string | null;
};

export type PersonalMockItem = PersonalMockSelection & { title: string };

export type PersonalMockPack = {
  id: string;
  title: string;
  items: PersonalMockItem[];
};

export type MockPackReconciliation = {
  /** Selections that still resolve at the same version — usable as-is. */
  ok: PersonalMockItem[];
  /** Selections whose problem no longer resolves — need removal/replacement. */
  unavailable: PersonalMockSelection[];
  /** User selections whose published version changed — need explicit replacement. */
  versionChanged: { selection: PersonalMockSelection; currentVersionId: string | null; title: string }[];
};

/**
 * Reconcile stored selections against the current candidate set. Never silently
 * swaps a problem: an unavailable or version-changed item is surfaced for the
 * learner to remove or re-add at the current version.
 */
export function reconcilePersonalMockPack(
  selections: PersonalMockSelection[],
  candidates: InterviewPlanningCandidate[]
): MockPackReconciliation {
  const byId = new Map(candidates.map((c) => [c.problemId, c]));
  const result: MockPackReconciliation = { ok: [], unavailable: [], versionChanged: [] };

  for (const selection of dedupeSelections(selections)) {
    const candidate = byId.get(selection.problemId);
    if (!candidate) {
      result.unavailable.push(selection);
      continue;
    }
    // A user item republished to a different immutable version must be re-confirmed.
    if (selection.source === "user" && (selection.contentVersionId ?? null) !== (candidate.contentVersionId ?? null)) {
      result.versionChanged.push({ selection, currentVersionId: candidate.contentVersionId ?? null, title: candidate.title });
      continue;
    }
    result.ok.push({ ...selection, title: candidate.title });
  }
  return result;
}

/** First occurrence wins; dedupes by problem id so a pack never repeats a problem. */
export function dedupeSelections(selections: PersonalMockSelection[]): PersonalMockSelection[] {
  const seen = new Set<string>();
  const out: PersonalMockSelection[] = [];
  for (const s of selections) {
    if (seen.has(s.problemId)) continue;
    seen.add(s.problemId);
    out.push(s);
  }
  return out;
}

/** Compose a personal mock pack from reconciled-OK items. */
export function composePersonalMockPack(id: string, title: string, items: PersonalMockItem[]): PersonalMockPack {
  return { id, title: title.trim() || "My mock pack", items };
}
