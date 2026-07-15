/*
 * Dynamic lab source (#489): the authenticated owner's published user-created
 * labs, shaped as ProjectCardData so they mix into the /labs catalog alongside
 * native project labs with a source badge. Server-only (reads the owner-scoped
 * DB); returns [] without a backend. Never exposes reference solutions, hidden
 * tests, or author notes — only catalog metadata.
 */

import { createClient } from "@/lib/supabase/server";
import { parseLabPayload } from "@/features/user-content/lab-content-schema";
import { userLearningItemId } from "@/features/user-content/user-content-id";
import type { ProjectCardData } from "./project-card";

export async function getMyPublishedLabViews(): Promise<ProjectCardData[]> {
  const supabase = await createClient();
  if (!supabase) {
    return [];
  }
  const { data: items, error } = await supabase
    .from("user_content_items")
    .select("id,current_published_version_id")
    .eq("kind", "lab")
    .eq("lifecycle_status", "published");
  if (error || !items || items.length === 0) {
    return [];
  }

  const views: ProjectCardData[] = [];
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
    const parsed = parseLabPayload((version as { payload: unknown }).payload);
    if (!parsed.ok) {
      continue;
    }
    const payload = parsed.value;
    // Milestone titles double as the card's plain-text guidance; a single-task
    // lab shows its summary line. No answer-bearing content is included.
    const milestones =
      payload.mode === "milestones"
        ? (payload.milestones ?? []).map((m) => m.title)
        : payload.summary
          ? [payload.summary]
          : [];
    views.push({
      id: userLearningItemId(item.id),
      title: payload.title,
      summary: payload.summary,
      difficulty: payload.difficulty === "beginner" ? "beginner" : "intermediate",
      focus: payload.tags && payload.tags.length > 0 ? payload.tags : undefined,
      milestones,
      sourceVersion: item.current_published_version_id
    });
  }
  return views;
}
