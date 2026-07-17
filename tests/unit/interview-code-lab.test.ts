import { describe, expect, it } from "vitest";
import { interviewPayloadToCodeLabConfig } from "@/features/user-content/interview-code-lab";
import { CURRENT_INTERVIEW_SCHEMA_VERSION, type InterviewProblemPayload } from "@/features/user-content/interview-content-types";

function problem(overrides: Partial<InterviewProblemPayload> = {}): InterviewProblemPayload {
  return {
    schemaVersion: CURRENT_INTERVIEW_SCHEMA_VERSION,
    title: "Two Sum",
    statement: "Return indices summing to target.",
    evaluationMode: "judge",
    ...overrides
  };
}

describe("interviewPayloadToCodeLabConfig (#490)", () => {
  it("exposes visible tests only + a hidden count; no reference or hidden I/O leaks", () => {
    const config = interviewPayloadToCodeLabConfig(
      problem({
        starterCode: "int main(){}",
        referenceSolution: "SECRET_REFERENCE",
        tests: [
          { name: "v", input: "1\n", expectedOutput: "0\n", hidden: false },
          { name: "h", input: "SECRET_INPUT\n", expectedOutput: "SECRET_OUT\n", hidden: true }
        ]
      })
    );
    expect(config.prompt).toBe("Return indices summing to target.");
    expect(config.starterCode).toBe("int main(){}");
    expect(config.evaluationMode).toBe("judge"); // #609: mode carried into the config
    expect(config.visibleTests).toHaveLength(1);
    expect(config.visibleTests[0].name).toBe("v");
    expect(config.hiddenTestCount).toBe(1);
    const serialized = JSON.stringify(config);
    expect(serialized).not.toContain("SECRET_REFERENCE");
    expect(serialized).not.toContain("SECRET_INPUT");
    expect(serialized).not.toContain("SECRET_OUT");
  });

  it("omits the hidden count when there are no hidden tests", () => {
    const config = interviewPayloadToCodeLabConfig(problem());
    expect(config.hiddenTestCount).toBeUndefined();
    expect(config.visibleTests).toEqual([]);
  });
});
