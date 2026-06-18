"use server";

import { createClient } from "@/lib/supabase/server";
import { getCompletionSolution, getPrimarySkillId } from "./learning-item-seed";
import { classifyCompletionRpc, gradeCompletionAnswers } from "./completion-grading";
import { recordSkillEvents } from "@/features/events/event-service";

export type SubmitCompletionResult =
  | { status: "invalid" }
  | { status: "error" }
  | { status: "graded"; isCorrect: boolean; correctCount: number; total: number };

/**
 * Grade a submitted set of completion blank values (#123). Prefers the
 * DB-authoritative grade_completion_attempt RPC, which keeps the answers
 * server-side; falls back to the bundled seed answers only in legitimate
 * non-database modes (unconfigured or pre-migration). A configured-database
 * failure returns `error` rather than grading against the seed (#146). Recording
 * mastery evidence is best-effort.
 */
export async function submitCompletion(input: {
  itemId: string;
  answers: string[];
}): Promise<SubmitCompletionResult> {
  const itemId = typeof input?.itemId === "string" ? input.itemId : "";
  const answers = Array.isArray(input?.answers) ? input.answers.filter((a) => typeof a === "string") : [];

  if (!itemId || answers.length === 0) {
    return { status: "invalid" };
  }

  const supabase = await createClient();

  let graded: { isCorrect: boolean; correctCount: number; total: number } | null = null;

  if (supabase) {
    const outcome = classifyCompletionRpc(
      await supabase.rpc("grade_completion_attempt", { p_item_id: itemId, p_answers: answers })
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
    const solution = getCompletionSolution(itemId);
    if (solution.length === 0) {
      return { status: "invalid" };
    }
    graded = gradeCompletionAnswers(solution, answers);
  }

  const skillId = getPrimarySkillId(itemId);
  await recordSkillEvents([
    {
      eventType: "completion_submitted",
      skillId,
      learningItemId: itemId,
      metadata: { is_correct: graded.isCorrect, correct_count: graded.correctCount, total: graded.total }
    }
  ]);

  return { status: "graded", isCorrect: graded.isCorrect, correctCount: graded.correctCount, total: graded.total };
}
