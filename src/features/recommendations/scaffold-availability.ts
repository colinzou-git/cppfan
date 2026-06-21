import type { LearningItemSummary, ScaffoldLevel } from "./scaffold-selector-types";

/**
 * Maps available learning items to scaffold levels and finds the best item for a
 * level (#415). Pure. `review` is always available (FSRS is universal);
 * `code_lab` is available when an item carries Code Lab metadata.
 */

// Most support (left) to least support (right).
export const SCAFFOLD_SUPPORT_ORDER: ScaffoldLevel[] = [
  "worked_example",
  "completion",
  "parsons",
  "code_reading",
  "bug_spotting",
  "code_lab",
  "review",
  "project_milestone"
];

const TYPE_TO_LEVEL: Record<string, ScaffoldLevel> = {
  worked_example: "worked_example",
  completion: "completion",
  parsons: "parsons",
  code_reading: "code_reading",
  bug_spotting: "bug_spotting"
};

function levelForItem(item: LearningItemSummary): ScaffoldLevel | null {
  if (item.hasCodeLab) return "code_lab";
  if (item.type === "code_lab") return "code_lab";
  return TYPE_TO_LEVEL[item.type] ?? null;
}

export function getAvailableScaffoldLevels(items: LearningItemSummary[]): ScaffoldLevel[] {
  const available = new Set<ScaffoldLevel>(["review"]);
  for (const item of items) {
    const level = levelForItem(item);
    if (level) available.add(level);
    if (item.type === "project_milestone") available.add("project_milestone");
  }
  return SCAFFOLD_SUPPORT_ORDER.filter((level) => available.has(level));
}

export function findBestItemForScaffoldLevel(input: {
  level: ScaffoldLevel;
  skillId: string;
  items: LearningItemSummary[];
}): LearningItemSummary | null {
  const matches = input.items.filter((item) => levelForItem(item) === input.level);
  return (
    matches.find((item) => item.skillIds.includes(input.skillId)) ?? matches[0] ?? null
  );
}

/** Resolve a preferred level to an available one: nearest by support distance. */
export function resolveAvailableLevel(
  preferred: ScaffoldLevel,
  available: ScaffoldLevel[]
): ScaffoldLevel | null {
  if (available.length === 0) return null;
  if (available.includes(preferred)) return preferred;
  const preferredIndex = SCAFFOLD_SUPPORT_ORDER.indexOf(preferred);
  let best: ScaffoldLevel | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const level of available) {
    const distance = Math.abs(SCAFFOLD_SUPPORT_ORDER.indexOf(level) - preferredIndex);
    // Tie-break toward less support (higher index) so we don't over-scaffold.
    if (
      distance < bestDistance ||
      (distance === bestDistance &&
        best !== null &&
        SCAFFOLD_SUPPORT_ORDER.indexOf(level) > SCAFFOLD_SUPPORT_ORDER.indexOf(best))
    ) {
      best = level;
      bestDistance = distance;
    }
  }
  return best;
}
