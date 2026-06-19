import type { GoalEvaluationDiagnosticItem } from "./evaluation-catalog";
import { GOAL_EVALUATION_QUESTION_COUNT } from "./evaluation-catalog";

export type GoalEvaluationResponse = {
  itemId: string;
  moduleId: string;
  primarySkillId: string;
  difficultyBand: number;
  diagnosticWeight: number;
  itemType: string;
  isCorrect: boolean;
};

export type GoalEvaluationFinding = {
  moduleId: string;
  status: "ready_to_advance" | "developing" | "needs_prerequisite_support" | "evidence_uncertain" | "probably_familiar";
  estimateBand: 1 | 2 | 3 | 4 | 5;
  confidence: "low" | "medium" | "high";
  evidenceCount: number;
  itemTypeCount: number;
  reasonCodes: string[];
};

export type GoalEvaluationSelectionInput = {
  catalog: GoalEvaluationDiagnosticItem[];
  responses: GoalEvaluationResponse[];
  relevantSkillIds?: ReadonlySet<string>;
};

type Estimate = { correctWeight: number; incorrectWeight: number; count: number; itemTypes: Set<string> };

function estimates(responses: GoalEvaluationResponse[]) {
  const result = new Map<string, Estimate>();
  for (const response of responses) {
    const current = result.get(response.moduleId) ?? {
      correctWeight: 2,
      incorrectWeight: 2,
      count: 0,
      itemTypes: new Set<string>()
    };
    if (response.isCorrect) current.correctWeight += response.diagnosticWeight;
    else current.incorrectWeight += response.diagnosticWeight;
    current.count += 1;
    current.itemTypes.add(response.itemType);
    result.set(response.moduleId, current);
  }
  return result;
}

function estimatedBand(estimate: Estimate | undefined) {
  if (!estimate) return 3;
  return 1 + 4 * (estimate.correctWeight / (estimate.correctWeight + estimate.incorrectWeight));
}

function scoreCandidate(
  item: GoalEvaluationDiagnosticItem,
  responses: GoalEvaluationResponse[],
  moduleEstimate: Estimate | undefined,
  relevantSkillIds: ReadonlySet<string>
) {
  const answered = responses.length;
  const moduleCount = moduleEstimate?.count ?? 0;
  const targetBand = estimatedBand(moduleEstimate);
  const last = responses.at(-1);
  const lastTwo = responses.slice(-2);
  if (lastTwo.length === 2 && lastTwo.every((response) => response.primarySkillId === item.primarySkillId)) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = 0;
  score += 24 / (moduleCount + 1);
  score += Math.max(0, 20 - Math.abs(item.difficultyBand - targetBand) * 6);
  score += item.diagnosticWeight * 4;
  score += Math.max(0, 12 - moduleCount * 3);
  score += relevantSkillIds.has(item.primarySkillId) ? 10 : 0;
  score += last && last.itemType !== item.itemType ? 5 : 0;
  score -= last && last.moduleId === item.moduleId ? 7 : 0;

  if (last?.isCorrect && item.moduleId === last.moduleId && item.difficultyBand > last.difficultyBand) score += 7;
  if (last && !last.isCorrect && item.moduleId === last.moduleId && item.difficultyBand < last.difficultyBand) score += 7;

  const moduleTarget = Math.floor(answered / 7);
  if (moduleCount < moduleTarget) score += 14;
  return score;
}

/**
 * Interpretable adaptive selector. The first seven questions are broad moderate
 * anchors; later choices maximize uncertainty, difficulty fit, diversity, and
 * goal relevance with stable tie-breaking.
 */
export function selectNextGoalEvaluationItem(input: GoalEvaluationSelectionInput) {
  if (input.responses.length >= GOAL_EVALUATION_QUESTION_COUNT) return null;
  const used = new Set(input.responses.map((response) => response.itemId));
  const eligible = input.catalog.filter((item) => !item.retired && !used.has(item.itemId));
  if (eligible.length === 0) return null;

  const moduleEstimates = estimates(input.responses);
  const relevant = input.relevantSkillIds ?? new Set<string>();
  const coveredModules = new Set(input.responses.map((response) => response.moduleId));

  if (input.responses.length < 7) {
    const uncovered = eligible.filter((item) => !coveredModules.has(item.moduleId));
    const anchors = uncovered.length > 0 ? uncovered : eligible;
    return anchors.slice().sort((a, b) =>
      Math.abs(a.difficultyBand - 3) - Math.abs(b.difficultyBand - 3) ||
      a.moduleOrder - b.moduleOrder ||
      a.itemId.localeCompare(b.itemId)
    )[0];
  }

  return eligible.slice().sort((a, b) => {
    const scoreA = scoreCandidate(a, input.responses, moduleEstimates.get(a.moduleId), relevant);
    const scoreB = scoreCandidate(b, input.responses, moduleEstimates.get(b.moduleId), relevant);
    return scoreB - scoreA || a.moduleOrder - b.moduleOrder || a.itemId.localeCompare(b.itemId);
  })[0];
}

export function buildGoalEvaluationFindings(
  catalog: GoalEvaluationDiagnosticItem[],
  responses: GoalEvaluationResponse[]
): GoalEvaluationFinding[] {
  const moduleEstimates = estimates(responses);
  const modules = [...new Map(catalog.map((item) => [item.moduleId, item])).values()]
    .sort((a, b) => a.moduleOrder - b.moduleOrder);

  return modules.map((module) => {
    const estimate = moduleEstimates.get(module.moduleId);
    const evidenceCount = estimate?.count ?? 0;
    const band = Math.max(1, Math.min(5, Math.round(estimatedBand(estimate)))) as 1 | 2 | 3 | 4 | 5;
    const confidence = evidenceCount >= 5 ? "high" : evidenceCount >= 3 ? "medium" : "low";
    const accuracy = estimate
      ? (estimate.correctWeight - 2) / Math.max(1, estimate.correctWeight + estimate.incorrectWeight - 4)
      : 0.5;

    let status: GoalEvaluationFinding["status"] = "evidence_uncertain";
    if (evidenceCount >= 2 && accuracy >= 0.8) status = band >= 4 ? "ready_to_advance" : "probably_familiar";
    else if (evidenceCount >= 2 && accuracy >= 0.45) status = "developing";
    else if (evidenceCount >= 2) status = "needs_prerequisite_support";

    return {
      moduleId: module.moduleId,
      status,
      estimateBand: band,
      confidence,
      evidenceCount,
      itemTypeCount: estimate?.itemTypes.size ?? 0,
      reasonCodes: [
        evidenceCount < 3 ? "LIMITED_EVIDENCE" : "MULTIPLE_OBSERVATIONS",
        accuracy >= 0.8 ? "CONSISTENT_SUCCESS" : accuracy < 0.45 ? "PREREQUISITE_GAPS" : "MIXED_EVIDENCE"
      ]
    };
  });
}
