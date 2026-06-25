import { afterEach, describe, expect, it } from "vitest";
import { POST as explainPost } from "@/app/api/code/debug/explain/route";
import type { CodeDebugSnapshot } from "@/features/code-lab/code-debug-types";

const CODE_ITEM = "cpp.program_basics.structure.lesson";
const originalProvider = process.env.AI_PROVIDER;
const originalEnabled = process.env.AI_CHAT_ENABLED;

const snapshot: CodeDebugSnapshot = {
  sessionId: "s1",
  status: "paused",
  file: "main.cpp",
  line: 2,
  stdout: "",
  stderr: "",
  compileOutput: "",
  stack: [{ id: "f0", name: "main", line: 2 }],
  variables: [{ name: "i", value: "0" }],
  watches: [],
  breakpoints: []
};

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/code/debug/explain", {
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

describe("POST /api/code/debug/explain", () => {
  it("rejects a non-code item", async () => {
    const res = await explainPost(jsonRequest({ itemId: "cpp.not.real", source: "int main(){}", snapshot }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("not_code_capable");
  });

  it("rejects a missing snapshot", async () => {
    const res = await explainPost(jsonRequest({ itemId: CODE_ITEM, source: "int main(){}" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_snapshot");
  });

  it("rejects empty source", async () => {
    const res = await explainPost(jsonRequest({ itemId: CODE_ITEM, source: "   ", snapshot }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("empty_source");
  });

  it("returns a graceful unavailable result when AI is not enabled", async () => {
    process.env.AI_PROVIDER = "groq";
    delete process.env.AI_CHAT_ENABLED;
    const res = await explainPost(jsonRequest({ itemId: CODE_ITEM, source: "int main(){}", snapshot }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result.status).toBe("unavailable");
    expect(body.result.explanation.length).toBeGreaterThan(0);
  });

  it("explains the paused step with the deterministic fake provider", async () => {
    process.env.AI_PROVIDER = "fake";
    const res = await explainPost(jsonRequest({ itemId: CODE_ITEM, source: "int main(){}", snapshot }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(["ok", "unavailable"]).toContain(body.result.status);
    expect(typeof body.result.explanation).toBe("string");
  });
});
