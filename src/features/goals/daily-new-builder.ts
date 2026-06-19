import { skillPrerequisitesSeed } from "@/features/skills/skill-seed";
import { deriveInitialLearningState, type AcquisitionItem } from "./acquisition-contracts";
import type { StudyGoalView } from "./goal-view-types";
import type { DailyNewAction, DailyNewPlan, DailyNewReasonCode } from "./daily-new-model";

type Input = {
  goals: StudyGoalView[];
  evidencedItemIds: ReadonlySet<string>;
  dailyCap: number;
  localPlanDate?: string;
  timezone?: string;
  dailyPlanVersion?: number;
  itemsBySkill?: ReadonlyMap<string, readonly AcquisitionItem[]>;
};

function acquisitionState(
  skillId: string,
  done: ReadonlySet<string>,
  itemsBySkill?: ReadonlyMap<string, readonly AcquisitionItem[]>
) {
  return deriveInitialLearningState(
    skillId,
    [...done].map((itemId) => ({ itemId })),
    undefined,
    itemsBySkill?.get(skillId)
  );
}

function makeAction(
  goal: StudyGoalView,
  target: StudyGoalView["targets"][number],
  skillId: string,
  reason: string,
  reasonCodes: DailyNewReasonCode[],
  actionKind: DailyNewAction["actionKind"],
  done: ReadonlySet<string>,
  localPlanDate: string,
  timezone: string,
  dailyPlanVersion: number,
  itemsBySkill?: ReadonlyMap<string, readonly AcquisitionItem[]>
) {
  const state = acquisitionState(skillId, done, itemsBySkill);
  if (!state.nextItem || state.state === "initial_learning_complete" || state.state === "unavailable") return null;
  const item = state.nextItem;
  const action: DailyNewAction = {
    id: `goal:${goal.id}:revision:${goal.revisionId}:target:${target.id}:item:${item.id}`,
    algorithmVersion: "daily-new-v1",
    localPlanDate,
    timezone,
    dailyPlanVersion,
    itemId: item.id,
    skillId,
    title: item.title,
    reason,
    reasonCodes,
    href: `/learn/${item.id}`,
    estimatedMinutes: item.estimated_minutes,
    goalIds: [goal.id],
    goalTitles: [goal.title],
    targetIds: [target.id],
    primaryGoalId: goal.id,
    revisionId: goal.revisionId,
    primaryTargetId: target.id,
    actionKind,
    destinationKind: "learning_item",
    destinationId: item.id,
    acquisitionStepId: item.id,
    acquisitionState: state.state,
    acquisitionContractId: target.acquisitionContractId,
    acquisitionContractVersion: target.acquisitionContractVersion,
    completionEvidenceRule: "A trusted qualifying learning event for this exact learning item satisfies this acquisition step.",
    platformSuitability: "all_devices",
    platformNote: "This learning-item step works on Windows, iPad, and iPhone.",
    source: "planned",
    isFsrsReview: false
  };
  return action;
}

export function buildDailyNewPlan({
  goals,
  evidencedItemIds,
  dailyCap,
  localPlanDate = "",
  timezone = "UTC",
  dailyPlanVersion = 0,
  itemsBySkill
}: Input): DailyNewPlan {
  const byItem = new Map<string, DailyNewAction>();
  let unavailableTargetCount = 0;
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
      const prerequisite = prerequisites.find((edge) =>
        acquisitionState(edge.prerequisite_skill_id, evidencedItemIds, itemsBySkill).nextItem
      );
      const ownState = acquisitionState(target.skillId, evidencedItemIds, itemsBySkill);
      if (ownState.state === "unavailable") unavailableTargetCount += 1;
      const directActionKind = ownState.state === "not_started" ? "start_new_skill" : "continue_acquisition";
      const directReasonCode = ownState.state === "not_started" ? "START_NEW_GOAL_SKILL" : "CONTINUE_UNFINISHED_SKILL";
      const action = prerequisite
        ? makeAction(
            goal,
            target,
            prerequisite.prerequisite_skill_id,
            `${prerequisite.relationship_type === "required" ? "Build the required" : "Strengthen the recommended"} prerequisite for ${target.title}.`,
            ["UNFINISHED_PREREQUISITE"],
            "prerequisite_acquisition",
            evidencedItemIds,
            localPlanDate,
            timezone,
            dailyPlanVersion,
            itemsBySkill
          )
        : makeAction(
            goal,
            target,
            target.skillId,
            `Continue the unfinished acquisition path for ${target.title}.`,
            [directReasonCode],
            directActionKind,
            evidencedItemIds,
            localPlanDate,
            timezone,
            dailyPlanVersion,
            itemsBySkill
          );
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

  const cap = Math.max(0, Math.min(4, Math.floor(dailyCap)));
  const queues = new Map(
    orderedGoals.map((goal) => [
      goal.id,
      [...byItem.values()]
        .filter((action) => action.primaryGoalId === goal.id)
        .sort((a, b) => a.primaryTargetId.localeCompare(b.primaryTargetId) || a.id.localeCompare(b.id))
    ])
  );
  const eligibleActions: DailyNewAction[] = [];
  for (let index = 0; ; index += 1) {
    let added = false;
    for (const goal of orderedGoals) {
      const action = queues.get(goal.id)?.[index];
      if (action) {
        eligibleActions.push(action);
        added = true;
      }
    }
    if (!added) break;
  }
  const nextExtra = eligibleActions[cap];
  const noMoreReason = nextExtra
    ? null
    : eligibleActions.length > 0
      ? "daily_scope_exhausted" as const
      : unavailableTargetCount > 0
        ? "content_unavailable" as const
        : "all_goal_work_complete" as const;
  return {
    state: "ready",
    authenticated: true,
    activeGoalCount: goals.length,
    dailyCap: cap,
    localPlanDate,
    timezone,
    dailyPlanVersion,
    actions: eligibleActions.slice(0, cap),
    allocatedExtraActions: [],
    eligibleActions,
    extraAction: nextExtra ? {
      ...nextExtra,
      source: "learn_extra",
      reasonCodes: [...nextExtra.reasonCodes, "LEARN_EXTRA_REQUESTED"]
    } : null,
    noMoreReason
  };
}
