import { createClient } from "@/lib/supabase/server";
import { logConfiguredFailure } from "@/lib/supabase/errors";
import { getProfileForUser } from "@/features/profile/profile-queries";
import { getMasterySummary } from "@/features/mastery/mastery-queries";
import {
  getEligibleReviewItems,
  getFirstLearningItemIdForSkill,
  getLearningItemsForSkill
} from "@/features/learning-items/learning-item-seed";
import { skillPrerequisitesSeed, skillSeed } from "@/features/skills/skill-seed";
import { getPlacementResults } from "@/features/placement/placement-queries";
import { getPlacementModules } from "@/features/placement/placement-seed";
import { buildCapstoneTrackView, nextCapstoneMilestone } from "@/features/labs/capstone-view";
import { getMilestoneProgressForUser } from "@/features/labs/milestone-progress";
import { remediationRecsFromAttempts } from "@/features/remediation/remediation-recs";
import { buildRecommendations } from "./recommendation-rules";
import { selectPracticeStep } from "./practice-step-selection";
import type {
  CapstoneMilestoneRef,
  DailyPlan,
  MisconceptionRef,
  PlacementStartRef,
  SkillRef
} from "./recommendation-types";
import type { SkillStatus } from "@/features/mastery/mastery-types";

const MAX_PER_CATEGORY = 2;
const REMEDIATION_WINDOW_DAYS = 14;
const PLACEMENT_LEVEL_RANK: Record<"start_here" | "review_soon", number> = { start_here: 0, review_soon: 1 };

/**
 * Turn stored placement results into ranked starting suggestions (#125):
 * start_here before review_soon, then by module display order, capped. Each links
 * to the module's first placement item. Pure; empty when there is no placement.
 */
function placementStartsFromResults(
  results: { module_id: string; level: string }[]
): PlacementStartRef[] {
  const modules = getPlacementModules();
  const moduleById = new Map(modules.map((m) => [m.module_id, m]));
  const orderById = new Map(modules.map((m, index) => [m.module_id, index]));

  return results
    .filter((r): r is { module_id: string; level: "start_here" | "review_soon" } =>
      (r.level === "start_here" || r.level === "review_soon") && moduleById.has(r.module_id)
    )
    .sort(
      (a, b) =>
        PLACEMENT_LEVEL_RANK[a.level] - PLACEMENT_LEVEL_RANK[b.level] ||
        (orderById.get(a.module_id) ?? 0) - (orderById.get(b.module_id) ?? 0)
    )
    .slice(0, MAX_PER_CATEGORY)
    .map((r) => {
      const module = moduleById.get(r.module_id)!;
      return { moduleId: r.module_id, title: module.title, itemId: module.item_ids[0] ?? null, level: r.level };
    });
}

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

  const toPracticeRef = (skillId: string, title: string, status: SkillStatus | "unknown"): SkillRef => {
    const selection = selectPracticeStep({ status });
    const items = getLearningItemsForSkill(skillId);
    const selected =
      selection.preferredTypes
        .map((type) => items.find((item) => item.type === type))
        .find((item) => item !== undefined) ?? null;
    return {
      skillId,
      title,
      itemId: selected?.id ?? getFirstLearningItemIdForSkill(skillId),
      reason: selected ? selection.reason : undefined
    };
  };

  const toRef = (skillId: string, title: string): SkillRef => ({
    skillId,
    title,
    itemId: getFirstLearningItemIdForSkill(skillId)
  });

  const regressedSkills = mastery.skills
    .filter((skill) => skill.status === "regressed")
    .slice(0, MAX_PER_CATEGORY)
    .map((skill) => toPracticeRef(skill.skillId, skill.title, skill.status));

  const weakSkills = mastery.skills
    .filter((skill) => skill.status === "weak")
    .slice(0, MAX_PER_CATEGORY)
    .map((skill) => toPracticeRef(skill.skillId, skill.title, skill.status));

  const settled = new Set(
    mastery.skills.filter((skill) => skill.status === "strong" || skill.status === "mastered").map((skill) => skill.skillId)
  );
  const nextEligible = getEligibleReviewItems().find(({ skillId }) => !settled.has(skillId));
  const nextLesson: SkillRef | null = nextEligible
    ? toPracticeRef(nextEligible.skillId, nextEligible.item.title, statusBySkill.get(nextEligible.skillId) ?? "unknown")
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
  let placementStarts: PlacementStartRef[] = [];
  let nextMilestone: CapstoneMilestoneRef | null = null;
  let misconceptions: MisconceptionRef[] = [];
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
      if (due.error) {
        // A configured backend failure must be observable, not a silent zero
        // due-review count that masquerades as an up-to-date plan (#146).
        logConfiguredFailure("recommendations", due.error);
      } else {
        dueReviewCount = due.count ?? 0;
      }
      const profile = await getProfileForUser(user.id);
      dailyReviewMinutes = profile?.daily_review_minutes ?? null;

      // #125: feed persisted placement evidence into the ranking with a reason.
      placementStarts = placementStartsFromResults(await getPlacementResults());

      // #130: suggest the next incomplete required capstone milestone.
      const milestoneProgress = await getMilestoneProgressForUser();
      const completedMilestones = new Set(
        milestoneProgress.filter((p) => p.status === "completed").map((p) => p.milestone_id)
      );
      nextMilestone = nextCapstoneMilestone(buildCapstoneTrackView(), completedMilestones);

      // #126: name observed misconceptions from recent wrong answers.
      const since = new Date(now.getTime() - REMEDIATION_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const wrong = await supabase
        .from("learning_item_attempts")
        .select("learning_item_id,selected_choice_id")
        .eq("user_id", user.id)
        .eq("is_correct", false)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(200);
      if (!wrong.error) {
        misconceptions = remediationRecsFromAttempts(
          (wrong.data ?? []).map((row) => ({
            learning_item_id: row.learning_item_id as string,
            selected_choice_id: (row.selected_choice_id as string | null) ?? null
          }))
        )
          .slice(0, MAX_PER_CATEGORY)
          .map((rec) => ({ title: rec.title, reason: rec.reason, itemId: rec.itemId }));
      }
    }
  }

  return {
    authenticated: mastery.authenticated,
    recommendations: buildRecommendations({
      dueReviewCount,
      dailyReviewMinutes,
      regressedSkills,
      weakSkills,
      misconceptions,
      placementStarts,
      nextLesson,
      prerequisite,
      nextMilestone
    })
  };
}
