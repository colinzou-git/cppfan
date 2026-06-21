import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST as runPost } from "@/app/api/code/run/route";
import { POST as testPost } from "@/app/api/code/test/route";

const HELLO_ITEM = "cpp.program_basics.structure.lesson";
const starter = `#include <iostream>\nint main(){ std::cout << "Hello, cppFan!" << "\\n"; return 0; }`;
const originalProvider = process.env.CODE_RUNNER_PROVIDER;

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/code/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

beforeEach(() => {
  process.env.CODE_RUNNER_PROVIDER = "mock";
});

afterEach(() => {
  if (originalProvider === undefined) delete process.env.CODE_RUNNER_PROVIDER;
  else process.env.CODE_RUNNER_PROVIDER = originalProvider;
});

describe("POST /api/code/run", () => {
  it("rejects an item without a Code Lab", async () => {
    const response = await runPost(jsonRequest({ itemId: "cpp.not.real", source: "int main(){}" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("not_code_capable");
  });

  it("rejects empty source", async () => {
    const response = await runPost(jsonRequest({ itemId: HELLO_ITEM, source: "   " }));
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("empty_source");
  });

  it("runs valid code and returns simulated output", async () => {
    const response = await runPost(jsonRequest({ itemId: HELLO_ITEM, source: starter }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.result.stdout).toBe("Hello, cppFan!\n");
    expect(body.result.simulated).toBe(true);
  });
});

describe("POST /api/code/test", () => {
  it("summarises visible and hidden tests without leaking hidden I/O", async () => {
    const response = await testPost(jsonRequest({ itemId: HELLO_ITEM, source: starter }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.result.passed).toBe(body.result.total);
    expect(body.result.hiddenTotal).toBeGreaterThan(0);
    expect(JSON.stringify(body.result)).not.toContain("hidden:");
  });
});
