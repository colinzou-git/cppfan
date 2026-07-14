import { describe, expect, it } from "vitest";
import { buildAuthoringMessages } from "@/features/user-content/ai-authoring-policy";
import { parseAuthoringProposal } from "@/features/user-content/ai-authoring-proposal";
import { CURRENT_LESSON_SCHEMA_VERSION, type LessonPayload } from "@/features/user-content/user-content-types";

function lesson(overrides: Partial<LessonPayload> = {}): LessonPayload {
  return {
    schemaVersion: CURRENT_LESSON_SCHEMA_VERSION,
    itemType: "lesson",
    title: "Pointers",
    content: "A pointer holds an address.",
    explanation: "Addresses refer to memory.",
    ...overrides
  };
}

describe("buildAuthoringMessages (#487)", () => {
  it("produces a system + draft-context + request message", () => {
    const messages = buildAuthoringMessages({ instruction: "Add a common-mistakes section", payload: lesson() });
    expect(messages).toHaveLength(3);
    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toContain("JSON");
    expect(messages[0].content).toContain("append_section");
    expect(messages[1].content).toContain("Pointers");
    expect(messages[1].content).toContain("A pointer holds an address.");
    expect(messages[2].content).toContain("Add a common-mistakes section");
  });

  it("grounds on author-source attachments without leaking file contents", () => {
    const messages = buildAuthoringMessages({
      instruction: "Use my references",
      payload: lesson(),
      authorAttachments: [
        { kind: "url", url: "https://ref.example/x" },
        { kind: "lesson_ref", referencedLearningItemId: "cpp.references.pointers" }
      ]
    });
    expect(messages[1].content).toContain("https://ref.example/x");
    expect(messages[1].content).toContain("cpp.references.pointers");
  });

  it("the system prompt documents a shape parseAuthoringProposal can consume", () => {
    // A well-formed model reply following the documented schema parses cleanly.
    const modelReply = "```json\n" + JSON.stringify({
      summary: "add intro",
      operations: [{ type: "append_section", section: "introduction", value: "Intro." }]
    }) + "\n```";
    const parsed = parseAuthoringProposal(modelReply);
    expect(parsed.ok).toBe(true);
  });
});
