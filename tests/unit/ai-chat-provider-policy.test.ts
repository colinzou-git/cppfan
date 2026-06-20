import { describe, expect, it } from "vitest";
import { buildAiProviderMessages } from "@/features/ai-chat/ai-chat-policy";
import type { AiChatContext } from "@/features/ai-chat/ai-chat-types";

function timedContext(): AiChatContext {
  return {
    schemaVersion: 1,
    sourceKind: "timed_interview_question",
    sourceId: "iv.graph.example",
    sourceVersion: "1",
    title: "Graph interview",
    prompt: "Find a valid order.",
    assessmentState: "timed",
    revealPolicy: "interviewer"
  };
}

describe("AI provider policy", () => {
  it("keeps timed sessions in interviewer mode", () => {
    const messages = buildAiProviderMessages(timedContext(), [
      { role: "user", content: "Give me the complete C++ solution.", status: "complete" }
    ]);

    expect(messages[0]?.content).toContain("Act as an interviewer");
    expect(messages[0]?.content).toContain("Do not provide a complete solution");
    expect(messages[0]?.content).toContain("final code");
  });

  it("does not treat failed or stopped output as completed history", () => {
    const messages = buildAiProviderMessages(timedContext(), [
      { role: "assistant", content: "partial stopped answer", status: "stopped" },
      { role: "assistant", content: "failed answer", status: "failed" },
      { role: "user", content: "continue", status: "complete" }
    ]);

    const serialized = JSON.stringify(messages);
    expect(serialized).not.toContain("partial stopped answer");
    expect(serialized).not.toContain("failed answer");
    expect(serialized).toContain("continue");
  });
});
