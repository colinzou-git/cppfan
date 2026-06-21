import { describe, expect, it } from "vitest";
import {
  createInitialBoundaryChecklistState,
  getBoundaryChecklistProgress,
  toggleBoundaryChecklistItem
} from "@/features/code-lab/boundary-checklist-state";
import type { BoundaryChecklist } from "@/features/code-lab/boundary-checklist-types";

const checklists: BoundaryChecklist[] = [
  {
    id: "demo",
    title: "Demo",
    skillIds: [],
    items: [
      { id: "a", label: "a" },
      { id: "b", label: "b" }
    ]
  }
];

describe("boundary checklist state", () => {
  it("starts with every item unchecked", () => {
    const state = createInitialBoundaryChecklistState(checklists);
    expect(getBoundaryChecklistProgress(state)).toEqual({ checked: 0, total: 2 });
  });

  it("toggles an item immutably and stably", () => {
    const state = createInitialBoundaryChecklistState(checklists);
    const next = toggleBoundaryChecklistItem(state, "demo", "a");
    expect(next).not.toBe(state);
    expect(state.demo.a).toBe(false); // original untouched
    expect(next.demo.a).toBe(true);
    expect(getBoundaryChecklistProgress(next)).toEqual({ checked: 1, total: 2 });
    // Toggling back returns to unchecked.
    expect(toggleBoundaryChecklistItem(next, "demo", "a").demo.a).toBe(false);
  });

  it("ignores unknown checklist/item ids", () => {
    const state = createInitialBoundaryChecklistState(checklists);
    expect(toggleBoundaryChecklistItem(state, "nope", "a")).toBe(state);
    expect(toggleBoundaryChecklistItem(state, "demo", "nope")).toBe(state);
  });
});
