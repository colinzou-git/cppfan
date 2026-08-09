import { beforeEach, describe, expect, it, vi } from "vitest";

const { start, resolvePlan } = vi.hoisted(() => ({
  start: vi.fn(),
  resolvePlan: vi.fn()
}));

vi.mock("@/features/code-lab/code-terminal-request", () => ({
  validateTerminalStartRequest: vi.fn(() => ({
    ok: true,
    itemId: "item",
    source: "browser source",
    stdin: "input",
    contentVersionId: "version",
    milestoneIndex: 2
  }))
}));
vi.mock("@/features/code-lab/code-execution-plan", () => ({
  resolveCodeExecutionPlan: resolvePlan
}));
vi.mock("@/features/code-lab/code-terminal-service", () => ({
  selectTerminalProvider: vi.fn(() => ({
    kind: "ready",
    adapter: { name: "mock", start }
  }))
}));

import { POST } from "@/app/api/code/terminal/start/route";

function request(): Request {
  return new Request("http://localhost/api/code/terminal/start", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ itemId: "item", source: "browser source" })
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Terminal start route execution contract (#666)", () => {
  it("passes only resolved prepared source, fixtures, and flags to the adapter", async () => {
    resolvePlan.mockResolvedValue({
      status: "ok",
      plan: {
        preparedSource: "prepared source",
        files: [{ name: "fixture.txt", content: "trusted" }],
        compilerFlags: ["-std=c++20", "-O0"]
      }
    });
    start.mockResolvedValue({
      sessionId: "session",
      sessionToken: "token",
      status: "running",
      events: [],
      nextSequence: 0
    });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(start).toHaveBeenCalledWith({
      source: "prepared source",
      stdin: "input",
      files: [{ name: "fixture.txt", content: "trusted" }],
      compilerFlags: ["-std=c++20", "-O0"]
    });
    const result = (await response.json()).result;
    expect(result.provider).toBe("mock");
    expect(result.terminalAttemptId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it.each(["stale_definition", "item_unavailable", "invalid_contract"] as const)(
    "refuses %s without starting a provider",
    async (status) => {
      resolvePlan.mockResolvedValue({
        status,
        ...(status === "invalid_contract" ? { message: "bad author contract" } : {})
      });
      const response = await POST(request());
      expect(response.status).toBe(200);
      const result = (await response.json()).result;
      expect(result.status).toBe(status);
      expect(result.terminalAttemptId).toBeUndefined();
      expect(start).not.toHaveBeenCalled();
    }
  );

  it("returns an explicit service error without switching to the mock", async () => {
    resolvePlan.mockResolvedValue({
      status: "ok",
      plan: {
        preparedSource: "prepared source",
        files: [],
        compilerFlags: ["-std=c++20"]
      }
    });
    start.mockRejectedValueOnce(new Error("connection refused"));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({
      error: { code: "terminal_error" }
    });
    expect(start).toHaveBeenCalledTimes(1);
  });
});
