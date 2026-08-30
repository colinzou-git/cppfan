import { interviewProblems, type InterviewProblem } from "./problem-catalog";

export const INTERVIEW_CORE_PROBLEM_IDS = new Set<string>(
  interviewProblems.filter((problem) => problem.interviewCore ?? true).map((problem) => problem.id)
);

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
