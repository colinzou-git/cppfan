import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError, logConfiguredFailure } from "@/lib/supabase/errors";
import {
  getItemLinksBySkill as getSeedItemLinksBySkill,
  getLearningItemById as getSeedLearningItemById
} from "./learning-item-seed";
import { orderPublicChoices } from "./choice-ordering";
import type {
  LearningItem,
  LearningItemSkill,
  LearningItemWithDetails,
  PublicLearningItemChoice
} from "./learning-item-types";

/**
 * Outcome of a learning-item read (#146). `error` means a configured database
 * failed — the page must show a recoverable message rather than silently
 * serving seed content as if it were database content.
 */
export type LearningItemResult =
  | { status: "ok"; data: LearningItemWithDetails }
  | { status: "not_found" }
  | { status: "error" };

type ReadResult<T> = { data: T | null; error: { code?: string | null } | null };

function withDisplayChoiceOrder(details: LearningItemWithDetails): LearningItemWithDetails {
  return {
    ...details,
    choices: orderPublicChoices(details.choices, `learning-item:${details.item.id}`)
  };
}

function fromSeed(seed: LearningItemWithDetails | null): LearningItemResult {
  return seed ? { status: "ok", data: withDisplayChoiceOrder(seed) } : { status: "not_found" };
}

/**
 * Pure decision for a learning-item read, separated for deterministic tests.
 * Seed fallback is used only for missing-object (pre-migration) errors or a
 * plain not-found; any other configured error returns `error` and never swaps
 * database content for seed content.
 */
export function resolveLearningItemResult(
  itemResult: ReadResult<LearningItem>,
  skillsResult: ReadResult<LearningItemSkill[]>,
  choicesResult: ReadResult<PublicLearningItemChoice[]>,
  seed: LearningItemWithDetails | null
): LearningItemResult {
  if (itemResult.error) {
    return isMissingObjectError(itemResult.error) ? fromSeed(seed) : { status: "error" };
  }
  if (!itemResult.data) {
    // Not present in the configured database (pre-migration/partial rollout):
    // a read may fall back to seed content; a real error would not reach here.
    return fromSeed(seed);
  }
  for (const result of [skillsResult, choicesResult]) {
    if (result.error) {
      return isMissingObjectError(result.error) ? fromSeed(seed) : { status: "error" };
    }
  }
  return {
    status: "ok",
    data: withDisplayChoiceOrder({
      item: itemResult.data,
      skills: skillsResult.data ?? [],
      choices: choicesResult.data ?? []
    })
  };
}

const ITEM_COLUMNS =
  "id,type,title,prompt,explanation,difficulty,estimated_minutes,order_index,is_active,created_at,updated_at";
const SKILL_MAP_COLUMNS = "learning_item_id,skill_id,is_primary,created_at";
// Never select is_correct here: this path feeds client display. Grading reads
// the answer key separately, server-side (issue #3).
const PUBLIC_CHOICE_COLUMNS = "id,learning_item_id,content,order_index,created_at";

/**
 * Read one learning item with its skill mappings and (answer-key-free) choices.
 * Seed fallback is used only when Supabase is unconfigured, the migration is
 * absent (pre-migration), or the item is simply not found — a configured
 * database error returns `{ status: "error" }` instead of silently serving seed
 * content (#146).
 */
export async function getLearningItemWithDetails(itemId: string): Promise<LearningItemResult> {
  const supabase = await createClient();
  const seed = getSeedLearningItemById(itemId);

  if (!supabase) {
    return fromSeed(seed);
  }

  const itemResult = await supabase
    .from("learning_items")
    .select(ITEM_COLUMNS)
    .eq("id", itemId)
    .eq("is_active", true)
    .maybeSingle();

  if (itemResult.error || !itemResult.data) {
    const resolved = resolveLearningItemResult(
      itemResult as ReadResult<LearningItem>,
      { data: null, error: null },
      { data: null, error: null },
      seed
    );
    if (resolved.status === "error") {
      console.error(`[learning-items] item read failed (code=${itemResult.error?.code ?? "none"})`);
    }
    return resolved;
  }

  const [skillsResult, choicesResult] = await Promise.all([
    supabase.from("learning_item_skills").select(SKILL_MAP_COLUMNS).eq("learning_item_id", itemId),
    supabase
      .from("learning_item_choices")
      .select(PUBLIC_CHOICE_COLUMNS)
      .eq("learning_item_id", itemId)
      .order("order_index", { ascending: true })
  ]);

  const resolved = resolveLearningItemResult(
    itemResult as ReadResult<LearningItem>,
    skillsResult as ReadResult<LearningItemSkill[]>,
    choicesResult as ReadResult<PublicLearningItemChoice[]>,
    seed
  );
  if (resolved.status === "error") {
    console.error(
      `[learning-items] item detail read failed (skills=${skillsResult.error?.code ?? "none"}, choices=${choicesResult.error?.code ?? "none"})`
    );
  }
  return resolved;
}

/**
 * Map of skill id -> first learning item id (lowest order_index), used to link
 * the dashboard skill map preview to real content. Falls back to seed data.
 */
export async function getItemLinksBySkill(): Promise<Record<string, string>> {
  const supabase = await createClient();

  if (!supabase) {
    return getSeedItemLinksBySkill();
  }

  const [itemsResult, mapResult] = await Promise.all([
    supabase
      .from("learning_items")
      .select("id,order_index")
      .eq("is_active", true)
      .order("order_index", { ascending: true }),
    supabase.from("learning_item_skills").select("learning_item_id,skill_id")
  ]);

  if (itemsResult.error || mapResult.error || (itemsResult.data ?? []).length === 0) {
    // Non-authoritative convenience map; seed fallback is fine, but a configured
    // failure must be observable rather than silently swallowed (#146).
    logConfiguredFailure("learning-items", itemsResult.error ?? mapResult.error);
    return getSeedItemLinksBySkill();
  }

  const orderById = new Map<string, number>(
    (itemsResult.data ?? []).map((row) => [row.id as string, row.order_index as number])
  );

  const bySkill = new Map<string, { id: string; order: number }>();
  for (const mapping of mapResult.data ?? []) {
    const order = orderById.get(mapping.learning_item_id as string);
    if (order === undefined) {
      continue;
    }
    const current = bySkill.get(mapping.skill_id as string);
    if (!current || order < current.order) {
      bySkill.set(mapping.skill_id as string, { id: mapping.learning_item_id as string, order });
    }
  }

  const links: Record<string, string> = {};
  for (const [skillId, value] of bySkill) {
    links[skillId] = value.id;
  }
  return links;
}
