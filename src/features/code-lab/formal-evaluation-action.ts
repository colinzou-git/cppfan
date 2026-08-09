"use server";

/*
 * Formal AI / combined evaluation submission for user content (#609). This is the
 * authoritative Submit-for-evaluation outcome for ai_evaluation and the
 * automated/judge + AI combined modes — distinct from the optional AI help panel.
 *
 * Safety: the pass/fail is grounded on the shared buildUserContentEvaluationResult,
 * so for combined modes a failing objective can NEVER be flipped to a pass by
 * optimistic AI. When the AI provider is unavailable (the default CI config), the
 * verdict is unavailable and NO completion is credited — a provider failure never
 * fabricates a pass. Best-effort / RLS-owned; completion is credited per content
 * kind (a user lab via markUserLabComplete, else the completion_submitted event).
 */

import { resolveCodeLabItem } from "./code-lab-item-resolver";
import { reviewCode } from "./code-review-service";
import { runTests } from "./code-lab-service";
import { aiVerdictFromFeedback } from "./formal-evaluation-verdict";
import {
  buildUserContentEvaluationResult,
  objectiveOutcomeFromTestResult,
  type AiOutcome,
  type ContentEvaluationMode,
  type UserContentEvaluationResult
} from "@/features/user-content/user-content-evaluation";
import { recordSkillEvents } from "@/features/events/event-service";
import { markUserLabComplete } from "@/features/labs/user-lab-progress";

const AI_MODES = new Set<ContentEvaluationMode>([
  "ai_evaluation",
  "automated_plus_ai",
  "judge_plus_ai"
]);
const OBJECTIVE_PLUS_AI = new Set<ContentEvaluationMode>(["automated_plus_ai", "judge_plus_ai"]);

export async function submitFormalEvaluation(input: {
  itemId: string;
  contentVersionId?: string | null;
  source: string;
  mode: ContentEvaluationMode;
}): Promise<UserContentEvaluationResult> {
  const mode = input.mode;

  // Combined modes run the deterministic objective FIRST — it is authoritative.
  let objective;
  if (OBJECTIVE_PLUS_AI.has(mode)) {
    const test = await runTests({
      itemId: input.itemId,
      source: input.source,
      expectedVersionId: input.contentVersionId ?? undefined
    }).catch(() => null);
    objective = test
      ? objectiveOutcomeFromTestResult({ passed: test.passed, total: test.total })
      : { passed: 0, total: 1 };
  }

  let ai: AiOutcome | undefined;
  if (AI_MODES.has(mode)) {
    const controller = new AbortController();
    const feedback = await reviewCode(
      {
        itemId: input.itemId,
        source: input.source,
        contentVersionId: input.contentVersionId ?? undefined
      },
      controller.signal
    ).catch(() => null);
    ai = aiVerdictFromFeedback(feedback);
  }

  const result = buildUserContentEvaluationResult({ mode, objective, ai });

  if (result.completionCredited) {
    const resolved = await resolveCodeLabItem({ itemId: input.itemId });
    if (resolved.status === "ok") {
      if (resolved.item.source === "user_lab") {
        await markUserLabComplete({
          itemId: input.itemId,
          contentVersionId: input.contentVersionId,
          evaluationMode: mode
        }).catch(() => ({ status: "error" }));
      } else if (resolved.item.skillTags.length > 0) {
        const metadata = { evaluationMode: mode, contentVersionId: input.contentVersionId ?? null };
        await recordSkillEvents(
          resolved.item.skillTags.map((skillId) => ({
            eventType: "completion_submitted" as const,
            skillId,
            learningItemId: input.itemId,
            metadata
          }))
        ).catch(() => false);
      }
    }
  }
  return result;
}
