import { describe, expect, it } from "vitest";
import {
  GOAL_EVALUATION_QUESTION_COUNT,
  validateGoalEvaluationCatalog
} from "@/features/goals/evaluation-catalog";
import {
  buildGoalEvaluationFindings,
  buildGoalEvaluationRecommendations,
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
  function runHistory(isCorrect: (index: number) => boolean) {
    const { catalog } = validateGoalEvaluationCatalog();
    const responses: GoalEvaluationResponse[] = [];
    while (responses.length < GOAL_EVALUATION_QUESTION_COUNT) {
      const item = selectNextGoalEvaluationItem({ catalog, responses });
      expect(item).not.toBeNull();
      responses.push({
        itemId: item!.itemId,
        moduleId: item!.moduleId,
        primarySkillId: item!.primarySkillId,
        difficultyBand: item!.difficultyBand,
        diagnosticWeight: item!.diagnosticWeight,
        itemType: item!.itemType,
        isCorrect: isCorrect(responses.length)
      });
    }
    return responses;
  }

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

  it("adapts deterministically to all-correct, all-incorrect, and alternating histories", () => {
    const { catalog } = validateGoalEvaluationCatalog();
    const availableItemTypes = new Set(catalog.map((item) => item.itemType)).size;
    const correct = runHistory(() => true);
    const correctReplay = runHistory(() => true);
    const incorrect = runHistory(() => false);
    const alternating = runHistory((index) => index % 2 === 0);

    expect(correct.map((item) => item.itemId)).toEqual(correctReplay.map((item) => item.itemId));
    expect(correct.map((item) => item.itemId)).not.toEqual(incorrect.map((item) => item.itemId));
    expect(alternating.map((item) => item.itemId)).not.toEqual(correct.map((item) => item.itemId));
    for (const history of [correct, incorrect, alternating]) {
      expect(new Set(history.map((item) => item.itemId)).size).toBe(30);
      expect(new Set(history.map((item) => item.moduleId)).size).toBeGreaterThanOrEqual(7);
      if (availableItemTypes > 1) {
        expect(new Set(history.map((item) => item.itemType)).size).toBeGreaterThan(1);
      }
      for (let index = 2; index < history.length; index += 1) {
        expect(new Set(history.slice(index - 2, index + 1).map((item) => item.primarySkillId)).size)
          .toBeGreaterThan(1);
      }
    }
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

  it("turns completed findings into limited transparent goal suggestions", () => {
    const { catalog } = validateGoalEvaluationCatalog();
    const findings = buildGoalEvaluationFindings(catalog, runHistory((index) => index % 3 === 0));
    const recommendations = buildGoalEvaluationRecommendations(catalog, findings, 3);

    expect(recommendations).toHaveLength(3);
    expect(new Set(recommendations.map((item) => item.skillId)).size).toBe(3);
    expect(recommendations.every((item) => item.reason.includes("band"))).toBe(true);
    expect(recommendations.every((item) => item.reasonCodes.length > 0)).toBe(true);
  });
});
