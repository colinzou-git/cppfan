"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { applyRating, type ReviewRating } from "@/lib/fsrs/scheduler";
import { getReviewCardForUser } from "./review-queries";
import { recordSkillEvent } from "@/features/events/event-service";

export type RateReviewResult = { status: "error" } | { status: "ok"; state: string; dueAt: string };

const VALID_RATINGS: ReviewRating[] = ["again", "hard", "good", "easy"];

/**
 * Apply an FSRS rating to one of the signed-in learner's review cards: update
 * the card schedule and append an immutable review log.
 */
export async function rateReview(input: { cardId: string; rating: ReviewRating }): Promise<RateReviewResult> {
  const cardId = typeof input?.cardId === "string" ? input.cardId : "";
  const rating = input?.rating;

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

  const now = new Date();
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
    now
  );

  const update = await supabase
    .from("review_cards")
    .update({
      state: schedule.state,
      due_at: schedule.due_at,
      stability: schedule.stability,
      difficulty: schedule.difficulty,
      elapsed_days: schedule.elapsed_days,
      scheduled_days: schedule.scheduled_days,
      learning_steps: schedule.learning_steps,
      reps: schedule.reps,
      lapses: schedule.lapses,
      last_reviewed_at: schedule.last_reviewed_at
    })
    .eq("id", cardId)
    .eq("user_id", user.id);

  if (update.error) {
    return { status: "error" };
  }

  await supabase.from("review_logs").insert({
    user_id: user.id,
    review_card_id: cardId,
    rating: log.rating,
    state: log.state,
    due_at: log.due_at,
    stability: log.stability,
    difficulty: log.difficulty,
    elapsed_days: log.elapsed_days,
    last_elapsed_days: log.last_elapsed_days,
    scheduled_days: log.scheduled_days,
    reviewed_at: log.reviewed_at
  });

  // Append skill-mastery evidence (best effort; separate from FSRS card state).
  await recordSkillEvent({
    eventType: "review_completed",
    skillId: card.skill_id,
    learningItemId: card.learning_item_id,
    reviewCardId: cardId
  });

  revalidatePath("/review");

  return { status: "ok", state: schedule.state, dueAt: schedule.due_at };
}
