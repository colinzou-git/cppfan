import type { BoundaryChecklist, BoundaryChecklistState } from "./boundary-checklist-types";

/**
 * Pure checked-state helpers for boundary checklists (#411). State is local to a
 * mounted Code Lab (not persisted) and is intentionally immutable so React state
 * updates are predictable and testable.
 */

export function createInitialBoundaryChecklistState(
  checklists: BoundaryChecklist[]
): BoundaryChecklistState {
  const state: BoundaryChecklistState = {};
  for (const checklist of checklists) {
    state[checklist.id] = {};
    for (const item of checklist.items) {
      state[checklist.id][item.id] = false;
    }
  }
  return state;
}

export function toggleBoundaryChecklistItem(
  state: BoundaryChecklistState,
  checklistId: string,
  itemId: string
): BoundaryChecklistState {
  const checklist = state[checklistId];
  if (!checklist || !(itemId in checklist)) return state;
  return {
    ...state,
    [checklistId]: { ...checklist, [itemId]: !checklist[itemId] }
  };
}

export function getBoundaryChecklistProgress(state: BoundaryChecklistState): {
  checked: number;
  total: number;
} {
  let checked = 0;
  let total = 0;
  for (const checklist of Object.values(state)) {
    for (const isChecked of Object.values(checklist)) {
      total += 1;
      if (isChecked) checked += 1;
    }
  }
  return { checked, total };
}
