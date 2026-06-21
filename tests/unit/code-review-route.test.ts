import { afterEach, describe, expect, it } from "vitest";
import { POST as reviewPost } from "@/app/api/code/review/route";

const HELLO_ITEM = "cpp.program_basics.structure.lesson";
const originalProvider = process.env.AI_PROVIDER;
const originalEnabled = process.env.AI_CHAT_ENABLED;

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/code/review", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

afterEach(() => {
  if (originalProvider === undefined) delete process.env.AI_PROVIDER;
  else process.env.AI_PROVIDER = originalProvider;
  if (originalEnabled === undefined) delete process.env.AI_CHAT_ENABLED;
  else process.env.AI_CHAT_ENABLED = originalEnabled;
});

describe("POST /api/code/review", () => {
  it("returns a graceful unavailable result when AI is not enabled", async () => {
    process.env.AI_PROVIDER = "groq";
    delete process.env.AI_CHAT_ENABLED;
    const response = await reviewPost(jsonRequest({ itemId: HELLO_ITEM, source: "int main(){}" }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.result.status).toBe("unavailable");
    expect(body.result.learnerMessage.length).toBeGreaterThan(0);
  });

  it("returns structured weak-evidence feedback with the deterministic fake provider", async () => {
    process.env.AI_PROVIDER = "fake";
    const response = await reviewPost(jsonRequest({ itemId: HELLO_ITEM, source: "int main(){}" }));
    expect(response.status).toBe(200);
    const body = await response.json();
    // Fake provider returns prose, so the parser falls back gracefully.
    expect(["ok", "invalid"]).toContain(body.result.status);
    expect(body.result.evidenceStrength).toBe("weak_ai_inference");
  });

  it("rejects a non-code item", async () => {
    const response = await reviewPost(jsonRequest({ itemId: "cpp.not.real", source: "int main(){}" }));
    expect(response.status).toBe(400);
  });
});
