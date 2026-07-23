import { beforeEach, describe, expect, it, vi } from "vitest";

const { poll, record } = vi.hoisted(() => ({
  poll: vi.fn(),
  record: vi.fn()
}));

vi.mock("@/features/code-lab/code-terminal-request", () => ({
  validateTerminalAttemptRequest: vi.fn(() => ({
    ok: true,
    terminalAttemptId: "10000000-0000-4000-8000-000000000001",
    sessionId: "session",
    sessionToken: "token",
    itemId: "item",
    source: "source at start",
    contentVersionId: "20000000-0000-4000-8000-000000000001",
    milestoneIndex: 1
  }))
}));
vi.mock("@/features/code-lab/code-terminal-service", () => ({
  selectTerminalProvider: vi.fn(() => ({
    kind: "ready",
    adapter: { name: "execution-service", poll }
  }))
}));
vi.mock("@/features/code-lab/code-attempt-service", () => ({
  recordTerminalAttemptAuthoritative: record
}));

import { POST } from "@/app/api/code/terminal/attempt/route";

function request(): Request {
  return new Request("http://localhost/api/code/terminal/attempt", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  record.mockResolvedValue({ status: "recorded", attemptId: "attempt-row" });
});

describe("authoritative Terminal attempt route (#668)", () => {
  it("re-polls from sequence zero and reconstructs ordered server output", async () => {
    poll.mockResolvedValue({
      sessionId: "session",
      status: "exited",
      exitCode: 0,
      nextSequence: 5,
      events: [
        { sequence: 4, kind: "stdout", text: "two", createdAt: "t" },
        { sequence: 1, kind: "compiler", text: "warning", createdAt: "t" },
        { sequence: 3, kind: "stderr", text: "err", createdAt: "t" },
        { sequence: 2, kind: "stdout", text: "one", createdAt: "t" }
      ]
    });
    const response = await POST(request());
    expect(poll).toHaveBeenCalledWith({
      sessionId: "session",
      sessionToken: "token",
      after: 0
    });
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "exited",
        exitCode: 0,
        compileOutput: "warning",
        stdout: "onetwo",
        stderr: "err",
        provider: "execution-service",
        simulated: false
      })
    );
    expect(response.status).toBe(200);
  });

  it("does not persist a running snapshot", async () => {
    poll.mockResolvedValue({
      sessionId: "session",
      status: "running",
      nextSequence: 0,
      events: []
    });
    const response = await POST(request());
    expect(response.status).toBe(409);
    expect((await response.json()).result.status).toBe("not_final");
    expect(record).not.toHaveBeenCalled();
  });

  it("returns a retryable result when the final session cannot be read", async () => {
    poll.mockRejectedValue(new Error("gone"));
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect((await response.json()).result.status).toBe("retryable_error");
    expect(record).not.toHaveBeenCalled();
  });

  it.each([
    [{ status: "recorded", attemptId: "a" }, 200],
    [{ status: "already_recorded", attemptId: "a" }, 200],
    [{ status: "signed_out", message: "sign in" }, 401],
    [{ status: "retryable_error", message: "retry" }, 503]
  ] as const)("maps persistence result %j to HTTP %s", async (result, expectedStatus) => {
    poll.mockResolvedValue({
      sessionId: "session",
      status: "compile_error",
      nextSequence: 0,
      events: []
    });
    record.mockResolvedValue(result);
    const response = await POST(request());
    expect(response.status).toBe(expectedStatus);
  });
});
