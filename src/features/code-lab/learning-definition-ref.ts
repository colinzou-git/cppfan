/*
 * Immutable learner-definition identity (#612). User-created learning-item IDs
 * are stable across published versions, so learner state keyed only by item ID
 * silently mixes work across incompatible definitions after a republish. This is
 * the ONE shared identity every capability keys by: drafts, attempts, milestone
 * progress, interview sessions, judge submissions, and readiness.
 *
 * Native items have no content version and keep their stable item identity.
 * User-created executable items carry the immutable `user_content_versions.id`
 * (the value the browser loaded and the server validated).
 */

export type LearningDefinitionRef = {
  itemId: string;
  /** Immutable published version id — required for user content, absent for native. */
  contentVersionId?: string | null;
  /** Stable milestone id — required for milestone-scoped lab work. */
  milestoneId?: string | null;
};

/**
 * localStorage key for an item's offline/signed-out draft (#431), now scoped by
 * content version (#612). A versioned key means opening a NEW published version
 * cannot find an OLD version's draft, so old code is never silently restored —
 * the old draft stays under its own key for an explicit "copy from previous
 * version". Native/legacy drafts (no version) keep the original unversioned key
 * so existing local drafts remain recoverable.
 */
export function codeDraftStorageKey(itemId: string, contentVersionId?: string | null): string {
  const base = `cppfan:code-lab:draft:${itemId}`;
  return contentVersionId ? `${base}@${contentVersionId}` : base;
}

/** Prefix that matches every stored draft key for `itemId`, across versions. */
export function codeDraftStorageKeyPrefix(itemId: string): string {
  return `cppfan:code-lab:draft:${itemId}`;
}
