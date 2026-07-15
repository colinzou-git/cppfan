import { describe, expect, it } from "vitest";
import {
  applyAcceptedLabOperations,
  describeLabOperation,
  parseLabAuthoringProposal,
  type LabAuthoringOperation
} from "@/features/user-content/lab-ai-authoring";
import { generateLabAuthoringProposal } from "@/features/user-content/lab-ai-authoring-service";
import { CURRENT_LAB_SCHEMA_VERSION, type LabPayload } from "@/features/user-content/lab-content-types";

function lab(overrides: Partial<LabPayload> = {}): LabPayload {
  return {
    schemaVersion: CURRENT_LAB_SCHEMA_VERSION,
    title: "CSV",
    summary: "Summarize a CSV.",
    taskDescription: "Read a CSV.",
    mode: "single_task",
    evaluationMode: "self_evaluation",
    ...overrides
  };
}

describe("parseLabAuthoringProposal (#489)", () => {
  it("parses fenced JSON operations and drops invalid ones", () => {
    const text = [
      "Here you go:",
      "```json",
      JSON.stringify({
        summary: "Improve the task",
        operations: [
          { type: "replace_field", field: "taskDescription", value: "Clearer task." },
          { type: "replace_field", field: "notAField", value: "x" },
          { type: "set_mode", value: "milestones" },
          { type: "add_milestone", title: "Parse", instructions: "Parse the CSV.", required: true },
          { type: "add_completion_test", name: "t", input: "a\n", expectedOutput: "1\n", hidden: true },
          { type: "bogus" }
        ]
      }),
      "```"
    ].join("\n");
    const parsed = parseLabAuthoringProposal(text);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.operations.map((o) => o.type)).toEqual([
        "replace_field",
        "set_mode",
        "add_milestone",
        "add_completion_test"
      ]);
    }
  });

  it("fails when there are no valid operations", () => {
    expect(parseLabAuthoringProposal("no json here").ok).toBe(false);
    expect(parseLabAuthoringProposal('```json\n{"summary":"x","operations":[]}\n```').ok).toBe(false);
  });
});

describe("applyAcceptedLabOperations (#489)", () => {
  it("applies field, mode, milestone, and test ops onto a copy", () => {
    const ops: LabAuthoringOperation[] = [
      { type: "replace_field", field: "title", value: "New title" },
      { type: "set_difficulty", value: "advanced" },
      { type: "set_tags", value: ["io", "files"] },
      { type: "set_mode", value: "milestones" },
      { type: "add_milestone", title: "Parse", instructions: "Parse it.", required: true },
      { type: "add_milestone", title: "Stats", instructions: "Compute.", required: false }
    ];
    const before = lab();
    const after = applyAcceptedLabOperations(before, ops);
    expect(after.title).toBe("New title");
    expect(after.difficulty).toBe("advanced");
    expect(after.tags).toEqual(["io", "files"]);
    expect(after.mode).toBe("milestones");
    expect(after.milestones).toHaveLength(2);
    expect(after.milestones?.[1].required).toBe(false);
    // original is untouched
    expect(before.title).toBe("CSV");
    expect(before.milestones).toBeUndefined();
  });

  it("appends completion tests", () => {
    const after = applyAcceptedLabOperations(lab(), [
      { type: "add_completion_test", name: "basic", input: "a\n", expectedOutput: "1\n", hidden: false }
    ]);
    expect(after.completion?.tests).toHaveLength(1);
    expect(after.completion?.tests?.[0].name).toBe("basic");
  });

  it("describes operations for the accept/reject list", () => {
    expect(describeLabOperation({ type: "set_mode", value: "milestones" })).toContain("milestones");
    expect(describeLabOperation({ type: "add_milestone", title: "X", instructions: "y", required: false })).toContain("optional");
  });
});

describe("generateLabAuthoringProposal (#489)", () => {
  it("returns a deterministic proposal from the fake provider", async () => {
    const result = await generateLabAuthoringProposal({
      payload: lab(),
      instruction: "make it a milestone lab",
      providerKind: "fake",
      complete: async () => ""
    });
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.proposal.operations.length).toBeGreaterThan(0);
    }
  });

  it("rejects an empty instruction", async () => {
    const result = await generateLabAuthoringProposal({
      payload: lab(),
      instruction: "   ",
      providerKind: "fake",
      complete: async () => ""
    });
    expect(result.status).toBe("invalid");
  });

  it("parses a real provider's fenced JSON response", async () => {
    const result = await generateLabAuthoringProposal({
      payload: lab(),
      instruction: "improve",
      providerKind: "anthropic",
      complete: async () => '```json\n{"summary":"s","operations":[{"type":"replace_field","field":"summary","value":"Better."}]}\n```'
    });
    expect(result.status).toBe("ok");
  });
});
