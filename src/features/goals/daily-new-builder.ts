import { getLearningItemsForSkill } from "@/features/learning-items/learning-item-seed";
import { skillPrerequisitesSeed } from "@/features/skills/skill-seed";
import type { StudyGoalView } from "./goal-view-types";
import type { DailyNewAction, DailyNewPlan } from "./daily-new-model";

type BuildInput = {
  goals: StudyGoalView[];
  evidencedItemIds: ReadonlySet<string>;
  dailyCap: number;
};

function nextItem(skillId: string, evidenced: ReadonlySet<string>) {
  return getLearningItemsForSkill(skillId).find((item) => !evidenced.has(item.id)) ?? null;
}

function candidate(
  goal: StudyGoalView,
  targetId: string,
  skillId: string,
  reason: string,
  evidenced: ReadonlySet<string>
): DailyNewAction | null {
  const item = nextItem(skillId, evidenced);
  if (!item) return null;
  return {
    id: `goal:${goal.id}:revision:${goal.revisionId}:target:${targetId}:item:${item.id}`,
    itemId: item.id,
    skillId,
    title: item.title,
    reason,
    href: `/learn/${item.id}`,
    estimatedMinutes: item.estimated_minutes,
    goalIds: [goal.id],
    goalTitles: [goal.title],
    targetIds: [targetId],
    source: "planned"
  };
}

function mergeAction(existing: DailyNewAction, incoming: DailyNewAction): DailyNewAction {
  return {
    ...existing,
    goalIds: [...new Set([...existing.goalIds, ...incoming.goalIds])],
    goalTitles: [...new Set([...existing.goalTitles, ...incoming.goalTitles])],
    targetIds: [...new Set([...existing.targetIds, ...incoming.targetIds])]
  };
}

/**
 * Allocate only unfinished acquisition work. Review cards are intentionally not
 * accepted as input, so this function cannot leak FSRS work into Daily New.
 */
export function buildDailyNewPlan({ goals, evidencedItemIds, dailyCap }: BuildInput): DailyNewPlan {
  const byItem = new Map<string, DailyNewAction>();
  const orderedGoals = goals.slice().sort((a, b) =>
    a.endLocalDate.localeCompare(b.endLocalDate) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)
  );

  for (const goal of orderedGoals) {
    for (const target of goal.targets.slice().sort((a, b) => a.orderIndex - b.orderIndex || a.id.localeCompare(b.id))) {
      if (target.targetKind !== "acquire_skill" || !target.skillId) continue;

      const prerequisites = skillPrerequisitesSeed
        .filter((edge) => edge.skill_id === target.skillId)
        .sort(
          (a, b) =>
            Number(b.relationship_type === "required") - Number(a.relationship_type === "required") ||
            a.prerequisite_skill_id.localeCompare(b.prerequisite_skill_id)
        );
      const unfinishedPrerequisite = prerequisites.find((edge) => nextItem(edge.prerequisite_skill_id, evidencedItemIds));
      const action = unfinishedPrerequisite
        ? candidate(
            goal,
            target.id,
            unfinishedPrerequisite.prerequisite_skill_id,
            `${unfinishedPrerequisite.relationship_type === "required" ? "Build the required" : "Strengthen the recommended"} prerequisite for ${target.title}.`,
            evidencedItemIds
          )
        : candidate(goal, target.id, target.skillId, `Continue the unfinished acquisition path for ${target.title}.`, evidencedItemIds);

      if (!action) continue;
      const existing = byItem.get(action.itemId);
      byItem.set(action.itemId, existing ? mergeAction(existing, action) : action);
    }
  }

  const cap = Math.max(0, Math.min(10, Math.floor(dailyCap)));
  const candidates = [...byItem.values()];
  const actions = candidates.slice(0, cap);
  const extra = candidates[cap] ?? null;

  return {
    state: "ready",
    authenticated: true,
    activeGoalCount: goals.length,
    dailyCap: cap,
    actions,
    extraAction: extra ? { ...extra, source: "learn_extra" } : null
  };
}
