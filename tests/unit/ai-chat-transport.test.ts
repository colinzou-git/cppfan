import { describe, expect, it } from "vitest";
import { readAiChatApiErrorMessage } from "@/features/ai-chat/tutor-transport";

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
});
