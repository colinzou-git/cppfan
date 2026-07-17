/*
 * Dynamic interview source (#490): the authenticated owner's published
 * user-created interview problems, shaped as a lightweight catalog view so they
 * mix into the /interview page alongside native problems with a source badge.
 * Server-only (reads the owner-scoped DB); returns [] without a backend. Never
 * exposes reference solutions, hidden tests, or the rubric — only catalog
 * metadata plus the statement, per the fixed reveal policy.
 */

import { createClient } from "@/lib/supabase/server";
import { parseInterviewPayload } from "@/features/user-content/interview-content-schema";
import { userLearningItemId } from "@/features/user-content/user-content-id";
import type { ProblemGroup } from "./problem-catalog";
import type { InterviewPlanningCandidate } from "./interview-planning-candidates";

export type UserInterviewView = {
  id: string;
  title: string;
  statement: string;
  difficulty: string;
  roleRelevance: string;
  patternTags: string[];
};

export async function getMyPublishedInterviewViews(): Promise<UserInterviewView[]> {
  const supabase = await createClient();
  if (!supabase) {
    return [];
  }
  const { data: items, error } = await supabase
    .from("user_content_items")
    .select("id,current_published_version_id")
    .eq("kind", "interview_problem")
    .eq("lifecycle_status", "published");
  if (error || !items || items.length === 0) {
    return [];
  }

  const views: UserInterviewView[] = [];
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
    const parsed = parseInterviewPayload((version as { payload: unknown }).payload);
    if (!parsed.ok) {
      continue;
    }
    const payload = parsed.value;
    views.push({
      id: userLearningItemId(item.id),
      title: payload.title,
      statement: payload.statement,
      difficulty: payload.difficulty ?? "medium",
      roleRelevance: payload.roleRelevance ?? "general",
      patternTags: payload.patternTags ?? []
    });
  }
  return views;
}

/**
 * The owner's published user interview problems as study-plan candidates (#613):
 * carries the group, immutable content version, and the per-item recommendation
 * opt-out so the planner can include them like native problems. Best-effort —
 * returns [] without a backend or on any read error.
 */
export async function getMyPlanningInterviewCandidates(): Promise<InterviewPlanningCandidate[]> {
  const supabase = await createClient();
  if (!supabase) {
    return [];
  }
  const { data: items, error } = await supabase
    .from("user_content_items")
    .select("id,current_published_version_id,recommendation_enabled")
    .eq("kind", "interview_problem")
    .eq("lifecycle_status", "published");
  if (error || !items || items.length === 0) {
    return [];
  }

  const candidates: InterviewPlanningCandidate[] = [];
  for (const item of items as Array<{ id: string; current_published_version_id: string | null; recommendation_enabled: boolean | null }>) {
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
    const parsed = parseInterviewPayload((version as { payload: unknown }).payload);
    if (!parsed.ok) {
      continue;
    }
    const payload = parsed.value;
    candidates.push({
      problemId: userLearningItemId(item.id),
      source: "user",
      title: payload.title,
      group: (payload.group ?? "cpp_implementation") as ProblemGroup,
      patternTags: payload.patternTags ?? [],
      interviewCore: false,
      // Bind to the immutable published version so a republish is not treated as
      // the same "fresh" problem (#612 identity policy).
      contentVersionId: item.current_published_version_id,
      recommendationEnabled: item.recommendation_enabled !== false
    });
  }
  return candidates;
}
