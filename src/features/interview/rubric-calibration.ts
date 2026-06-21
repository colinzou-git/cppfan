import { RUBRIC_CRITERIA, reviewSession, type RubricCriterionId, type RubricScore } from "./rubric";

export type CalibrationSample = {
  id: string;
  label: string;
  scores: RubricScore[];
  expectedReady: boolean;
};

function score(criterion: RubricCriterionId, value: number, source: RubricScore["source"] = "peer"): RubricScore {
  return { criterion, score: value, source };
}

export const RUBRIC_CALIBRATION_SAMPLES: CalibrationSample[] = [
  { id: "passing-code-thin-reasoning", label: "Passing code with thin reasoning", scores: [score("correctness", 4), score("cpp_implementation", 4), score("baseline_reasoning", 1), score("optimization", 1), score("communication", 2), score("testing", 3)], expectedReady: false },
  { id: "passing-code-thin-tests", label: "Passing code with thin tests", scores: [score("correctness", 4), score("cpp_implementation", 4), score("testing", 1), score("communication", 3), score("complexity", 3)], expectedReady: false },
  { id: "approach-with-broken-code", label: "Good approach with broken code", scores: [score("clarification", 3), score("baseline_reasoning", 3), score("correctness", 1), score("cpp_implementation", 1), score("communication", 3)], expectedReady: false },
  { id: "many-prompts-success", label: "Success with many prompts", scores: [score("correctness", 4), score("cpp_implementation", 4), score("hint_dependence", 1), score("follow_up_adaptability", 2), score("communication", 3)], expectedReady: false },
  { id: "balanced-success", label: "Balanced success", scores: RUBRIC_CRITERIA.map((criterion) => score(criterion.id, criterion.id === "hint_dependence" ? 4 : 3)), expectedReady: true },
  { id: "strong-cpp-success", label: "Strong C++ success", scores: [score("correctness", 4), score("cpp_implementation", 4), score("testing", 4), score("complexity", 4), score("communication", 3), score("hint_dependence", 4)], expectedReady: true },
  { id: "time-box-miss", label: "Time-box miss", scores: [score("clarification", 3), score("examples", 3), score("baseline_reasoning", 3), score("correctness", 1), score("time_management", 1)], expectedReady: false },
  { id: "follow-up-miss", label: "Follow-up miss", scores: [score("correctness", 4), score("cpp_implementation", 3), score("follow_up_adaptability", 1), score("optimization", 2)], expectedReady: false },
  { id: "silent-coding", label: "Silent coding", scores: [score("correctness", 4), score("cpp_implementation", 4), score("testing", 3), score("communication", 1)], expectedReady: false },
  { id: "complexity-miss", label: "Complexity miss", scores: [score("correctness", 4), score("cpp_implementation", 3), score("testing", 3), score("complexity", 1)], expectedReady: false },
  { id: "uneven-solid", label: "Uneven solid", scores: [score("correctness", 3), score("cpp_implementation", 3), score("testing", 2), score("communication", 2), score("hint_dependence", 2)], expectedReady: false },
  { id: "mock-ready", label: "Mock ready", scores: RUBRIC_CRITERIA.map((criterion) => score(criterion.id, 3)), expectedReady: true }
];

export function rubricScoresIndicateReady(scores: RubricScore[]): boolean {
  const review = reviewSession(scores);
  const byCriterion = new Map(review.summaries.map((summary) => [summary.criterion, summary.average ?? 0]));
  const required: RubricCriterionId[] = [
    "baseline_reasoning",
    "correctness",
    "cpp_implementation",
    "testing",
    "complexity",
    "communication",
    "hint_dependence",
    "follow_up_adaptability"
  ];
  return required.every((criterion) => (byCriterion.get(criterion) ?? 0) >= 2.5);
}
