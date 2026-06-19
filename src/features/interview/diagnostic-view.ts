// Pure view model for the diagnostic overview UI (#175/#174): the assembled
// baseline diagnostic sections with readable dimension labels and resolved source
// titles, plus deterministic result-plan views from saved section scores.
import {
  buildHeatMap,
  diagnosticMinutes,
  diagnosticSections,
  generatePlan,
  type DiagnosticDimension,
  type DiagnosticNextStep,
  type DiagnosticSource,
  type HeatMapEntry
} from "./diagnostic";
import { getInterviewProblem } from "./problem-catalog";
import { getLearningItemById } from "@/features/learning-items/learning-item-seed";

const DIMENSION_LABEL: Record<DiagnosticDimension, string> = {
  pattern_recognition: "Pattern recognition",
  algorithm_selection: "Algorithm selection",
  implementation_correctness: "Implementation correctness",
  cpp_fluency: "C++ fluency",
  edge_case_testing: "Edge-case testing",
  complexity_analysis: "Complexity analysis",
  communication: "Communication",
  time_management: "Time management",
  hint_dependence: "Hint independence"
};

export type DiagnosticSectionView = {
  id: string;
  title: string;
  sourceTitle: string;
  estimatedMinutes: number;
  dimensionLabels: string[];
};

export type DiagnosticView = {
  totalMinutes: number;
  sections: DiagnosticSectionView[];
};

export type DiagnosticPlanWeekView = {
  week: number;
  sectionId: string;
  level: HeatMapEntry["level"];
  reason: string;
  problemTitles: string[];
  nextStep: DiagnosticNextStep;
};

export type DiagnosticResultView = {
  hasScores: boolean;
  heatMap: HeatMapEntry[];
  plan: DiagnosticPlanWeekView[];
};

function sourceTitle(source: DiagnosticSource): string {
  if (source.kind === "interview_problem") {
    return getInterviewProblem(source.problemId)?.title ?? source.problemId;
  }
  return getLearningItemById(source.itemId)?.item.title ?? source.itemId;
}

export function buildDiagnosticView(): DiagnosticView {
  return {
    totalMinutes: diagnosticMinutes(),
    sections: diagnosticSections.map((section) => ({
      id: section.id,
      title: section.title,
      sourceTitle: sourceTitle(section.source),
      estimatedMinutes: section.estimatedMinutes,
      dimensionLabels: section.dimensions.map((d) => DIMENSION_LABEL[d] ?? d)
    }))
  };
}

export function buildDiagnosticResultView(scores: Partial<Record<string, number>>): DiagnosticResultView {
  const hasScores = Object.keys(scores).length > 0;
  const heatMap = buildHeatMap(scores);
  const plan = hasScores
    ? generatePlan(heatMap).map((week) => ({
        week: week.week,
        sectionId: week.sectionId,
        level: week.level,
        reason: week.reason,
        problemTitles: week.problemIds.map((id) => getInterviewProblem(id)?.title ?? id),
        nextStep: week.nextStep
      }))
    : [];

  return { hasScores, heatMap, plan };
}
