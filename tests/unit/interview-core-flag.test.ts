import { describe, expect, it } from "vitest";
import {
  getInterviewCoreProblems,
  getInterviewProblems,
  isInterviewCoreProblem,
  type InterviewProblem
} from "@/features/interview/problem-catalog";

describe("interview-core flag (#176)", () => {
  it("treats the whole curated catalog as the reviewed interview-core set", () => {
    const problems = getInterviewProblems();
    expect(problems.length).toBeGreaterThanOrEqual(60);
    expect(getInterviewCoreProblems().length).toBe(problems.length);
  });

  it("reads importance from the explicit flag, not item count", () => {
    const core = { interviewCore: true } as InterviewProblem;
    const supplementary = { interviewCore: false } as InterviewProblem;
    const unflagged = {} as InterviewProblem;
    expect(isInterviewCoreProblem(core)).toBe(true);
    expect(isInterviewCoreProblem(supplementary)).toBe(false);
    // Omitted defaults to core (the catalog is the core set by construction).
    expect(isInterviewCoreProblem(unflagged)).toBe(true);
  });
});
