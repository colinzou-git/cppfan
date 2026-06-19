import { getLearningItemById } from "@/features/learning-items/learning-item-seed";
import type { LearningItemType, PublicLearningItemChoice } from "@/features/learning-items/learning-item-types";
import { getPlacementModules } from "@/features/placement/placement-seed";

export const GOAL_EVALUATION_QUESTION_COUNT = 30;
export const GOAL_EVALUATION_ALGORITHM_VERSION = "goal-evaluation-v1";
export const GOAL_EVALUATION_ITEM_POOL_VERSION = 1;

export type GoalEvaluationDiagnosticItem = {
  itemId: string;
  primarySkillId: string;
  supportingSkillIds: string[];
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  difficultyBand: 1 | 2 | 3 | 4 | 5;
  diagnosticWeight: 1 | 2 | 3;
  prerequisiteLevel: number;
  itemType: LearningItemType;
  estimatedMinutes: number;
  prompt: string;
  choices: PublicLearningItemChoice[];
  version: number;
  retired: boolean;
};

const DIFFICULTY_BAND = {
  beginner: 2,
  intermediate: 3,
  advanced: 4
} as const;

export function getGoalEvaluationCatalog(): GoalEvaluationDiagnosticItem[] {
  const catalog: GoalEvaluationDiagnosticItem[] = [];
  for (const module of getPlacementModules()) {
    module.item_ids.forEach((itemId, index) => {
      const details = getLearningItemById(itemId);
      if (!details || !details.item.is_active || details.choices.length < 2) return;
      const primary = details.skills.find((skill) => skill.is_primary) ?? details.skills[0];
      if (!primary) return;
      catalog.push({
        itemId,
        primarySkillId: primary.skill_id,
        supportingSkillIds: details.skills.filter((skill) => !skill.is_primary).map((skill) => skill.skill_id),
        moduleId: module.module_id,
        moduleTitle: module.title,
        moduleOrder: module.order_index,
        difficultyBand: DIFFICULTY_BAND[details.item.difficulty],
        diagnosticWeight: details.item.type === "multiple_choice" ? 2 : 3,
        prerequisiteLevel: Math.min(5, Math.max(1, Math.floor(index / 3) + 1)),
        itemType: details.item.type,
        estimatedMinutes: details.item.estimated_minutes,
        prompt: details.item.prompt,
        choices: details.choices,
        version: GOAL_EVALUATION_ITEM_POOL_VERSION,
        retired: false
      });
    });
  }
  return catalog;
}

export function getGoalEvaluationItem(itemId: string) {
  return getGoalEvaluationCatalog().find((item) => item.itemId === itemId) ?? null;
}

export function validateGoalEvaluationCatalog() {
  const catalog = getGoalEvaluationCatalog();
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const item of catalog) {
    if (ids.has(item.itemId)) errors.push(`duplicate:${item.itemId}`);
    ids.add(item.itemId);
    if (!item.primarySkillId) errors.push(`missing_skill:${item.itemId}`);
    if (item.choices.length < 2) errors.push(`missing_choices:${item.itemId}`);
  }
  if (catalog.length < GOAL_EVALUATION_QUESTION_COUNT) {
    errors.push(`insufficient_pool:${catalog.length}`);
  }
  return { catalog, errors };
}
