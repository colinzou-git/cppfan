// Placement assessment data (#125). The questions come from the curriculum seed
// (answer-key-free public choices), so the assessment renders identically signed
// out, offline, and pre-migration. Persisted results are read per-user via RLS.
import { createClient } from "@/lib/supabase/server";
import { getLearningItemById } from "@/features/learning-items/learning-item-seed";
import { getPlacementModules } from "./placement-seed";
import type { PlacementLevel } from "./placement-scoring";
import type { PublicLearningItemChoice } from "@/features/learning-items/learning-item-types";

export type PlacementQuestion = {
  itemId: string;
  moduleId: string;
  moduleTitle: string;
  prompt: string;
  choices: PublicLearningItemChoice[];
};

export type StoredPlacementResult = {
  module_id: string;
  level: PlacementLevel;
  correct: number;
  total: number;
};

/** The placement questions in module/display order (answer keys never included). */
export function getPlacementAssessment(): PlacementQuestion[] {
  const questions: PlacementQuestion[] = [];
  for (const module of getPlacementModules()) {
    for (const itemId of module.item_ids) {
      const details = getLearningItemById(itemId);
      if (!details) {
        continue;
      }
      questions.push({
        itemId,
        moduleId: module.module_id,
        moduleTitle: module.title,
        prompt: details.item.prompt,
        choices: details.choices
      });
    }
  }
  return questions;
}

/**
 * The signed-in learner's stored placement results (empty when signed out,
 * unconfigured, or not yet taken). Read-only; never throws.
 */
export async function getPlacementResults(): Promise<StoredPlacementResult[]> {
  const supabase = await createClient();
  if (!supabase) {
    return [];
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("placement_results")
    .select("module_id,level,correct,total")
    .eq("user_id", user.id);
  if (error || !data) {
    return [];
  }
  return data as StoredPlacementResult[];
}
