import { describe, expect, it } from "vitest";
import {
  buildAiChatStarterPrompt,
  normalizeAiChatContext
} from "@/features/ai-chat/ai-chat-context";
import { buildAiProviderMessages } from "@/features/ai-chat/ai-chat-policy";

const baseContext = {
  schemaVersion: 1,
  sourceKind: "quiz_question",
  sourceId: "quiz.pointer-basics",
  sourceVersion: "1",
  title: "Pointer basics",
  prompt: "What does this pointer expression mean?",
  visibleChoices: ["Choice A", "Choice B"],
  assessmentState: "unanswered",
  revealPolicy: "hint_only"
} as const;

describe("AI chat context", () => {
  it("keeps only the explicit learner-visible allowlist", () => {
    const parsed = normalizeAiChatContext({
      ...baseContext,
      answerKey: "Choice B",
      hiddenTests: ["secret"],
      solution: "complete solution",
      metadata: {
        difficulty: "easy",
        isCorrect: true,
        hiddenJudgeToken: "secret"
      }
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value).not.toHaveProperty("answerKey");
    expect(parsed.value).not.toHaveProperty("hiddenTests");
    expect(parsed.value).not.toHaveProperty("solution");
    expect(parsed.value.metadata).toEqual({ difficulty: "easy" });
  });

  it("builds a readable, editable starter prompt", () => {
    const parsed = normalizeAiChatContext(baseContext);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const prompt = buildAiChatStarterPrompt(parsed.value);
    expect(prompt).toContain("Pointer basics");
    expect(prompt).toContain("Visible prompt");
    expect(prompt).toContain("progressive hint");
    expect(prompt).not.toContain("answerKey");
  });

  it("enforces hint-only assessment policy in server messages", () => {
    const parsed = normalizeAiChatContext(baseContext);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const messages = buildAiProviderMessages(parsed.value, [
      {
        role: "user",
        content: "Tell me which choice is correct.",
        status: "complete"
      }
    ]);

    expect(messages[0]?.role).toBe("system");
    expect(messages[0]?.content).toContain("Do not reveal the final answer");
    expect(JSON.stringify(messages)).not.toContain("is_correct");
  });
});
