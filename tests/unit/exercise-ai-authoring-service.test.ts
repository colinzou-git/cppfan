import { describe, expect, it, vi } from "vitest";
import {
  buildExerciseAuthoringMessages,
  generateExerciseAuthoringProposal
} from "@/features/user-content/exercise-ai-authoring-service";
import { CURRENT_EXERCISE_SCHEMA_VERSION, type ExercisePayload } from "@/features/user-content/exercise-content-types";

function exercise(overrides: Partial<ExercisePayload> = {}): ExercisePayload {
  return {
    schemaVersion: CURRENT_EXERCISE_SCHEMA_VERSION,
    title: "Reverse",
    prompt: "Reverse a line.",
    mode: "stdin_program",
    evaluationMode: "self_evaluation",
    ...overrides
  };
}

describe("buildExerciseAuthoringMessages (#488)", () => {
  it("includes the exercise op schema and the current draft context", () => {
    const messages = buildExerciseAuthoringMessages({ instruction: "add a test", payload: exercise({ tags: ["io"] }) });
    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toContain("add_test");
    expect(messages[0].content).toContain("replace_field");
    expect(messages[1].content).toContain("Reverse a line.");
    expect(messages[2].content).toContain("add a test");
  });
});

describe("generateExerciseAuthoringProposal (#488)", () => {
  it("rejects an empty instruction", async () => {
    const result = await generateExerciseAuthoringProposal({
      payload: exercise(),
      instruction: "   ",
      providerKind: "groq",
      complete: async () => ""
    });
    expect(result.status).toBe("invalid");
  });

  it("returns a deterministic proposal from the fake provider", async () => {
    const complete = vi.fn();
    const result = await generateExerciseAuthoringProposal({
      payload: exercise(),
      instruction: "improve the prompt",
      providerKind: "fake",
      complete
    });
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.proposal.operations.length).toBeGreaterThan(0);
    }
    expect(complete).not.toHaveBeenCalled();
  });

  it("parses a real provider response into a proposal", async () => {
    const result = await generateExerciseAuthoringProposal({
      payload: exercise(),
      instruction: "add an edge test",
      providerKind: "groq",
      complete: async () =>
        "```json\n" +
        JSON.stringify({ summary: "s", operations: [{ type: "add_test", name: "edge", input: "\n", expectedOutput: "\n", hidden: true }] }) +
        "\n```"
    });
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.proposal.operations[0].type).toBe("add_test");
    }
  });

  it("maps a provider error", async () => {
    const result = await generateExerciseAuthoringProposal({
      payload: exercise(),
      instruction: "x",
      providerKind: "groq",
      complete: async () => {
        throw new Error("boom");
      }
    });
    expect(result.status).toBe("provider_error");
  });
});
