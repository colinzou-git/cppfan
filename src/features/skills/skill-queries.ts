import { createClient } from "@/lib/supabase/server";
import { logConfiguredFailure } from "@/lib/supabase/errors";
import { getSeedSkillMapPreview, skillModules } from "./skill-seed";
import type { Skill, SkillMapPreviewData, SkillPrerequisite } from "./skill-types";

const SKILL_COLUMNS =
  "id,domain,module_id,title,description,learner_goal,level,item_types,order_index,is_active,created_at,updated_at";

const PREREQUISITE_COLUMNS = "skill_id,prerequisite_skill_id,relationship_type,created_at";

/**
 * Read the skill map from Supabase. Returns null when Supabase is not
 * configured or the skill migration has not been applied yet, so callers can
 * fall back to local seed data.
 */
export async function getSkillMapFromDatabase(): Promise<SkillMapPreviewData | null> {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const [skillsResult, prerequisitesResult] = await Promise.all([
    supabase.from("skills").select(SKILL_COLUMNS).eq("is_active", true).order("order_index", { ascending: true }),
    supabase.from("skill_prerequisites").select(PREREQUISITE_COLUMNS)
  ]);

  if (skillsResult.error || prerequisitesResult.error) {
    // Read-only preview: a labeled seed fallback is acceptable, but a configured
    // failure must be observable rather than silently swallowed (#146).
    logConfiguredFailure("skills", skillsResult.error ?? prerequisitesResult.error);
    return null;
  }

  const skills = (skillsResult.data ?? []) as Skill[];

  if (skills.length === 0) {
    return null;
  }

  return {
    modules: [...skillModules].sort((a, b) => a.order_index - b.order_index),
    skills,
    prerequisites: (prerequisitesResult.data ?? []) as SkillPrerequisite[],
    source: "database"
  };
}

/**
 * Resolve the skill map preview, preferring the database when it is available
 * and falling back to the bundled seed otherwise. The dashboard preview is
 * read-only, so it is safe to render before the migration is applied.
 */
export async function getSkillMapPreview(): Promise<SkillMapPreviewData> {
  const fromDatabase = await getSkillMapFromDatabase();
  return fromDatabase ?? getSeedSkillMapPreview();
}
