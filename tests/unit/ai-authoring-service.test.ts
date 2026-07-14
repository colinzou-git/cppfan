import { describe, expect, it, vi } from "vitest";
import { generateAuthoringProposal } from "@/features/user-content/ai-authoring-service";
import { CURRENT_LESSON_SCHEMA_VERSION, type LessonPayload } from "@/features/user-content/user-content-types";

const payload: LessonPayload = {
  schemaVersion: CURRENT_LESSON_SCHEMA_VERSION,
  itemType: "lesson",
  title: "T",
  content: "C",
  explanation: "E"
};

function base(overrides: Partial<Parameters<typeof generateAuthoringProposal>[0]> = {}) {
  return {
    payload,
    instruction: "Add a summary",
    attachments: [],
    providerKind: "groq",
    complete: vi.fn().mockResolvedValue(""),
    ...overrides
  };
}

describe("generateAuthoringProposal (#487)", () => {
  it("requires an instruction", async () => {
    const result = await generateAuthoringProposal(base({ instruction: "   " }));
    expect(result.status).toBe("invalid");
  });

  it("returns a deterministic proposal for the fake provider without calling the model", async () => {
    const complete = vi.fn();
    const result = await generateAuthoringProposal(base({ providerKind: "fake", complete }));
    expect(result.status).toBe("ok");
    expect(complete).not.toHaveBeenCalled();
    if (result.status === "ok") {
      expect(result.proposal.operations.length).toBeGreaterThan(0);
    }
  });

  it("parses a real provider's structured JSON reply", async () => {
    const reply = "```json\n" + JSON.stringify({ summary: "s", operations: [{ type: "replace_field", field: "title", value: "New" }] }) + "\n```";
    const result = await generateAuthoringProposal(base({ complete: vi.fn().mockResolvedValue(reply) }));
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.proposal.operations[0]).toMatchObject({ type: "replace_field", field: "title", value: "New" });
    }
  });

  it("reports invalid when the model returns prose, and provider_error when it throws", async () => {
    expect((await generateAuthoringProposal(base({ complete: vi.fn().mockResolvedValue("no json here") }))).status).toBe("invalid");
    expect((await generateAuthoringProposal(base({ complete: vi.fn().mockRejectedValue(new Error("boom")) }))).status).toBe("provider_error");
  });
});
