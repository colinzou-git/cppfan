"use server";

/*
 * Formal self-evaluation submission for a self_evaluation user item (#609). The
 * pass/fail rests on the shared buildUserContentEvaluationResult, so a self item
 * is credited only on an intentional "complete" rating, as explicitly weaker
 * evidence than objective tests. Completion is credited per content kind: a user
 * lab through the existing whole-lab completion, an exercise/interview through the
 * completion_submitted skill event the mastery loop already consumes. Best-effort
 * and RLS-owned — returns the result even when persistence is unavailable.
 */

import { resolveCodeLabItem } from "./code-lab-item-resolver";
import {
  buildUserContentEvaluationResult,
  type UserContentEvaluationResult
} from "@/features/user-content/user-content-evaluation";
import { recordSkillEvents } from "@/features/events/event-service";
import { markUserLabComplete } from "@/features/labs/user-lab-progress";

export async function submitSelfEvaluation(input: {
  itemId: string;
  contentVersionId?: string | null;
  rating: "not_yet" | "partial" | "complete";
  reflection?: string;
}): Promise<UserContentEvaluationResult> {
  const result = buildUserContentEvaluationResult({
    mode: "self_evaluation",
    self: { rating: input.rating }
  });

  // partial / not_yet: an honest non-completion — record nothing, prompt more work.
  if (!result.completionCredited) {
    return result;
  }

  const resolved = await resolveCodeLabItem({
    itemId: input.itemId,
    expectedContentVersionId: input.contentVersionId ?? undefined
  });
  if (resolved.status !== "ok") {
    return result;
  }

  if (resolved.item.source === "user_lab") {
    // Labs credit whole-lab completion (writes progress + its own completion event).
    await markUserLabComplete({
      itemId: input.itemId,
      contentVersionId: input.contentVersionId,
      evaluationMode: "self_evaluation"
    }).catch(() => ({ status: "error" }));
    return result;
  }

  const skillTags = resolved.item.skillTags;
  if (skillTags.length > 0) {
    const metadata = {
      evaluationMode: "self_evaluation",
      rating: input.rating,
      reflection: input.reflection ?? "",
      contentVersionId: input.contentVersionId ?? null
    };
    await recordSkillEvents(
      skillTags.map((skillId) => ({
        eventType: "completion_submitted" as const,
        skillId,
        learningItemId: input.itemId,
        metadata
      }))
    ).catch(() => false);
  }
  return result;
}
