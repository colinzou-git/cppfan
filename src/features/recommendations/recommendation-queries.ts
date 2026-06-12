import { createClient } from "@/lib/supabase/server";
import { getProfileForUser } from "@/features/profile/profile-queries";
import { getMasterySummary } from "@/features/mastery/mastery-queries";
import { getEligibleReviewItems, getFirstLearningItemIdForSkill } from "@/features/learning-items/learning-item-seed";
import { skillPrerequisitesSeed, skillSeed } from "@/features/skills/skill-seed";
import { buildRecommendations } from "./recommendation-rules";
import type { DailyPlan, SkillRef } from "./recommendation-types";

const MAX_PER_CATEGORY = 2;

/**
 * Assemble a daily plan from due reviews, mastery (weak/regressed skills), the
 * current learning path, recommended prerequisites, and profile goals, then
 * order it with the rule-based engine. Works signed-out (it still suggests a
 * first lesson and exploration) and pre-migration (counts fall back to zero).
 */
export async function getDailyPlan(now: Date = new Date()): Promise<DailyPlan> {
  const mastery = await getMasterySummary();
  const statusBySkill = new Map(mastery.skills.map((skill) => [skill.skillId, skill.status]));
  const titleBySkill = new Map(skillSeed.map((skill) => [skill.id, skill.title]));

  const toRef = (skillId: string, title: string): SkillRef => ({
    skillId,
    title,
    itemId: getFirstLearningItemIdForSkill(skillId)
  });

  const regressedSkills = mastery.skills
    .filter((skill) => skill.status === "regressed")
    .slice(0, MAX_PER_CATEGORY)
    .map((skill) => toRef(skill.skillId, skill.title));

  const weakSkills = mastery.skills
    .filter((skill) => skill.status === "weak")
    .slice(0, MAX_PER_CATEGORY)
    .map((skill) => toRef(skill.skillId, skill.title));

  const settled = new Set(
    mastery.skills.filter((skill) => skill.status === "strong" || skill.status === "mastered").map((skill) => skill.skillId)
  );
  const nextEligible = getEligibleReviewItems().find(({ skillId }) => !settled.has(skillId));
  const nextLesson: SkillRef | null = nextEligible
    ? { skillId: nextEligible.skillId, title: nextEligible.item.title, itemId: nextEligible.item.id }
    : null;

  // A weak prerequisite of the next skill, surfaced as a recommendation only.
  let prerequisite: SkillRef | null = null;
  if (nextLesson) {
    const prereqIds = skillPrerequisitesSeed
      .filter((edge) => edge.skill_id === nextLesson.skillId)
      .map((edge) => edge.prerequisite_skill_id);
    const weakPrereqId = prereqIds.find((id) => statusBySkill.get(id) === "weak");
    if (weakPrereqId) {
      prerequisite = toRef(weakPrereqId, titleBySkill.get(weakPrereqId) ?? weakPrereqId);
    }
  }

  let dueReviewCount = 0;
  let dailyReviewMinutes: number | null = null;
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      const due = await supabase
        .from("review_cards")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .lte("due_at", now.toISOString());
      if (!due.error) {
        dueReviewCount = due.count ?? 0;
      }
      const profile = await getProfileForUser(user.id);
      dailyReviewMinutes = profile?.daily_review_minutes ?? null;
    }
  }

  return {
    authenticated: mastery.authenticated,
    recommendations: buildRecommendations({
      dueReviewCount,
      dailyReviewMinutes,
      regressedSkills,
      weakSkills,
      nextLesson,
      prerequisite
    })
  };
}
