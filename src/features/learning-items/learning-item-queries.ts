import { createClient } from "@/lib/supabase/server";
import {
  getItemLinksBySkill as getSeedItemLinksBySkill,
  getLearningItemById as getSeedLearningItemById
} from "./learning-item-seed";
import type {
  LearningItem,
  LearningItemSkill,
  LearningItemWithDetails,
  PublicLearningItemChoice
} from "./learning-item-types";

const ITEM_COLUMNS =
  "id,type,title,prompt,explanation,difficulty,estimated_minutes,order_index,is_active,created_at,updated_at";
const SKILL_MAP_COLUMNS = "learning_item_id,skill_id,is_primary,created_at";
// Never select is_correct here: this path feeds client display. Grading reads
// the answer key separately, server-side (issue #3).
const PUBLIC_CHOICE_COLUMNS = "id,learning_item_id,content,order_index,created_at";

/**
 * Read one learning item with its skill mappings and (answer-key-free) choices.
 * Falls back to the bundled seed when Supabase is unconfigured or the learning
 * item migration has not been applied yet.
 */
export async function getLearningItemWithDetails(itemId: string): Promise<LearningItemWithDetails | null> {
  const supabase = await createClient();

  if (!supabase) {
    return getSeedLearningItemById(itemId);
  }

  const itemResult = await supabase
    .from("learning_items")
    .select(ITEM_COLUMNS)
    .eq("id", itemId)
    .eq("is_active", true)
    .maybeSingle();

  if (itemResult.error || !itemResult.data) {
    return getSeedLearningItemById(itemId);
  }

  const [skillsResult, choicesResult] = await Promise.all([
    supabase.from("learning_item_skills").select(SKILL_MAP_COLUMNS).eq("learning_item_id", itemId),
    supabase
      .from("learning_item_choices")
      .select(PUBLIC_CHOICE_COLUMNS)
      .eq("learning_item_id", itemId)
      .order("order_index", { ascending: true })
  ]);

  if (skillsResult.error || choicesResult.error) {
    return getSeedLearningItemById(itemId);
  }

  return {
    item: itemResult.data as LearningItem,
    skills: (skillsResult.data ?? []) as LearningItemSkill[],
    choices: (choicesResult.data ?? []) as PublicLearningItemChoice[]
  };
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
