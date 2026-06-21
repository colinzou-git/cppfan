import type { CodeErrorTag, CodeTagClassification } from "./code-error-tags";
import type { BoundaryChecklist } from "./boundary-checklist-types";
import { getSuggestedBoundaryChecklistForTags } from "./boundary-checklist-service";
import { getRemediationRuleForTag } from "./error-remediation-rules";
import type {
  CodeRemediationPriority,
  CodeRemediationRecommendation,
  LearningItemSummary
} from "./error-remediation-types";

/**
 * Builds one explainable, dismissible remediation recommendation (#414) from
 * deterministic Code Lab error tags. Transparent rules only; no hard locks. AI
 * tags yield only a low-priority suggestion.
 */

const CONFIDENCE_RANK = { high: 3, medium: 2, low: 1 } as const;

function isDeterministic(c: CodeTagClassification): boolean {
  return c.source !== "ai";
}

function isStrongDeterministic(c: CodeTagClassification): boolean {
  return isDeterministic(c) && (c.confidence === "medium" || c.confidence === "high");
}

/** A deterministic medium/high tag seen >=2 times in the recent window, or null. */
export function getRepeatedErrorPattern(input: {
  recentClassifications: CodeTagClassification[];
  windowSize: number;
}): CodeErrorTag | null {
  const window = input.recentClassifications.slice(-Math.max(1, input.windowSize));
  const counts = new Map<CodeErrorTag, number>();
  for (const c of window) {
    if (isStrongDeterministic(c)) {
      counts.set(c.tag, (counts.get(c.tag) ?? 0) + 1);
    }
  }
  for (const [tag, count] of counts) {
    if (count >= 2) return tag;
  }
  return null;
}

export function pickRemediationTargetItem(input: {
  tag: CodeErrorTag;
  skillIds: string[];
  availableItems: LearningItemSummary[];
  wantedTypes: string[];
}): LearningItemSummary | null {
  const wantedSkills = new Set(input.skillIds);
  return (
    input.availableItems.find(
      (item) =>
        input.wantedTypes.includes(item.type) &&
        item.skillIds.some((skillId) => wantedSkills.has(skillId))
    ) ?? null
  );
}

export function buildCodeRemediationRecommendation(input: {
  itemId: string;
  skillIds: string[];
  classifications: CodeTagClassification[];
  recentClassifications?: CodeTagClassification[];
  availableItems?: LearningItemSummary[];
  boundaryChecklists?: BoundaryChecklist[];
}): CodeRemediationRecommendation | null {
  const recent = input.recentClassifications ?? input.classifications;

  let primaryTag: CodeErrorTag | null = null;
  let priority: CodeRemediationPriority = "low";

  const repeated = getRepeatedErrorPattern({ recentClassifications: recent, windowSize: 4 });
  if (repeated) {
    primaryTag = repeated;
    priority = "high";
  } else {
    const deterministic = input.classifications
      .filter(isDeterministic)
      .sort((a, b) => CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence]);
    if (deterministic.length > 0) {
      primaryTag = deterministic[0].tag;
      priority = "medium";
    } else {
      const ai = input.classifications.find((c) => c.source === "ai");
      if (ai) {
        primaryTag = ai.tag;
        priority = "low";
      }
    }
  }

  if (!primaryTag) return null;
  const rule = getRemediationRuleForTag(primaryTag);
  if (!rule) return null; // Unknown/noisy tag: no recommendation.

  const recommendation: CodeRemediationRecommendation = {
    id: `${input.itemId}:${primaryTag}`,
    itemId: input.itemId,
    primaryTag,
    relatedSkillIds: input.skillIds,
    action: rule.action,
    title: rule.title,
    reason: rule.reason,
    priority
  };

  if (rule.action === "use_boundary_checklist") {
    const checklist =
      getSuggestedBoundaryChecklistForTags([primaryTag]) ?? input.boundaryChecklists?.[0] ?? null;
    if (checklist) recommendation.checklistId = checklist.id;
  } else if (rule.action === "try_completion_item" || rule.action === "try_parsons_item") {
    const target = pickRemediationTargetItem({
      tag: primaryTag,
      skillIds: input.skillIds,
      availableItems: input.availableItems ?? [],
      wantedTypes: rule.action === "try_completion_item" ? ["completion"] : ["parsons"]
    });
    if (target) recommendation.targetItemId = target.id;
  }

  return recommendation;
}
