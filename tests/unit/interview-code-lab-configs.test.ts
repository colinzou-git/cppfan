import { describe, expect, it } from "vitest";
import {
  INTERVIEW_CODE_LAB_CONFIGS,
  buildInterviewCodeLabConfig
} from "@/features/code-lab/interview-code-lab-configs";
import { getCodeLabConfigForItem } from "@/features/code-lab/code-lab-catalog";
import { interviewProblems } from "@/features/interview/problem-catalog";

describe("interview Code Lab configs (#444)", () => {
  it("every interview problem opens a code-capable /lab item", () => {
    for (const problem of interviewProblems) {
      const config = getCodeLabConfigForItem(problem.id);
      expect(config, problem.id).not.toBeNull();
      expect(config?.enabled).toBe(true);
      expect(config?.mode).toBe("stdin");
    }
  });

  it("interview ids are namespaced so they cannot collide with cpp.* / project / exercise ids", () => {
    for (const id of Object.keys(INTERVIEW_CODE_LAB_CONFIGS)) {
      expect(id.startsWith("iv."), id).toBe(true);
    }
  });

  it("config carries the problem's skills, prompt, and visible examples", () => {
    const problem = interviewProblems[0];
    const config = buildInterviewCodeLabConfig(problem);
    expect(config.skillTags).toEqual([problem.primarySkillId, ...problem.secondarySkillIds]);
    expect(config.visibleTests).toHaveLength(problem.visibleExamples.length);
    for (const test of config.visibleTests) {
      expect(test.matcher).toBe("trimmed");
    }
    expect(config.prompt).toContain(problem.constraints);
    expect(config.prompt).toContain(problem.targetComplexity);
  });

  it("starter code is a generic scaffold, never a full solution", () => {
    const config = buildInterviewCodeLabConfig(interviewProblems[0]);
    expect(config.starterCode).toContain("int main()");
    expect(config.starterCode).toContain("TODO");
  });

  it("hidden test count is a number or omitted, never raw hidden I/O", () => {
    for (const config of Object.values(INTERVIEW_CODE_LAB_CONFIGS)) {
      if (config.hiddenTestCount !== undefined) {
        expect(typeof config.hiddenTestCount).toBe("number");
      }
    }
  });
});
