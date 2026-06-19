import { describe, expect, it } from "vitest";
import { buildDailyNewPlan } from "@/features/goals/daily-new-builder";
import type { StudyGoalView } from "@/features/goals/goal-view-types";

function goal(id: string): StudyGoalView {
  return {
    id,
    title: `Goal ${id}`,
    status: "active",
    currentRevision: 1,
    revisionId: `revision-${id}`,
    startLocalDate: "2026-06-19",
    endLocalDate: "2026-06-25",
    timezone: "America/Los_Angeles",
    recommendationSource: "manual",
    recommendationReason: null,
    learnerNote: null,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z",
    targets: [{
      id: `target-${id}`,
      goalId: id,
      revisionId: `revision-${id}`,
      targetKind: "acquire_skill",
      referenceId: "cpp.program_basics.structure",
      skillId: "cpp.program_basics.structure",
      title: "A minimal C++ program",
      orderIndex: 0,
      weight: 1,
      acquisitionContractId: "skill-initial-learning",
      acquisitionContractVersion: 1,
      source: "manual",
      baselineAcquisitionState: "not_started"
    }]
  };
}

describe("buildDailyNewPlan", () => {
  it("allocates unfinished initial learning, not review work", () => {
    const plan = buildDailyNewPlan({ goals: [goal("one")], evidencedItemIds: new Set(), dailyCap: 1 });
    expect(plan.actions).toHaveLength(1);
    expect(plan.actions[0].href).toMatch(/^\/learn\//);
    expect(plan.actions[0].source).toBe("planned");
  });

  it("deduplicates a shared action and preserves all contributing goals", () => {
    const plan = buildDailyNewPlan({ goals: [goal("one"), goal("two")], evidencedItemIds: new Set(), dailyCap: 2 });
    expect(plan.actions).toHaveLength(1);
    expect(plan.actions[0].goalIds).toEqual(["one", "two"]);
  });

  it("exposes exactly one additional candidate beyond the daily cap", () => {
    const second = goal("two");
    second.targets[0] = { ...second.targets[0], id: "target-two", referenceId: "cpp.program_basics.io", skillId: "cpp.program_basics.io", title: "Console input and output" };
    const plan = buildDailyNewPlan({ goals: [goal("one"), second], evidencedItemIds: new Set(), dailyCap: 1 });
    expect(plan.actions).toHaveLength(1);
    expect(plan.extraAction?.source).toBe("learn_extra");
  });
});
