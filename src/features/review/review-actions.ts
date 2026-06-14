"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { applyRating, type ReviewRating } from "@/lib/fsrs/scheduler";
import { getReviewCardForUser } from "./review-queries";
import { enrollReviewForUser } from "./enroll-review";
import { isReviewEligibleItem } from "@/features/learning-items/learning-item-seed";
import { classifyRateRpc, type RateReviewResult } from "./rate-review-result";

export type AddToReviewResult = { status: "ok" } | { status: "ineligible" } | { status: "error" };

/**
 * Deliberate learner enrollment (#142, rule C): add a single eligible item to
 * the learner's review queue on demand. Idempotent — adding an already-enrolled
 * item succeeds without creating a duplicate.
 */
export async function addToReview(input: { itemId: string }): Promise<AddToReviewResult> {
  const itemId = typeof input?.itemId === "string" ? input.itemId : "";
  if (!itemId) {
    return { status: "error" };
  }
  if (!isReviewEligibleItem(itemId)) {
    return { status: "ineligible" };
  }

  const enrolled = await enrollReviewForUser(itemId);
  if (!enrolled) {
    return { status: "error" };
  }

  revalidatePath("/review");
  return { status: "ok" };
}

const VALID_RATINGS: ReviewRating[] = ["again", "hard", "good", "easy"];

/**
 * Apply an FSRS rating to one of the signed-in learner's review cards. The FSRS
 * transition is computed here (ts-fsrs), then the apply_review_rating database
 * function performs the card update, the immutable review-log append, and the
 * review_completed evidence ATOMICALLY (#143) — with ownership, optimistic
 * concurrency (expected reps), and idempotency (submission id) checks. Partial
 * writes and lost updates are therefore impossible, and a retry/double-tap with
 * the same submissionId is idempotent.
 *
 * The caller should pass a stable submissionId per rating action so an
 * in-flight retry does not rate twice; one is generated if omitted.
 */
export async function rateReview(input: {
  cardId: string;
  rating: ReviewRating;
  submissionId?: string;
}): Promise<RateReviewResult> {
  const cardId = typeof input?.cardId === "string" ? input.cardId : "";
  const rating = input?.rating;
  const submissionId = typeof input?.submissionId === "string" && input.submissionId ? input.submissionId : randomUUID();

  if (!cardId || !VALID_RATINGS.includes(rating)) {
    return { status: "error" };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { status: "error" };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error" };
  }

  const card = await getReviewCardForUser(supabase, user.id, cardId);
  if (!card) {
    return { status: "error" };
  }

  const { schedule, log } = applyRating(
    {
      state: card.state,
      due_at: card.due_at,
      stability: card.stability,
      difficulty: card.difficulty,
      elapsed_days: card.elapsed_days,
      scheduled_days: card.scheduled_days,
      learning_steps: card.learning_steps,
      reps: card.reps,
      lapses: card.lapses,
      last_reviewed_at: card.last_reviewed_at
    },
    rating,
    new Date()
  );

  const result = classifyRateRpc(
    await supabase.rpc("apply_review_rating", {
      p_card_id: cardId,
      p_rating: rating,
      p_expected_reps: card.reps,
      p_submission_id: submissionId,
      p_schedule: schedule,
      p_log: log
    })
  );

  if (result.status !== "error") {
    revalidatePath("/review");
  }

  return result;
}
