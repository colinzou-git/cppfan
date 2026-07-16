import { describe, expect, it } from "vitest";
import { buildInterviewPayload, fieldsFromInterviewPayload } from "@/features/user-content/interview-editor";
import { parseInterviewPayload } from "@/features/user-content/interview-content-schema";
import { CURRENT_INTERVIEW_SCHEMA_VERSION, type InterviewProblemPayload } from "@/features/user-content/interview-content-types";

describe("interview editor field mapping (#490)", () => {
  it("defaults an empty payload to a self_evaluation draft", () => {
    const fields = fieldsFromInterviewPayload(null);
    expect(fields.evaluationMode).toBe("self_evaluation");
    expect(fields.difficulty).toBe("");
    expect(fields.visibleExamples).toEqual([]);
    const payload = buildInterviewPayload(fields);
    expect(payload.evaluationMode).toBe("self_evaluation");
    // unset difficulty/group are omitted, not empty strings
    expect(payload.difficulty).toBeUndefined();
    expect(payload.group).toBeUndefined();
  });

  it("round-trips a full problem through fields and back", () => {
    const original: InterviewProblemPayload = {
      schemaVersion: CURRENT_INTERVIEW_SCHEMA_VERSION,
      title: "Two Sum",
      statement: "Return indices summing to target.",
      evaluationMode: "judge_plus_ai",
      group: "arrays_hashing_prefix",
      roleRelevance: "systems",
      difficulty: "medium",
      tags: ["arrays"],
      patternTags: ["hashing"],
      constraints: "n <= 1e5",
      targetComplexity: "O(n)",
      requiredEdgeCases: ["empty array"],
      clarifyingQuestions: ["Are there duplicates?"],
      hintLadder: ["Use a hash map."],
      visibleExamples: [{ input: "1 2\n", output: "0 1\n", note: "basic" }],
      starterCode: "int main(){}",
      referenceSolution: "int main(){ /* solve */ }",
      solutionExplanation: "Hash the complements.",
      tests: [{ name: "t", input: "1\n", expectedOutput: "0\n", hidden: true }],
      aiRubric: "Check correctness and complexity."
    };
    const rebuilt = parseInterviewPayload(buildInterviewPayload(fieldsFromInterviewPayload(original)));
    expect(rebuilt.ok).toBe(true);
    if (rebuilt.ok) {
      expect(rebuilt.value.title).toBe("Two Sum");
      expect(rebuilt.value.evaluationMode).toBe("judge_plus_ai");
      expect(rebuilt.value.group).toBe("arrays_hashing_prefix");
      expect(rebuilt.value.roleRelevance).toBe("systems");
      expect(rebuilt.value.difficulty).toBe("medium");
      expect(rebuilt.value.patternTags).toEqual(["hashing"]);
      expect(rebuilt.value.hintLadder).toEqual(["Use a hash map."]);
      expect(rebuilt.value.visibleExamples).toHaveLength(1);
      expect(rebuilt.value.tests?.[0].hidden).toBe(true);
      expect(rebuilt.value.aiRubric).toContain("complexity");
    }
  });

  it("omits empty examples with no input/output", () => {
    const fields = fieldsFromInterviewPayload(null);
    fields.title = "T";
    fields.statement = "S";
    fields.visibleExamples = [{ input: "", output: "" }];
    const payload = buildInterviewPayload(fields);
    expect(payload.visibleExamples).toBeUndefined();
  });
});
