import { describe, expect, it } from "vitest";
import { buildCodeLabChatContext } from "@/features/code-lab/code-lab-chat-context";
import { normalizeAiChatContext } from "@/features/ai-chat/ai-chat-context";

describe("Code Lab chat context", () => {
  const base = {
    itemId: "cpp.program_basics.structure.lesson",
    title: "A minimal C++ program",
    prompt: "Print Hello, cppFan!",
    topic: "cpp.program_basics.structure",
    sourceVersion: "2026-06-23T00:00:00Z"
  };

  it("attaches the current editor source as the learner draft", () => {
    const source = '#include <iostream>\nint main(){ std::cout << "Hi"; }';
    const context = buildCodeLabChatContext({ ...base, source });
    expect(context.sourceKind).toBe("lab_item");
    expect(context.sourceId).toBe(base.itemId);
    expect(context.learnerDraft).toBe(source);
    expect(context.metadata).toMatchObject({ itemType: "code_lab" });
  });

  it("produces a context the server's own normalizer accepts unchanged", () => {
    const source = "int main(){ return 0; }";
    const context = buildCodeLabChatContext({ ...base, source });

    const parsed = normalizeAiChatContext(context);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error(parsed.error);
    // The live code must survive validation so the tutor answers against it.
    expect(parsed.value.learnerDraft).toBe(source);
    expect(parsed.value.sourceKind).toBe("lab_item");
  });

  it("reflects the latest source on each build (new question sees edited code)", () => {
    const first = buildCodeLabChatContext({ ...base, source: "v1" });
    const second = buildCodeLabChatContext({ ...base, source: "v2" });
    expect(first.learnerDraft).toBe("v1");
    expect(second.learnerDraft).toBe("v2");
  });
});
