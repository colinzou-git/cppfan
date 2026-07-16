import { describe, expect, it } from "vitest";
import {
  applyAcceptedInterviewOperations,
  describeInterviewOperation,
  parseInterviewAuthoringProposal,
  type InterviewAuthoringOperation
} from "@/features/user-content/interview-ai-authoring";
import { generateInterviewAuthoringProposal } from "@/features/user-content/interview-ai-authoring-service";
import { CURRENT_INTERVIEW_SCHEMA_VERSION, type InterviewProblemPayload } from "@/features/user-content/interview-content-types";

function problem(overrides: Partial<InterviewProblemPayload> = {}): InterviewProblemPayload {
  return {
    schemaVersion: CURRENT_INTERVIEW_SCHEMA_VERSION,
    title: "Two Sum",
    statement: "Return indices summing to target.",
    evaluationMode: "self_evaluation",
    ...overrides
  };
}

describe("parseInterviewAuthoringProposal (#490)", () => {
  it("parses fenced JSON operations and drops invalid ones", () => {
    const text = [
      "```json",
      JSON.stringify({
        summary: "Improve it",
        operations: [
          { type: "replace_field", field: "statement", value: "Clearer statement." },
          { type: "replace_field", field: "notAField", value: "x" },
          { type: "set_difficulty", value: "hard" },
          { type: "set_evaluation_mode", value: "judge" },
          { type: "add_hint", value: "Use a hash map." },
          { type: "add_example", input: "1 2\n", output: "0 1\n" },
          { type: "add_test", name: "t", input: "1\n", expectedOutput: "0\n", hidden: true },
          { type: "bogus" }
        ]
      }),
      "```"
    ].join("\n");
    const parsed = parseInterviewAuthoringProposal(text);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.operations.map((o) => o.type)).toEqual([
        "replace_field",
        "set_difficulty",
        "set_evaluation_mode",
        "add_hint",
        "add_example",
        "add_test"
      ]);
    }
  });

  it("fails when there are no valid operations", () => {
    expect(parseInterviewAuthoringProposal("no json").ok).toBe(false);
    expect(parseInterviewAuthoringProposal('```json\n{"summary":"x","operations":[]}\n```').ok).toBe(false);
  });
});

describe("applyAcceptedInterviewOperations (#490)", () => {
  it("applies field/difficulty/mode/tags/hint/example/test ops onto a copy", () => {
    const ops: InterviewAuthoringOperation[] = [
      { type: "replace_field", field: "title", value: "New title" },
      { type: "set_difficulty", value: "hard" },
      { type: "set_evaluation_mode", value: "judge" },
      { type: "set_pattern_tags", value: ["hashing"] },
      { type: "add_hint", value: "Hash the complements." },
      { type: "add_example", input: "1\n", output: "0\n", note: "basic" },
      { type: "add_test", name: "t", input: "1\n", expectedOutput: "0\n", hidden: true }
    ];
    const before = problem();
    const after = applyAcceptedInterviewOperations(before, ops);
    expect(after.title).toBe("New title");
    expect(after.difficulty).toBe("hard");
    expect(after.evaluationMode).toBe("judge");
    expect(after.patternTags).toEqual(["hashing"]);
    expect(after.hintLadder).toEqual(["Hash the complements."]);
    expect(after.visibleExamples).toHaveLength(1);
    expect(after.tests?.[0].hidden).toBe(true);
    // original untouched
    expect(before.title).toBe("Two Sum");
    expect(before.hintLadder).toBeUndefined();
  });

  it("describes operations for the accept/reject list", () => {
    expect(describeInterviewOperation({ type: "set_evaluation_mode", value: "judge" })).toContain("judge");
    expect(describeInterviewOperation({ type: "add_test", name: "X", input: "", expectedOutput: "", hidden: true })).toContain("hidden");
  });
});

describe("generateInterviewAuthoringProposal (#490)", () => {
  it("returns a deterministic proposal from the fake provider", async () => {
    const result = await generateInterviewAuthoringProposal({
      payload: problem(),
      instruction: "flesh this out",
      providerKind: "fake",
      complete: async () => ""
    });
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.proposal.operations.length).toBeGreaterThan(0);
    }
  });

  it("rejects an empty instruction", async () => {
    const result = await generateInterviewAuthoringProposal({
      payload: problem(),
      instruction: "  ",
      providerKind: "fake",
      complete: async () => ""
    });
    expect(result.status).toBe("invalid");
  });

  it("parses a real provider's fenced JSON response", async () => {
    const result = await generateInterviewAuthoringProposal({
      payload: problem(),
      instruction: "improve",
      providerKind: "anthropic",
      complete: async () => '```json\n{"summary":"s","operations":[{"type":"add_hint","value":"Think O(n)."}]}\n```'
    });
    expect(result.status).toBe("ok");
  });
});
