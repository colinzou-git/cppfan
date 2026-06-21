import { afterEach, describe, expect, it } from "vitest";
import { POST as tracePost } from "@/app/api/code/trace/route";
import { getHiddenTestsForItem } from "@/features/code-lab/code-lab-hidden-tests";

const ECHO_ITEM = "cpp.program_basics.io.lesson";
const originalProvider = process.env.AI_PROVIDER;
const originalEnabled = process.env.AI_CHAT_ENABLED;

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/code/trace", {
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

describe("POST /api/code/trace", () => {
  it("rejects a missing source", async () => {
    const response = await tracePost(jsonRequest({ itemId: ECHO_ITEM, source: "   " }));
    expect(response.status).toBe(400);
  });

  it("rejects a non-code item", async () => {
    const response = await tracePost(jsonRequest({ itemId: "cpp.not.real", source: "int main(){}" }));
    expect(response.status).toBe(400);
  });

  it("returns a graceful unavailable result when AI is not enabled", async () => {
    process.env.AI_PROVIDER = "groq";
    delete process.env.AI_CHAT_ENABLED;
    const response = await tracePost(jsonRequest({ itemId: ECHO_ITEM, source: "int main(){}" }));
    expect(response.status).toBe(200);
    expect((await response.json()).result.status).toBe("unavailable");
  });

  it("does not honor a hidden test name or leak hidden expected output", async () => {
    process.env.AI_PROVIDER = "fake";
    const hiddenName = getHiddenTestsForItem(ECHO_ITEM)[0]?.name ?? "hidden:echo-phrase";
    const response = await tracePost(
      jsonRequest({
        itemId: ECHO_ITEM,
        source: "int main(){}",
        // A client trying to smuggle a hidden case + expected output.
        selectedTestName: hiddenName,
        selectedExpectedOutput: "keep it secret"
      })
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(JSON.stringify(body.result)).not.toContain("keep it secret");
  });

  it("traces with the deterministic fake provider", async () => {
    process.env.AI_PROVIDER = "fake";
    const response = await tracePost(jsonRequest({ itemId: ECHO_ITEM, source: "int main(){}" }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.result.status).toBe("ok");
    expect(body.result.disclaimer.length).toBeGreaterThan(0);
  });
});
