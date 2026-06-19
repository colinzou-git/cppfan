import { getLearningItemsForSkill } from "@/features/learning-items/learning-item-seed";
import { skillPrerequisitesSeed } from "@/features/skills/skill-seed";
import type { StudyGoalView } from "./goal-view-types";
import type { DailyNewAction, DailyNewPlan } from "./daily-new-model";

type Input = { goals: StudyGoalView[]; evidencedItemIds: ReadonlySet<string>; dailyCap: number };

function nextItem(skillId: string, done: ReadonlySet<string>) {
  return getLearningItemsForSkill(skillId).find((item) => !done.has(item.id)) ?? null;
}

function makeAction(goal: StudyGoalView, target: StudyGoalView["targets"][number], skillId: string, reason: string, done: ReadonlySet<string>) {
  const item = nextItem(skillId, done);
  if (!item) return null;
  const action: DailyNewAction = {
    id: `goal:${goal.id}:revision:${goal.revisionId}:target:${target.id}:item:${item.id}`,
    itemId: item.id,
    skillId,
    title: item.title,
    reason,
    href: `/learn/${item.id}`,
    estimatedMinutes: item.estimated_minutes,
    goalIds: [goal.id],
    goalTitles: [goal.title],
    targetIds: [target.id],
    primaryGoalId: goal.id,
    revisionId: goal.revisionId,
    primaryTargetId: target.id,
    acquisitionContractVersion: target.acquisitionContractVersion,
    source: "planned"
  };
  return action;
}

export function buildDailyNewPlan({ goals, evidencedItemIds, dailyCap }: Input): DailyNewPlan {
  const byItem = new Map<string, DailyNewAction>();
  const orderedGoals = goals.slice().sort((a, b) =>
    a.endLocalDate.localeCompare(b.endLocalDate) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)
  );

  for (const goal of orderedGoals) {
    const targets = goal.targets.slice().sort((a, b) => a.orderIndex - b.orderIndex || a.id.localeCompare(b.id));
    for (const target of targets) {
      if (target.targetKind !== "acquire_skill" || !target.skillId) continue;
      const prerequisites = skillPrerequisitesSeed
        .filter((edge) => edge.skill_id === target.skillId)
        .sort((a, b) => Number(b.relationship_type === "required") - Number(a.relationship_type === "required") || a.prerequisite_skill_id.localeCompare(b.prerequisite_skill_id));
      const prerequisite = prerequisites.find((edge) => nextItem(edge.prerequisite_skill_id, evidencedItemIds));
      const action = prerequisite
        ? makeAction(goal, target, prerequisite.prerequisite_skill_id, `${prerequisite.relationship_type === "required" ? "Build the required" : "Strengthen the recommended"} prerequisite for ${target.title}.`, evidencedItemIds)
        : makeAction(goal, target, target.skillId, `Continue the unfinished acquisition path for ${target.title}.`, evidencedItemIds);
      if (!action) continue;
      const previous = byItem.get(action.itemId);
      byItem.set(action.itemId, previous ? {
        ...previous,
        goalIds: [...new Set([...previous.goalIds, ...action.goalIds])],
        goalTitles: [...new Set([...previous.goalTitles, ...action.goalTitles])],
        targetIds: [...new Set([...previous.targetIds, ...action.targetIds])]
      } : action);
    }
  }

  const cap = Math.max(0, Math.min(10, Math.floor(dailyCap)));
  const eligibleActions = [...byItem.values()];
  return {
    state: "ready",
    authenticated: true,
    activeGoalCount: goals.length,
    dailyCap: cap,
    localPlanDate: "",
    timezone: "UTC",
    dailyPlanVersion: 0,
    actions: eligibleActions.slice(0, cap),
    allocatedExtraActions: [],
    eligibleActions,
    extraAction: eligibleActions[cap] ? { ...eligibleActions[cap], source: "learn_extra" } : null
  };
}
