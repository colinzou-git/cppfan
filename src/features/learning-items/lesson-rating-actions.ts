"use server";

import { createClient } from "@/lib/supabase/server";
import { applyRating, createInitialSchedule } from "@/lib/fsrs/scheduler";
import { revalidateLearnerSurfaces } from "@/features/learning/revalidate-learner-surfaces";
import {
  classifyLessonRatingRpc,
  isLessonCompletionChoice,
  lessonChoiceToFsrsRating,
  type RateLessonCompletionResult
} from "./lesson-rating-types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function rateLessonCompletion(input: {
  itemId: string;
  choice: unknown;
  submissionId: string;
}): Promise<RateLessonCompletionResult> {
  const itemId = typeof input?.itemId === "string" ? input.itemId.trim() : "";
  const submissionId = typeof input?.submissionId === "string" ? input.submissionId : "";
  if (
    !itemId ||
    itemId.length > 300 ||
    !isLessonCompletionChoice(input?.choice) ||
    !UUID_PATTERN.test(submissionId)
  ) {
    return { status: "invalid" };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { status: "unavailable" };
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error(
      `[lesson-rating] authentication check failed (item=${itemId}, submission=${submissionId})`
    );
    return { status: "error" };
  }
  if (!auth.user) {
    return { status: "signed_out" };
  }

  const fsrsRating = lessonChoiceToFsrsRating(input.choice);
  const now = new Date();
  const { schedule, log } = applyRating(createInitialSchedule(now), fsrsRating, now);
  const result = classifyLessonRatingRpc(
    await supabase.rpc("apply_initial_lesson_rating", {
      p_item_id: itemId,
      p_submission_id: submissionId,
      p_displayed_choice: input.choice,
      p_rating: fsrsRating,
      p_schedule: schedule,
      p_log: log
    })
  );

  if (
    result.status === "ok" ||
    result.status === "already_processed" ||
    result.status === "already_scheduled"
  ) {
    revalidateLearnerSurfaces();
  } else {
    console.error(
      `[lesson-rating] commit failed (item=${itemId}, submission=${submissionId}, status=${result.status})`
    );
  }

  return result;
}
