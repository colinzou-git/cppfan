import { describe, expect, it } from "vitest";
import {
  GOAL_EVALUATION_QUESTION_COUNT,
  validateGoalEvaluationCatalog
} from "@/features/goals/evaluation-catalog";
import {
  buildGoalEvaluationFindings,
  selectNextGoalEvaluationItem,
  type GoalEvaluationResponse
} from "@/features/goals/evaluation-engine";

describe("goal Evaluation catalog", () => {
  it("contains a valid unique pool large enough for an exact 30-question run", () => {
    const result = validateGoalEvaluationCatalog();
    expect(result.errors).toEqual([]);
    expect(result.catalog.length).toBeGreaterThanOrEqual(GOAL_EVALUATION_QUESTION_COUNT);
    expect(new Set(result.catalog.map((item) => item.itemId)).size).toBe(result.catalog.length);
  });
});

describe("adaptive goal Evaluation selection", () => {
  it("selects 30 unique deterministic questions with broad anchors", () => {
    const { catalog } = validateGoalEvaluationCatalog();
    const responses: GoalEvaluationResponse[] = [];
    const selected: string[] = [];

    while (responses.length < GOAL_EVALUATION_QUESTION_COUNT) {
      const item = selectNextGoalEvaluationItem({ catalog, responses });
      expect(item).not.toBeNull();
      selected.push(item!.itemId);
      responses.push({
        itemId: item!.itemId,
        moduleId: item!.moduleId,
        primarySkillId: item!.primarySkillId,
        difficultyBand: item!.difficultyBand,
        diagnosticWeight: item!.diagnosticWeight,
        itemType: item!.itemType,
        isCorrect: responses.length % 3 !== 1
      });
    }

    expect(selected).toHaveLength(30);
    expect(new Set(selected).size).toBe(30);
    expect(new Set(responses.slice(0, 7).map((response) => response.moduleId)).size).toBe(7);
    for (let index = 2; index < responses.length; index += 1) {
      expect([
        responses[index - 2].primarySkillId,
        responses[index - 1].primarySkillId,
        responses[index].primarySkillId
      ]).not.toEqual([
        responses[index].primarySkillId,
        responses[index].primarySkillId,
        responses[index].primarySkillId
      ]);
    }
    expect(selectNextGoalEvaluationItem({ catalog, responses })).toBeNull();
  });

  it("returns the same next item for the same evidence", () => {
    const { catalog } = validateGoalEvaluationCatalog();
    const first = selectNextGoalEvaluationItem({ catalog, responses: [] });
    const second = selectNextGoalEvaluationItem({ catalog, responses: [] });
    expect(first?.itemId).toBe(second?.itemId);
  });

  it("keeps sparse findings explicitly uncertain", () => {
    const { catalog } = validateGoalEvaluationCatalog();
    const first = catalog[0];
    const findings = buildGoalEvaluationFindings(catalog, [{
      itemId: first.itemId,
      moduleId: first.moduleId,
      primarySkillId: first.primarySkillId,
      difficultyBand: first.difficultyBand,
      diagnosticWeight: first.diagnosticWeight,
      itemType: first.itemType,
      isCorrect: true
    }]);
    expect(findings.find((finding) => finding.moduleId === first.moduleId)?.status).toBe("evidence_uncertain");
    expect(findings.find((finding) => finding.moduleId === first.moduleId)?.confidence).toBe("low");
  });
});
