import { getLearningItemsForSkill } from "@/features/learning-items/learning-item-seed";
import type { AcquisitionState } from "./goal-contract";

type LearningItem = ReturnType<typeof getLearningItemsForSkill>[number];
export type AcquisitionItem = Pick<LearningItem, "id" | "title" | "estimated_minutes">;

export const SKILL_INITIAL_LEARNING_CONTRACT = {
  id: "skill-initial-learning",
  version: 1
} as const;

export type AcquisitionEvidence = {
  itemId: string;
  occurredAt?: string | null;
};

export type DerivedAcquisitionState = {
  contractId: typeof SKILL_INITIAL_LEARNING_CONTRACT.id;
  contractVersion: typeof SKILL_INITIAL_LEARNING_CONTRACT.version;
  state: AcquisitionState;
  requiredItemIds: string[];
  completedItemIds: string[];
  nextItem: AcquisitionItem | null;
};

function qualifiesAfterBaseline(evidence: AcquisitionEvidence, baselineEvidenceAt?: string | null) {
  if (!baselineEvidenceAt || !evidence.occurredAt) return true;
  const baseline = Date.parse(baselineEvidenceAt);
  const occurred = Date.parse(evidence.occurredAt);
  return Number.isFinite(baseline) && Number.isFinite(occurred) && occurred > baseline;
}

export function deriveInitialLearningState(
  skillId: string,
  evidence: AcquisitionEvidence[],
  baselineEvidenceAt?: string | null,
  catalogItems?: readonly AcquisitionItem[]
): DerivedAcquisitionState {
  const requiredItems = catalogItems ?? getLearningItemsForSkill(skillId);
  if (requiredItems.length === 0) {
    return {
      contractId: SKILL_INITIAL_LEARNING_CONTRACT.id,
      contractVersion: SKILL_INITIAL_LEARNING_CONTRACT.version,
      state: "unavailable",
      requiredItemIds: [],
      completedItemIds: [],
      nextItem: null
    };
  }

  const completed = new Set(
    evidence
      .filter((entry) => qualifiesAfterBaseline(entry, baselineEvidenceAt))
      .map((entry) => entry.itemId)
  );
  const completedItems = requiredItems.filter((item) => completed.has(item.id));
  const nextItem = requiredItems.find((item) => !completed.has(item.id)) ?? null;
  const state: AcquisitionState =
    completedItems.length === 0
      ? "not_started"
      : completedItems.length === requiredItems.length
        ? "initial_learning_complete"
        : "in_progress";

  return {
    contractId: SKILL_INITIAL_LEARNING_CONTRACT.id,
    contractVersion: SKILL_INITIAL_LEARNING_CONTRACT.version,
    state,
    requiredItemIds: requiredItems.map((item) => item.id),
    completedItemIds: completedItems.map((item) => item.id),
    nextItem
  };
}

export function getNextAcquisitionItemForSkill(
  skillId: string,
  evidencedItemIds: ReadonlySet<string>
) {
  return deriveInitialLearningState(
    skillId,
    [...evidencedItemIds].map((itemId) => ({ itemId }))
  ).nextItem;
}
