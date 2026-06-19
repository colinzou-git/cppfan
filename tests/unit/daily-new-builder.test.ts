import { describe, expect, it } from "vitest";
import { buildDailyNewPlan } from "@/features/goals/daily-new-builder";
import { getLearningItemsForSkill } from "@/features/learning-items/learning-item-seed";
import { skillPrerequisitesSeed, skillSeed } from "@/features/skills/skill-seed";
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

function anotherRootSkill() {
  return skillSeed.find((skill) =>
    skill.id !== "cpp.program_basics.structure" &&
    getLearningItemsForSkill(skill.id).length > 0 &&
    !skillPrerequisitesSeed.some((edge) => edge.skill_id === skill.id)
  );
}

describe("buildDailyNewPlan", () => {
  it("allocates unfinished initial learning, not review work", () => {
    const plan = buildDailyNewPlan({ goals: [goal("one")], evidencedItemIds: new Set(), dailyCap: 1 });
    expect(plan.actions).toHaveLength(1);
    expect(plan.actions[0].href).toMatch(/^\/learn\//);
    expect(plan.actions[0].source).toBe("planned");
    expect(plan.actions[0].isFsrsReview).toBe(false);
  });

  it("deduplicates a shared action and preserves all contributing goals", () => {
    const plan = buildDailyNewPlan({ goals: [goal("one"), goal("two")], evidencedItemIds: new Set(), dailyCap: 2 });
    expect(plan.actions).toHaveLength(1);
    expect(plan.actions[0].goalIds).toEqual(["one", "two"]);
  });

  it("exposes exactly one additional candidate beyond the daily cap", () => {
    const root = anotherRootSkill();
    expect(root).toBeDefined();
    const second = goal("two");
    second.targets[0] = { ...second.targets[0], id: "target-two", referenceId: root!.id, skillId: root!.id, title: root!.title };
    const plan = buildDailyNewPlan({ goals: [goal("one"), second], evidencedItemIds: new Set(), dailyCap: 1 });
    expect(plan.actions).toHaveLength(1);
    expect(plan.extraAction?.source).toBe("learn_extra");
  });
});
