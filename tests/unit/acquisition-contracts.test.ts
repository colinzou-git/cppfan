import { describe, expect, it } from "vitest";
import {
  deriveInitialLearningState,
  getNextAcquisitionItemForSkill,
  SKILL_INITIAL_LEARNING_CONTRACT
} from "@/features/goals/acquisition-contracts";
import { getLearningItemsForSkill } from "@/features/learning-items/learning-item-seed";

const SKILL_ID = "cpp.program_basics.structure";

function itemIds() {
  const ids = getLearningItemsForSkill(SKILL_ID).map((item) => item.id);
  expect(ids.length).toBeGreaterThan(1);
  return ids;
}

describe("initial learning acquisition contract", () => {
  it("derives not-started, in-progress, and complete states from required item evidence", () => {
    const ids = itemIds();

    const empty = deriveInitialLearningState(SKILL_ID, []);
    expect(empty.contractId).toBe(SKILL_INITIAL_LEARNING_CONTRACT.id);
    expect(empty.contractVersion).toBe(SKILL_INITIAL_LEARNING_CONTRACT.version);
    expect(empty.state).toBe("not_started");
    expect(empty.nextItem?.id).toBe(ids[0]);

    const partial = deriveInitialLearningState(SKILL_ID, [{ itemId: ids[0] }]);
    expect(partial.state).toBe("in_progress");
    expect(partial.completedItemIds).toEqual([ids[0]]);
    expect(partial.nextItem?.id).toBe(ids[1]);

    const complete = deriveInitialLearningState(
      SKILL_ID,
      ids.map((itemId) => ({ itemId }))
    );
    expect(complete.state).toBe("initial_learning_complete");
    expect(complete.completedItemIds).toEqual(ids);
    expect(complete.nextItem).toBeNull();
  });

  it("ignores evidence at or before the revision baseline", () => {
    const ids = itemIds();
    const state = deriveInitialLearningState(
      SKILL_ID,
      [
        { itemId: ids[0], occurredAt: "2026-06-18T23:59:59.000Z" },
        { itemId: ids[1], occurredAt: "2026-06-19T00:00:01.000Z" }
      ],
      "2026-06-19T00:00:00.000Z"
    );

    expect(state.state).toBe("in_progress");
    expect(state.completedItemIds).toEqual([ids[1]]);
    expect(state.nextItem?.id).toBe(ids[0]);
  });

  it("marks unknown or retired skills unavailable", () => {
    const state = deriveInitialLearningState("missing.skill", []);

    expect(state.state).toBe("unavailable");
    expect(state.requiredItemIds).toEqual([]);
    expect(state.nextItem).toBeNull();
  });

  it("exposes the next acquisition item for Daily New allocation", () => {
    const ids = itemIds();

    expect(getNextAcquisitionItemForSkill(SKILL_ID, new Set([ids[0]]))?.id).toBe(ids[1]);
  });
});
