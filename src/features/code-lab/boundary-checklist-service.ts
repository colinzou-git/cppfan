import type { CodeErrorTag } from "./code-error-tags";
import type { LearningItemCodeLab } from "./code-lab-types";
import { BOUNDARY_CHECKLISTS } from "./boundary-checklist-data";
import type { BoundaryChecklist, BoundaryChecklistItem } from "./boundary-checklist-types";

/**
 * Resolution helpers for boundary-case checklists (#411). Pure data lookups,
 * safe to import from client and server code.
 */

const BY_ID = new Map(BOUNDARY_CHECKLISTS.map((checklist) => [checklist.id, checklist]));

export function getBoundaryChecklistById(id: string): BoundaryChecklist | null {
  return BY_ID.get(id) ?? null;
}

export function getBoundaryChecklistsForSkills(skillIds: string[]): BoundaryChecklist[] {
  if (skillIds.length === 0) return [];
  const wanted = new Set(skillIds);
  return BOUNDARY_CHECKLISTS.filter((checklist) =>
    checklist.skillIds.some((skillId) => wanted.has(skillId))
  );
}

/**
 * Checklists for a Code Lab item: those matching its skill tags, plus any
 * explicit `boundaryChecklistIds` (supplement, de-duplicated, order-stable).
 * Returns [] when checklists are disabled for the item.
 */
export function getBoundaryChecklistsForCodeLab(config: LearningItemCodeLab): BoundaryChecklist[] {
  if (config.boundaryChecklistsEnabled === false) return [];

  const resolved: BoundaryChecklist[] = [];
  const seen = new Set<string>();
  const add = (checklist: BoundaryChecklist | null) => {
    if (checklist && !seen.has(checklist.id)) {
      seen.add(checklist.id);
      resolved.push(checklist);
    }
  };

  for (const id of config.boundaryChecklistIds ?? []) {
    add(getBoundaryChecklistById(id));
  }
  for (const checklist of getBoundaryChecklistsForSkills(config.skillTags ?? [])) {
    add(checklist);
  }
  return resolved;
}

/**
 * The most relevant checklist for a set of AI error tags (#410), or null. Used
 * to auto-expand a checklist when structured feedback suggests one.
 */
export function getSuggestedBoundaryChecklistForTags(tags: CodeErrorTag[]): BoundaryChecklist | null {
  if (tags.length === 0) return null;
  const wanted = new Set(tags);
  for (const checklist of BOUNDARY_CHECKLISTS) {
    const matches = checklist.items.some((item) =>
      (item.relatedErrorTags ?? []).some((tag) => wanted.has(tag))
    );
    if (matches) return checklist;
  }
  return null;
}

export function findBoundaryChecklistItem(
  checklistId: string,
  itemId: string
): BoundaryChecklistItem | null {
  return getBoundaryChecklistById(checklistId)?.items.find((item) => item.id === itemId) ?? null;
}
