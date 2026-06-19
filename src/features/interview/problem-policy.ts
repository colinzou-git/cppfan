import { interviewProblems, type InterviewProblem } from "./problem-catalog";

export const INTERVIEW_CORE_PROBLEM_IDS = new Set<string>([
  "iv.prefix.balance-returns-to-zero",
  "iv.sliding.longest-window-under-budget",
  "iv.bsearch.min-rate-before-deadline",
  "iv.intervals.max-concurrent-maintenance",
  "iv.heap.top-k-hot-keys",
  "iv.heap.k-closest-points",
  "iv.tree.diameter",
  "iv.graph.service-init-order",
  "iv.graph.cheapest-route",
  "iv.dp.fewest-coins",
  "iv.cache.lru-design",
  "iv.cpp.iterator-invalidation",
  "iv.cpp.dangling-reference",
  "iv.cpp.missing-virtual-destructor"
]);

export type ProblemExposureKind = "diagnostic" | "guided" | "practice" | "mock" | "solution_revealed";

export type ProblemExposure = {
  problemId: string;
  problemVersion: number;
  kind: ProblemExposureKind;
  occurredAt: string;
};

export function isInterviewCore(problemId: string) {
  return INTERVIEW_CORE_PROBLEM_IDS.has(problemId);
}

export function hasPriorExposure(problem: InterviewProblem, exposures: readonly ProblemExposure[]) {
  return exposures.some((item) => item.problemId === problem.id && item.problemVersion === problem.version);
}

export function selectUnseenTransferProblem(
  sourceProblemId: string,
  exposures: readonly ProblemExposure[],
  excludedProblemIds: readonly string[] = []
): InterviewProblem | null {
  const source = interviewProblems.find((problem) => problem.id === sourceProblemId);
  if (!source) return null;
  const excluded = new Set([sourceProblemId, ...excludedProblemIds]);
  return interviewProblems.find((candidate) =>
    !excluded.has(candidate.id) &&
    candidate.patternTags.some((tag) => source.patternTags.includes(tag)) &&
    !hasPriorExposure(candidate, exposures)
  ) ?? null;
}

export function getInterviewCoreProblems() {
  return interviewProblems.filter((problem) => isInterviewCore(problem.id));
}
