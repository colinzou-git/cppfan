"use server";

import { createClient } from "@/lib/supabase/server";
import { getParsonsSolution, getPrimarySkillId } from "./learning-item-seed";
import { classifyParsonsRpc, gradeParsonsOrder } from "./parsons-grading";
import { recordSkillEvents } from "@/features/events/event-service";

export type SubmitParsonsResult =
  | { status: "invalid" }
  | { status: "error" }
  | { status: "graded"; isCorrect: boolean; correctCount: number; total: number };

/**
 * Grade a submitted Parsons block order (#123). Prefers the DB-authoritative
 * grade_parsons_attempt RPC, which keeps the solution server-side; falls back to
 * the bundled seed solution only in legitimate non-database modes (unconfigured
 * or pre-migration). A configured-database failure returns `error` rather than
 * grading against the seed (#146). Recording mastery evidence is best-effort.
 */
export async function submitParsons(input: { itemId: string; blockIds: string[] }): Promise<SubmitParsonsResult> {
  const itemId = typeof input?.itemId === "string" ? input.itemId : "";
  const blockIds = Array.isArray(input?.blockIds) ? input.blockIds.filter((id) => typeof id === "string") : [];

  if (!itemId || blockIds.length === 0) {
    return { status: "invalid" };
  }

  const supabase = await createClient();

  let graded: { isCorrect: boolean; correctCount: number; total: number } | null = null;

  if (supabase) {
    const outcome = classifyParsonsRpc(
      await supabase.rpc("grade_parsons_attempt", { p_item_id: itemId, p_block_ids: blockIds })
    );
    if (outcome.status === "error") {
      return { status: "error" };
    }
    if (outcome.status === "graded") {
      graded = { isCorrect: outcome.isCorrect, correctCount: outcome.correctCount, total: outcome.total };
    }
  }

  // Seed fallback for unconfigured / pre-migration modes only.
  if (!graded) {
    const solution = getParsonsSolution(itemId);
    if (solution.length === 0) {
      return { status: "invalid" };
    }
    graded = gradeParsonsOrder(solution, blockIds);
  }

  const skillId = getPrimarySkillId(itemId);
  await recordSkillEvents([
    {
      eventType: "parsons_checked",
      skillId,
      learningItemId: itemId,
      metadata: { selected_count: blockIds.length }
    },
    {
      eventType: "parsons_submitted",
      skillId,
      learningItemId: itemId,
      metadata: { is_correct: graded.isCorrect, correct_count: graded.correctCount, total: graded.total }
    }
  ]);

  return { status: "graded", isCorrect: graded.isCorrect, correctCount: graded.correctCount, total: graded.total };
}

/** Best-effort evidence for Parsons hint usage; the UI never waits on it. */
export async function recordParsonsHint(input: { itemId: string }): Promise<void> {
  const itemId = typeof input?.itemId === "string" ? input.itemId : "";
  if (!itemId) {
    return;
  }
  const skillId = getPrimarySkillId(itemId);
  await recordSkillEvents([
    { eventType: "parsons_hint_used", skillId, learningItemId: itemId },
    { eventType: "hint_used", skillId, learningItemId: itemId }
  ]);
}
