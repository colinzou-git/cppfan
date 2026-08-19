import type { SupabaseClient } from "@supabase/supabase-js";
import { getLearningItemById } from "@/features/learning-items/learning-item-seed";
import type {
  LearningItem,
  PublicLearningItemChoice
} from "@/features/learning-items/learning-item-types";
import { isMissingObjectError, logConfiguredFailure } from "@/lib/supabase/errors";

export type ReviewItemContent = {
  item: LearningItem;
  choices: PublicLearningItemChoice[];
};

export type ReviewItemLoadResult =
  | { status: "ok"; items: Map<string, ReviewItemContent> }
  | { status: "unavailable" | "error" };

const ITEM_COLUMNS =
  "id,type,title,prompt,explanation,difficulty,estimated_minutes,order_index,is_active,created_at,updated_at";
const PUBLIC_CHOICE_COLUMNS = "id,learning_item_id,content,order_index,created_at";

function seedItems(itemIds: readonly string[]): Map<string, ReviewItemContent> {
  const items = new Map<string, ReviewItemContent>();
  for (const itemId of itemIds) {
    const details = getLearningItemById(itemId);
    if (details) {
      items.set(itemId, { item: details.item, choices: details.choices });
    }
  }
  return items;
}

export function buildReviewItemContent(
  itemRows: readonly LearningItem[],
  choiceRows: readonly PublicLearningItemChoice[]
): Map<string, ReviewItemContent> {
  const choicesByItem = new Map<string, PublicLearningItemChoice[]>();
  for (const choice of choiceRows) {
    choicesByItem.set(choice.learning_item_id, [
      ...(choicesByItem.get(choice.learning_item_id) ?? []),
      choice
    ]);
  }

  return new Map(
    itemRows.map((item) => [item.id, { item, choices: choicesByItem.get(item.id) ?? [] }])
  );
}

/**
 * Batch-load due-card content from the configured database. This keeps native,
 * database-only, and owner-projected lessons on the same read path and never
 * silently drops a valid card merely because its item is absent from the seed.
 */
export async function loadReviewItemContent(
  supabase: SupabaseClient,
  itemIds: readonly string[]
): Promise<ReviewItemLoadResult> {
  const uniqueIds = [...new Set(itemIds)];
  if (uniqueIds.length === 0) {
    return { status: "ok", items: new Map() };
  }

  const [itemResult, choiceResult] = await Promise.all([
    supabase.from("learning_items").select(ITEM_COLUMNS).in("id", uniqueIds).eq("is_active", true),
    supabase
      .from("learning_item_choices")
      .select(PUBLIC_CHOICE_COLUMNS)
      .in("learning_item_id", uniqueIds)
      .order("order_index", { ascending: true })
  ]);

  if (itemResult.error) {
    if (isMissingObjectError(itemResult.error)) {
      return { status: "ok", items: seedItems(uniqueIds) };
    }
    logConfiguredFailure("review-items", itemResult.error);
    return { status: "error" };
  }

  if (choiceResult.error && !isMissingObjectError(choiceResult.error)) {
    logConfiguredFailure("review-item-choices", choiceResult.error);
    return { status: "error" };
  }

  const itemRows = (itemResult.data ?? []) as LearningItem[];
  const items = buildReviewItemContent(
    itemRows,
    choiceResult.error ? [] : ((choiceResult.data ?? []) as PublicLearningItemChoice[])
  );
  if (choiceResult.error) {
    for (const item of itemRows) {
      const seed = getLearningItemById(item.id);
      if (seed) {
        items.set(item.id, { item, choices: seed.choices });
      }
    }
  }

  return { status: "ok", items };
}
