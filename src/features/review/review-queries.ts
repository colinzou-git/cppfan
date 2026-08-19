import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getEligibleReviewItems } from "@/features/learning-items/learning-item-seed";
import { orderPublicChoices } from "@/features/learning-items/choice-ordering";
import type {
  DueReviewEntry,
  ReviewCard,
  ReviewPreviewEntry,
  ReviewQueueView
} from "./review-types";
import { isMissingObjectError, logConfiguredFailure } from "@/lib/supabase/errors";
import { loadReviewItemContent, type ReviewItemContent } from "./review-item-loader";

const CARD_COLUMNS =
  "id,user_id,learning_item_id,skill_id,state,due_at,stability,difficulty,elapsed_days,scheduled_days,learning_steps,reps,lapses,last_reviewed_at,created_at,updated_at";

function seedPreview(): ReviewPreviewEntry[] {
  return getEligibleReviewItems().map(({ item, skillId }) => ({
    itemId: item.id,
    skillId,
    title: item.title,
    type: item.type
  }));
}

function toDueEntry(
  card: Pick<ReviewCard, "id" | "learning_item_id" | "skill_id">,
  details: ReviewItemContent | undefined
): DueReviewEntry | null {
  if (!details) {
    return null;
  }
  return {
    cardId: card.id,
    itemId: card.learning_item_id,
    skillId: card.skill_id,
    title: details.item.title,
    type: details.item.type,
    prompt: details.item.prompt,
    explanation: details.item.explanation,
    // The database loader selects answer-key-free public choices. Shuffle the
    // revealed reference list so review cards do not preserve authoring order.
    choices: orderPublicChoices(details.choices, `review:${card.id}:${card.learning_item_id}`)
  };
}

/**
 * The review queue. Eligible items are always previewable; due cards require a
 * signed-in learner and the applied migration.
 */
export async function getReviewQueue(now: Date = new Date()): Promise<ReviewQueueView> {
  const preview = seedPreview();
  const supabase = await createClient();

  if (!supabase) {
    return { state: "unconfigured", authenticated: false, due: [], preview };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { state: "signed_out", authenticated: false, due: [], preview };
  }

  // #142: reading the queue must never enroll content. Cards are created only
  // from learning evidence (see enrollReviewCard), so a new learner has zero due
  // reviews until they actually practice.
  const dueResult = await supabase
    .from("review_cards")
    .select(CARD_COLUMNS)
    .eq("user_id", user.id)
    .lte("due_at", now.toISOString())
    .order("due_at", { ascending: true });

  if (dueResult.error) {
    if (!isMissingObjectError(dueResult.error)) {
      logConfiguredFailure("review-queue", dueResult.error);
    }
    return {
      state: isMissingObjectError(dueResult.error) ? "unavailable" : "error",
      authenticated: true,
      due: [],
      preview
    };
  }

  const cards = (dueResult.data ?? []) as ReviewCard[];
  const content = await loadReviewItemContent(
    supabase,
    cards.map((card) => card.learning_item_id)
  );
  if (content.status !== "ok") {
    return { state: content.status, authenticated: true, due: [], preview };
  }

  const due = cards
    .map((card) => toDueEntry(card, content.items.get(card.learning_item_id)))
    .filter((entry): entry is DueReviewEntry => entry !== null);

  return { state: "ready", authenticated: true, due, preview };
}

/** Fetch a single review card owned by the signed-in learner (for grading a review). */
export async function getReviewCardForUser(
  supabase: SupabaseClient,
  userId: string,
  cardId: string
): Promise<ReviewCard | null> {
  const { data, error } = await supabase
    .from("review_cards")
    .select(CARD_COLUMNS)
    .eq("id", cardId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ReviewCard;
}
