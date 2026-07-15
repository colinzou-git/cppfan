/*
 * Dynamic exercise source (#488): the authenticated owner's published
 * user-created exercises, shaped as ExerciseView so they mix into the /exercises
 * catalog alongside native exercises with a source badge. Server-only (reads the
 * owner-scoped DB); returns [] without a backend. Never exposes reference
 * solutions or hidden tests — only catalog metadata.
 */

import { createClient } from "@/lib/supabase/server";
import { parseExercisePayload } from "@/features/user-content/exercise-content-schema";
import { userLearningItemId, userSkillId } from "@/features/user-content/user-content-id";
import type { ExerciseView } from "./exercise-view";

export async function getMyPublishedExerciseViews(): Promise<ExerciseView[]> {
  const supabase = await createClient();
  if (!supabase) {
    return [];
  }
  const { data: items, error } = await supabase
    .from("user_content_items")
    .select("id,current_published_version_id")
    .eq("kind", "exercise")
    .eq("lifecycle_status", "published");
  if (error || !items || items.length === 0) {
    return [];
  }

  const views: ExerciseView[] = [];
  for (const item of items as Array<{ id: string; current_published_version_id: string | null }>) {
    if (!item.current_published_version_id) {
      continue;
    }
    const { data: version } = await supabase
      .from("user_content_versions")
      .select("payload")
      .eq("id", item.current_published_version_id)
      .maybeSingle();
    if (!version) {
      continue;
    }
    const parsed = parseExercisePayload((version as { payload: unknown }).payload);
    if (!parsed.ok) {
      continue;
    }
    const payload = parsed.value;
    views.push({
      id: userLearningItemId(item.id),
      title: payload.title,
      skillIds: [userSkillId(item.id)],
      difficulty: payload.difficulty ?? "beginner",
      estimatedMinutes: payload.estimatedMinutes ?? 15,
      editableFiles: [],
      requiredTests: [],
      hints: [],
      projectLab: "",
      source: "user",
      skillTitles: payload.tags && payload.tags.length > 0 ? payload.tags : [payload.title]
    });
  }
  return views;
}
