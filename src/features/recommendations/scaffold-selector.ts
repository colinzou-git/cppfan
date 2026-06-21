import type { CodeErrorTag } from "@/features/code-lab/code-error-tags";
import {
  findBestItemForScaffoldLevel,
  getAvailableScaffoldLevels,
  resolveAvailableLevel
} from "./scaffold-availability";
import type {
  ScaffoldLevel,
  ScaffoldRecommendation,
  ScaffoldSelectionInput
} from "./scaffold-selector-types";

/**
 * Deterministic scaffold-level selection (#415). Chooses the next practice
 * format from mastery status, recent errors, and item availability. Due reviews
 * still win globally (handled by the daily plan); this only ranks non-review next
 * practice. Never hard-locks.
 */

const LOW_STATUSES = new Set(["new", "weak", "regressed"]);
const HIGH_STATUSES = new Set(["strong", "mastered"]);

const SYNTAX_ORDERING_TAGS = new Set<CodeErrorTag>([
  "cpp.compile.syntax",
  "cpp.compile.name_not_declared",
  "cpp.compile.missing_include",
  "cpp.compile.type_mismatch",
  "cpp.raii.manual_resource_management"
]);

const BOUNDARY_TAGS = new Set<CodeErrorTag>([
  "cpp.loop.off_by_one",
  "cpp.vector.out_of_bounds",
  "dsa.binary_search.boundary_update"
]);

type Decision = {
  preferred: ScaffoldLevel;
  priority: ScaffoldRecommendation["priority"];
  reason: string;
};

function decide(input: ScaffoldSelectionInput): Decision {
  const tags = input.recentCodeErrorTags ?? [];
  const correctness = input.recentCorrectness;

  if (tags.some((tag) => SYNTAX_ORDERING_TAGS.has(tag))) {
    return {
      preferred: "completion",
      priority: "medium",
      reason: "Recommended because recent syntax/ordering errors suggest a guided completion or Parsons step."
    };
  }
  if (tags.some((tag) => BOUNDARY_TAGS.has(tag))) {
    return {
      preferred: "code_lab",
      priority: "medium",
      reason: "Recommended because you missed boundary cases — retry in the Code Lab after the boundary checklist."
    };
  }
  if (LOW_STATUSES.has(input.masteryStatus) && (correctness === undefined || correctness < 0.5)) {
    return {
      preferred: "worked_example",
      priority: "high",
      reason: "Recommended because this is a new or weak skill and a worked example reduces overload."
    };
  }
  if (HIGH_STATUSES.has(input.masteryStatus) && correctness !== undefined && correctness >= 1 && (input.recentHintCount ?? 0) === 0) {
    return {
      preferred: "review",
      priority: "low",
      reason: "Recommended because you passed without hints — a spaced review will lock it in."
    };
  }
  if (correctness !== undefined && correctness >= 0.8) {
    return {
      preferred: "code_lab",
      priority: "medium",
      reason: "Recommended because you completed the scaffold and are ready to write code."
    };
  }
  return {
    preferred: "completion",
    priority: "medium",
    reason: "Recommended because a completion scaffold builds confidence before full coding."
  };
}

export function selectScaffoldLevel(input: ScaffoldSelectionInput): ScaffoldRecommendation | null {
  const available = getAvailableScaffoldLevels(input.availableItems);
  if (available.length === 0) return null;

  const decision = decide(input);
  const level = resolveAvailableLevel(decision.preferred, available);
  if (!level) return null;

  const item = findBestItemForScaffoldLevel({
    level,
    skillId: input.skillId,
    items: input.availableItems
  });

  return {
    skillId: input.skillId,
    level,
    itemId: item?.id,
    reason: decision.reason,
    priority: decision.priority
  };
}

const PRIORITY_RANK = { high: 3, medium: 2, low: 1 } as const;

export function rankScaffoldRecommendations(
  items: ScaffoldRecommendation[]
): ScaffoldRecommendation[] {
  return [...items].sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);
}
