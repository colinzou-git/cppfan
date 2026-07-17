/*
 * Normalized interview-problem resolver (#490): returns a problem for either a
 * native catalog id or the authenticated owner's published user problem
 * (user.item.<id>), shaped as the native InterviewProblem so the timed-session,
 * follow-up, and help machinery works uniformly. Server-only (reads the
 * owner-scoped DB for user problems). The native catalog is never mutated — user
 * problems are normalized at this boundary. Reference solutions and hidden tests
 * are NOT part of InterviewProblem, so the fixed reveal policy is preserved.
 */

import { getInterviewProblem, type InterviewProblem } from "./problem-catalog";
import { getInterviewForOwner } from "@/features/user-content/user-content-queries";
import { contentIdFromUserItemId, isUserLearningItemId, userSkillId } from "@/features/user-content/user-content-id";
import type { InterviewProblemPayload } from "@/features/user-content/interview-content-types";

function payloadToInterviewProblem(itemId: string, contentId: string, payload: InterviewProblemPayload): InterviewProblem {
  return {
    id: itemId,
    version: payload.schemaVersion ?? 1,
    title: payload.title,
    prompt: payload.statement,
    group: payload.group ?? "cpp_implementation",
    roleRelevance: payload.roleRelevance ?? "general",
    difficulty: payload.difficulty ?? "medium",
    primarySkillId: userSkillId(contentId),
    secondarySkillIds: [],
    patternTags: payload.patternTags ?? [],
    constraints: payload.constraints ?? "",
    targetComplexity: payload.targetComplexity ?? "",
    requiredEdgeCases: payload.requiredEdgeCases ?? [],
    clarifyingQuestions: payload.clarifyingQuestions ?? [],
    hintLadder: payload.hintLadder ?? [],
    visibleExamples: payload.visibleExamples ?? [],
    externalLinks: [],
    interviewCore: false
  };
}

/**
 * Resolve a problem id to an InterviewProblem — native, or the owner's published
 * user problem. Returns null for an unknown/unauthorized id (so a user problem
 * cannot be resolved by another user).
 */
export async function resolveInterviewProblem(id: string): Promise<InterviewProblem | null> {
  return (await resolveInterviewProblemRef(id))?.problem ?? null;
}

/** A resolved interview problem plus its immutable published content version. */
export type ResolvedInterviewProblemRef = {
  problem: InterviewProblem;
  /** user_content_versions.id for a user problem; null for a native problem. */
  contentVersionId: string | null;
};

/**
 * Resolve a problem id to its problem AND immutable published version (#612).
 * Native ids have no content version (null); the session binds to this instead
 * of the schema version, which stays 1 across every publication.
 */
export async function resolveInterviewProblemRef(id: string): Promise<ResolvedInterviewProblemRef | null> {
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }
  const native = getInterviewProblem(id);
  if (native) {
    return { problem: native, contentVersionId: null };
  }
  if (!isUserLearningItemId(id)) {
    return null;
  }
  const contentId = contentIdFromUserItemId(id);
  if (!contentId) {
    return null;
  }
  const detail = await getInterviewForOwner(contentId);
  const payload = detail?.publishedPayload;
  if (!payload) {
    return null;
  }
  return { problem: payloadToInterviewProblem(id, contentId, payload), contentVersionId: detail?.publishedVersionId ?? null };
}
