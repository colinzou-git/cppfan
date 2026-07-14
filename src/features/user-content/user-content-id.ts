/*
 * Stable projected IDs for user-created content (#487).
 *
 * Published user content materializes as owner-scoped rows in the existing
 * `skills` / `learning_items` tables, keyed by IDs derived from the content
 * item's UUID (never from mutable titles). These helpers are the single source
 * of truth for that `user.` namespace so the shape stays consistent across the
 * projection, resolvers, events, and tests.
 *
 *   user.skill.<contentId>
 *   user.item.<contentId>
 *   user.item.<contentId>.review.<reviewCardId>
 */

const SKILL_PREFIX = "user.skill.";
const ITEM_PREFIX = "user.item.";
const REVIEW_SEGMENT = ".review.";

export function userSkillId(contentId: string): string {
  return `${SKILL_PREFIX}${contentId}`;
}

export function userLearningItemId(contentId: string): string {
  return `${ITEM_PREFIX}${contentId}`;
}

export function userReviewItemId(contentId: string, reviewCardId: string): string {
  return `${ITEM_PREFIX}${contentId}${REVIEW_SEGMENT}${reviewCardId}`;
}

export function isUserSkillId(id: string): boolean {
  return id.startsWith(SKILL_PREFIX);
}

export function isUserLearningItemId(id: string): boolean {
  return id.startsWith(ITEM_PREFIX);
}

/** True for any `user.*` projected id (skill or item). */
export function isUserContentId(id: string): boolean {
  return isUserSkillId(id) || isUserLearningItemId(id);
}

/** Recover the content UUID from a projected skill id, or null if not one. */
export function contentIdFromUserSkillId(id: string): string | null {
  if (!isUserSkillId(id)) {
    return null;
  }
  const rest = id.slice(SKILL_PREFIX.length);
  return rest.length > 0 ? rest : null;
}

/**
 * Recover the content UUID from a projected item id (with or without a
 * `.review.<id>` suffix), or null if not a user item id.
 */
export function contentIdFromUserItemId(id: string): string | null {
  if (!isUserLearningItemId(id)) {
    return null;
  }
  const rest = id.slice(ITEM_PREFIX.length);
  const reviewAt = rest.indexOf(REVIEW_SEGMENT);
  const contentId = reviewAt === -1 ? rest : rest.slice(0, reviewAt);
  return contentId.length > 0 ? contentId : null;
}

/** Recover the review-card UUID from a projected review item id, else null. */
export function reviewCardIdFromUserItemId(id: string): string | null {
  if (!isUserLearningItemId(id)) {
    return null;
  }
  const reviewAt = id.indexOf(REVIEW_SEGMENT);
  if (reviewAt === -1) {
    return null;
  }
  const reviewId = id.slice(reviewAt + REVIEW_SEGMENT.length);
  return reviewId.length > 0 ? reviewId : null;
}
