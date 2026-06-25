import { afterEach, describe, expect, it, vi } from "vitest";
import {
  debugActionRequest,
  debugHealthRequest,
  explainDebugRequest,
  startDebugRequest,
  stopDebugRequest
} from "@/features/code-lab/code-debug-client";
import type { CodeDebugSnapshot } from "@/features/code-lab/code-debug-types";

function mockResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

const snapshot: CodeDebugSnapshot = {
  sessionId: null,
  status: "unconfigured",
  file: "main.cpp",
  line: null,
  stdout: "",
  stderr: "",
  compileOutput: "",
  stack: [],
  variables: [],
  watches: [],
  breakpoints: []
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("code-debug-client (#442)", () => {
  it("unwraps a { result } envelope", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse({ result: snapshot }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await startDebugRequest({ itemId: "x", source: "int main(){}", breakpoints: [] });
    expect(result.status).toBe("unconfigured");
    expect(fetchMock).toHaveBeenCalledWith("/api/code/debug/start", expect.objectContaining({ method: "POST" }));
  });

  it("throws the error message from an { error } envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockResponse({ error: { code: "boom", message: "kaboom" } }, false, 400))
    );
    await expect(
      debugActionRequest({ sessionId: "s1", action: "continue" })
    ).rejects.toThrow("kaboom");
  });

  it("never sends an authorization header from the browser", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse({ result: { ok: true } }));
    vi.stubGlobal("fetch", fetchMock);

    await stopDebugRequest({ sessionId: "s1" });
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.has("authorization")).toBe(false);
  });

  it("posts an explain request and unwraps the result", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockResponse({ result: { status: "unavailable", explanation: "later" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await explainDebugRequest({
      itemId: "x",
      source: "int main(){}",
      snapshot
    });
    expect(result.status).toBe("unavailable");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/code/debug/explain",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("requests health over GET", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse({ result: { status: "unconfigured" } }));
    vi.stubGlobal("fetch", fetchMock);

    const health = await debugHealthRequest();
    expect(health.status).toBe("unconfigured");
    expect(fetchMock).toHaveBeenCalledWith("/api/code/debug/health", expect.objectContaining({ method: "GET" }));
  });
});
