import { describe, expect, it } from "vitest";
import { orderPublicChoices } from "@/features/learning-items/choice-ordering";
import { learningItemChoices } from "@/features/learning-items/learning-item-seed";
import type { PublicLearningItemChoice } from "@/features/learning-items/learning-item-types";
import {
  GOAL_EVALUATION_QUESTION_COUNT,
  validateGoalEvaluationCatalog
} from "@/features/goals/evaluation-catalog";
import { selectNextGoalEvaluationItem, type GoalEvaluationResponse } from "@/features/goals/evaluation-engine";

describe("public choice ordering", () => {
  it("keeps ids stable while moving the authoring-first option away from the first display slot", () => {
    const choices: PublicLearningItemChoice[] = [
      { id: "example.a", learning_item_id: "example", content: "A", order_index: 10 },
      { id: "example.b", learning_item_id: "example", content: "B", order_index: 20 },
      { id: "example.c", learning_item_id: "example", content: "C", order_index: 30 },
      { id: "example.d", learning_item_id: "example", content: "D", order_index: 40 }
    ];

    const ordered = orderPublicChoices(choices, "test-seed");
    const replay = orderPublicChoices(choices, "test-seed");

    expect(ordered).toEqual(replay);
    expect(new Set(ordered.map((choice) => choice.id))).toEqual(new Set(choices.map((choice) => choice.id)));
    expect(ordered[0].id).not.toBe(choices[0].id);
    expect(ordered[0].id.endsWith(".a")).toBe(false);
  });

  it("keeps the goal evaluation path from preserving the seed key position", () => {
    const { catalog, errors } = validateGoalEvaluationCatalog();
    expect(errors).toEqual([]);

    const keyedChoiceByItem = new Map(
      learningItemChoices
        .filter((choice) => choice.is_correct)
        .map((choice) => [choice.learning_item_id, choice.id])
    );
    const responses: GoalEvaluationResponse[] = [];

    while (responses.length < GOAL_EVALUATION_QUESTION_COUNT) {
      const item = selectNextGoalEvaluationItem({ catalog, responses });
      expect(item).not.toBeNull();
      const keyedChoiceId = keyedChoiceByItem.get(item!.itemId);
      expect(keyedChoiceId).toBeTruthy();
      expect(item!.choices[0].id).not.toBe(keyedChoiceId);

      responses.push({
        itemId: item!.itemId,
        moduleId: item!.moduleId,
        primarySkillId: item!.primarySkillId,
        difficultyBand: item!.difficultyBand,
        diagnosticWeight: item!.diagnosticWeight,
        itemType: item!.itemType,
        isCorrect: responses.length % 2 === 0
      });
    }
  });
});
