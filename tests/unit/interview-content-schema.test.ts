import { describe, expect, it } from "vitest";
import { parseInterviewPayload, validateInterviewForPublication } from "@/features/user-content/interview-content-schema";
import { CURRENT_INTERVIEW_SCHEMA_VERSION, INTERVIEW_EDITABLE_FILENAME } from "@/features/user-content/interview-content-types";

function base(overrides: Record<string, unknown> = {}) {
  return {
    title: "Two Sum",
    statement: "Given an array and a target, return indices that sum to target.",
    ...overrides
  };
}

describe("parseInterviewPayload (#490)", () => {
  it("accepts a minimal problem with defaults", () => {
    const result = parseInterviewPayload(base());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.evaluationMode).toBe("self_evaluation");
      expect(result.value.editableFilename).toBe(INTERVIEW_EDITABLE_FILENAME);
      expect(result.value.schemaVersion).toBe(CURRENT_INTERVIEW_SCHEMA_VERSION);
    }
  });

  it("requires title and statement", () => {
    expect(parseInterviewPayload({ statement: "s" }).ok).toBe(false);
    expect(parseInterviewPayload({ title: "t" }).ok).toBe(false);
    expect(parseInterviewPayload("nope").ok).toBe(false);
  });

  it("rejects a future schema version", () => {
    expect(parseInterviewPayload(base({ schemaVersion: 99 })).ok).toBe(false);
  });

  it("keeps valid group/role/difficulty and drops unknown ones", () => {
    const ok = parseInterviewPayload(
      base({ group: "two_pointers_sliding_window", roleRelevance: "systems", difficulty: "hard" })
    );
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.value.group).toBe("two_pointers_sliding_window");
      expect(ok.value.roleRelevance).toBe("systems");
      expect(ok.value.difficulty).toBe("hard");
    }
    const dropped = parseInterviewPayload(base({ group: "not_a_group", roleRelevance: "nope", difficulty: "beginner" }));
    expect(dropped.ok).toBe(true);
    if (dropped.ok) {
      expect(dropped.value.group).toBeUndefined();
      expect(dropped.value.roleRelevance).toBeUndefined();
      expect(dropped.value.difficulty).toBeUndefined();
    }
  });

  it("bounds hints, examples, tests, and metadata", () => {
    const result = parseInterviewPayload(
      base({
        hintLadder: ["hint 1", "  ", "hint 2"],
        patternTags: ["two-pointers", "hashing"],
        visibleExamples: [{ input: "1 2\n", output: "0 1\n", note: "basic" }],
        tests: [
          { name: "v", input: "1\n", expectedOutput: "0\n", hidden: false },
          { name: "h", input: "2\n", expectedOutput: "1\n", hidden: true }
        ],
        aiRubric: "Check correctness and complexity."
      })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.hintLadder).toEqual(["hint 1", "hint 2"]);
      expect(result.value.visibleExamples).toHaveLength(1);
      expect(result.value.tests?.[1].hidden).toBe(true);
      expect(result.value.aiRubric).toContain("complexity");
    }
  });
});

describe("validateInterviewForPublication (#490)", () => {
  it("passes a self-evaluated problem with no tests", () => {
    const parsed = parseInterviewPayload(base());
    expect(parsed.ok && validateInterviewForPublication(parsed.value)).toEqual([]);
  });

  it("requires a test for judge evaluation", () => {
    const parsed = parseInterviewPayload(base({ evaluationMode: "judge" }));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(validateInterviewForPublication(parsed.value).some((i) => i.field === "tests")).toBe(true);
    }
  });

  it("requires tests and a rubric for judge_plus_ai", () => {
    const parsed = parseInterviewPayload(base({ evaluationMode: "judge_plus_ai" }));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      const issues = validateInterviewForPublication(parsed.value);
      expect(issues.some((i) => i.field === "tests")).toBe(true);
      expect(issues.some((i) => i.field === "aiRubric")).toBe(true);
    }
  });

  it("accepts judge_plus_ai with a test and a rubric", () => {
    const parsed = parseInterviewPayload(
      base({
        evaluationMode: "judge_plus_ai",
        tests: [{ name: "t", input: "1\n", expectedOutput: "0\n", hidden: false }],
        aiRubric: "Assess approach."
      })
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(validateInterviewForPublication(parsed.value)).toEqual([]);
    }
  });

  it("lets ai_evaluation publish without tests", () => {
    const parsed = parseInterviewPayload(base({ evaluationMode: "ai_evaluation" }));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(validateInterviewForPublication(parsed.value)).toEqual([]);
    }
  });
});
