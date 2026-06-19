import { describe, expect, it } from "vitest";
import { buildDailyNewPlan } from "@/features/goals/daily-new-builder";
import { buildDailyReviewItems } from "@/features/review/daily-review-builder";
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
    const plan = buildDailyNewPlan({
      goals: [goal("one")],
      evidencedItemIds: new Set(),
      dailyCap: 1,
      localPlanDate: "2026-06-19",
      timezone: "America/Los_Angeles",
      dailyPlanVersion: 3
    });
    expect(plan.actions).toHaveLength(1);
    expect(plan.actions[0].href).toMatch(/^\/learn\//);
    expect(plan.actions[0].source).toBe("planned");
    expect(plan.actions[0].isFsrsReview).toBe(false);
    expect(plan.actions[0]).toMatchObject({
      algorithmVersion: "daily-new-v1",
      localPlanDate: "2026-06-19",
      timezone: "America/Los_Angeles",
      dailyPlanVersion: 3,
      actionKind: "start_new_skill",
      destinationKind: "learning_item",
      destinationId: plan.actions[0].itemId,
      acquisitionStepId: plan.actions[0].itemId,
      acquisitionState: "not_started",
      acquisitionContractId: "skill-initial-learning",
      acquisitionContractVersion: 1,
      reasonCodes: ["START_NEW_GOAL_SKILL"]
    });
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

  it("continues an in-progress acquisition sequence with the next unfinished item", () => {
    const firstItem = getLearningItemsForSkill("cpp.program_basics.structure")[0];
    const plan = buildDailyNewPlan({
      goals: [goal("one")],
      evidencedItemIds: new Set([firstItem.id]),
      dailyCap: 1
    });

    expect(plan.actions).toHaveLength(1);
    expect(plan.actions[0].itemId).not.toBe(firstItem.id);
    expect(plan.actions[0]).toMatchObject({
      actionKind: "continue_acquisition",
      acquisitionState: "in_progress",
      reasonCodes: ["CONTINUE_UNFINISHED_SKILL"]
    });
  });

  it("keeps a due review separate while allowing a different acquisition action for the same skill", () => {
    const [reviewedItem] = getLearningItemsForSkill("cpp.program_basics.structure");
    const now = new Date("2026-06-19T12:00:00.000Z");
    const reviews = buildDailyReviewItems(
      [{
        id: "card-1",
        learning_item_id: reviewedItem.id,
        skill_id: "cpp.program_basics.structure",
        due_at: "2026-06-19T11:00:00.000Z"
      }],
      "UTC",
      now
    );
    const plan = buildDailyNewPlan({
      goals: [goal("one")],
      evidencedItemIds: new Set([reviewedItem.id]),
      dailyCap: 1,
      localPlanDate: "2026-06-19",
      timezone: "UTC"
    });

    expect(reviews).toHaveLength(1);
    expect(plan.actions).toHaveLength(1);
    expect(plan.actions[0].skillId).toBe(reviews[0].skillId);
    expect(plan.actions[0].itemId).not.toBe(reviews[0].itemId);
    expect(plan.actions[0].id).not.toBe(reviews[0].cardId);
    expect(plan.actions[0].isFsrsReview).toBe(false);
  });

  it("excludes a target whose initial learning contract is already complete", () => {
    const completed = new Set(getLearningItemsForSkill("cpp.program_basics.structure").map((item) => item.id));
    const plan = buildDailyNewPlan({ goals: [goal("one")], evidencedItemIds: completed, dailyCap: 1 });

    expect(plan.actions).toEqual([]);
    expect(plan.eligibleActions).toEqual([]);
    expect(plan.extraAction).toBeNull();
  });

  it("excludes a target whose acquisition content is unavailable", () => {
    const unavailable = goal("one");
    unavailable.targets[0] = {
      ...unavailable.targets[0],
      referenceId: "missing.skill",
      skillId: "missing.skill",
      title: "Missing skill"
    };

    const plan = buildDailyNewPlan({ goals: [unavailable], evidencedItemIds: new Set(), dailyCap: 1 });

    expect(plan.actions).toEqual([]);
    expect(plan.eligibleActions).toEqual([]);
    expect(plan.extraAction).toBeNull();
  });
});
