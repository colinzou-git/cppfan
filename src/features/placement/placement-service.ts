// Server-only placement orchestration (#125). Grades the learner's answers with
// the answer-key-authoritative grade RPC (seed grading only in deliberate
// non-database modes, never on a configured failure — #146), builds per-module
// suggestions, and persists them per-user. Suggestion-only: no content lock, no
// durable mastery.
import { createClient } from "@/lib/supabase/server";
import { getGradingChoices, gradeViaRpc } from "@/features/learning-items/attempt-service";
import { gradeChoiceAttempt } from "@/features/learning-items/grading";
import { getPlacementAssessment } from "./placement-queries";
import { buildPlacementResults } from "./placement-results";
import type { PlacementResetResult, PlacementSubmitResult } from "./placement-action-types";

export async function runPlacement(answers: Record<string, string>): Promise<PlacementSubmitResult> {
  const questions = getPlacementAssessment();
  const graded: Record<string, boolean> = {};

  for (const question of questions) {
    const choiceId = answers[question.itemId];
    if (typeof choiceId !== "string" || !choiceId) {
      continue; // unanswered modules default to start_here
    }

    const outcome = await gradeViaRpc(question.itemId, choiceId);
    if (outcome.status === "error") {
      // Configured-database failure: do not silently seed-grade (#146).
      return { status: "error" };
    }
    if (outcome.status === "graded") {
      graded[question.itemId] = outcome.isCorrect;
      continue;
    }
    // unconfigured / pre-migration: legitimate seed grading.
    const seed = gradeChoiceAttempt(await getGradingChoices(question.itemId), choiceId);
    if (seed.status === "graded") {
      graded[question.itemId] = seed.isCorrect;
    }
  }

  const results = buildPlacementResults(graded);

  const supabase = await createClient();
  let persisted = false;
  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      const now = new Date().toISOString();
      const rows = results.map((r) => ({
        user_id: user.id,
        module_id: r.module_id,
        level: r.level,
        correct: r.correct,
        total: r.total,
        updated_at: now
      }));
      const { error } = await supabase
        .from("placement_results")
        .upsert(rows, { onConflict: "user_id,module_id" });
      persisted = !error;
    }
  }

  return { status: "ok", results, persisted };
}

export async function clearPlacement(): Promise<PlacementResetResult> {
  const supabase = await createClient();
  if (!supabase) {
    return { status: "ok" }; // demo mode: nothing persisted
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "ok" };
  }
  const { error } = await supabase.from("placement_results").delete().eq("user_id", user.id);
  return error ? { status: "error" } : { status: "ok" };
}
