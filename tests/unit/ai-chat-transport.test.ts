import { afterEach, describe, expect, it, vi } from "vitest";
import type { AiChatContext, AiChatStreamEvent } from "@/features/ai-chat/ai-chat-types";
import { readAiChatApiErrorMessage, runTutor } from "@/features/ai-chat/tutor-transport";

const context: AiChatContext = {
  schemaVersion: 1,
  sourceKind: "learning_item",
  sourceId: "lesson-1",
  sourceVersion: "v1",
  title: "References",
  prompt: "Explain references.",
  assessmentState: "instructional",
  revealPolicy: "normal"
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AI chat transport errors", () => {
  it("surfaces the structured server message", async () => {
    const response = new Response(
      JSON.stringify({ error: { code: "ai_unavailable", message: "Free AI Chat is not enabled yet." } }),
      { status: 503, headers: { "content-type": "application/json" } }
    );

    const message = await readAiChatApiErrorMessage(response, "The tutor is unavailable.");
    expect(message).toBe("Free AI Chat is not enabled yet.");
  });

  it("uses the fallback for a non-JSON response", async () => {
    const response = new Response("Service unavailable", { status: 502 });
    const message = await readAiChatApiErrorMessage(response, "The tutor is unavailable.");
    expect(message).toBe("The tutor is unavailable.");
  });

  it("uses the fallback for a blank message", async () => {
    const response = new Response(JSON.stringify({ error: { message: "   " } }), {
      status: 503,
      headers: { "content-type": "application/json" }
    });
    const message = await readAiChatApiErrorMessage(response, "Saved conversations are unavailable.");
    expect(message).toBe("Saved conversations are unavailable.");
  });

  it("emits the final stream event even without a trailing newline", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response('{"type":"delta","text":"Hi"}\n{"type":"done","status":"complete"}', {
          status: 200,
          headers: { "content-type": "application/x-ndjson" }
        })
      )
    );

    const events: AiChatStreamEvent[] = [];
    await runTutor({
      context,
      message: "Help me",
      requestId: "00000000-0000-4000-8000-000000000001",
      conversationId: null,
      signal: new AbortController().signal,
      onEvent: (event) => events.push(event)
    });

    expect(events).toEqual([
      { type: "delta", text: "Hi" },
      { type: "done", status: "complete" }
    ]);
  });
});
