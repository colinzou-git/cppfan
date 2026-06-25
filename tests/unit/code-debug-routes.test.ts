import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST as startPost } from "@/app/api/code/debug/start/route";
import { POST as actionPost } from "@/app/api/code/debug/action/route";
import { POST as stopPost } from "@/app/api/code/debug/stop/route";
import { GET as healthGet } from "@/app/api/code/debug/health/route";
import { selectDebugger } from "@/features/code-lab/code-debugger-service";

const CODE_ITEM = "cpp.program_basics.structure.lesson";
const SOURCE = `#include <iostream>\nint main(){ int i = 0; return i; }`;

const ENV_KEYS = [
  "CODE_DEBUGGER_PROVIDER",
  "CODE_DEBUGGER_BASE_URL",
  "CODE_DEBUGGER_API_KEY"
] as const;
const original: Record<string, string | undefined> = {};

function jsonRequest(url: string, body: unknown) {
  return new Request(`http://localhost${url}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

beforeEach(() => {
  for (const key of ENV_KEYS) {
    original[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

describe("POST /api/code/debug/start", () => {
  it("returns a friendly unconfigured snapshot when no debugger is set", async () => {
    const res = await startPost(
      jsonRequest("/api/code/debug/start", { itemId: CODE_ITEM, source: SOURCE, breakpoints: [] })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result.status).toBe("unconfigured");
    expect(body.result.sessionId).toBeNull();
    expect(body.result.message).toMatch(/not configured/i);
  });

  it("echoes the submitted breakpoints in the unconfigured snapshot", async () => {
    const res = await startPost(
      jsonRequest("/api/code/debug/start", {
        itemId: CODE_ITEM,
        source: SOURCE,
        breakpoints: [{ id: "bp-2", line: 2, enabled: true }]
      })
    );
    const body = await res.json();
    expect(body.result.breakpoints).toEqual([{ id: "bp-2", line: 2, enabled: true }]);
  });

  it("rejects an item without a Code Lab", async () => {
    const res = await startPost(
      jsonRequest("/api/code/debug/start", { itemId: "cpp.not.real", source: SOURCE })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("not_code_capable");
  });

  it("rejects empty source", async () => {
    const res = await startPost(
      jsonRequest("/api/code/debug/start", { itemId: CODE_ITEM, source: "   " })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("empty_source");
  });

  it("rejects more than 20 breakpoints", async () => {
    const breakpoints = Array.from({ length: 21 }, (_, i) => ({ id: `bp-${i + 1}`, line: i + 1, enabled: true }));
    const res = await startPost(
      jsonRequest("/api/code/debug/start", { itemId: CODE_ITEM, source: SOURCE, breakpoints })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_breakpoints");
  });

  it("rejects a non-positive breakpoint line", async () => {
    const res = await startPost(
      jsonRequest("/api/code/debug/start", {
        itemId: CODE_ITEM,
        source: SOURCE,
        breakpoints: [{ id: "bp-0", line: 0, enabled: true }]
      })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_breakpoints");
  });

  it("never leaks a configured API key in the response", async () => {
    process.env.CODE_DEBUGGER_API_KEY = "super-secret-token";
    const res = await startPost(
      jsonRequest("/api/code/debug/start", { itemId: CODE_ITEM, source: SOURCE, breakpoints: [] })
    );
    expect(JSON.stringify(await res.json())).not.toContain("super-secret-token");
  });
});

describe("POST /api/code/debug/action", () => {
  it("rejects a missing session id", async () => {
    const res = await actionPost(jsonRequest("/api/code/debug/action", { action: "continue" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_session");
  });

  it("rejects an unknown action", async () => {
    const res = await actionPost(
      jsonRequest("/api/code/debug/action", { sessionId: "s1", action: "teleport" })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_action");
  });

  it("returns an unconfigured snapshot for a valid action when unset", async () => {
    const res = await actionPost(
      jsonRequest("/api/code/debug/action", { sessionId: "s1", action: "stepOver" })
    );
    expect(res.status).toBe(200);
    expect((await res.json()).result.status).toBe("unconfigured");
  });
});

describe("POST /api/code/debug/stop", () => {
  it("reports ok when nothing is running (unconfigured)", async () => {
    const res = await stopPost(jsonRequest("/api/code/debug/stop", { sessionId: "s1" }));
    expect(res.status).toBe(200);
    expect((await res.json()).result.ok).toBe(true);
  });

  it("rejects a missing session id", async () => {
    const res = await stopPost(jsonRequest("/api/code/debug/stop", {}));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_session");
  });
});

describe("GET /api/code/debug/health", () => {
  it("reports unconfigured when no provider is set", async () => {
    const res = await healthGet();
    expect(res.status).toBe(200);
    expect((await res.json()).result.status).toBe("unconfigured");
  });
});

describe("selectDebugger", () => {
  it("is unconfigured with no provider", () => {
    expect(selectDebugger().kind).toBe("unconfigured");
  });

  it("is unconfigured for gdb-service without a base url", () => {
    process.env.CODE_DEBUGGER_PROVIDER = "gdb-service";
    expect(selectDebugger().kind).toBe("unconfigured");
  });

  it("is ready when gdb-service has a base url", () => {
    process.env.CODE_DEBUGGER_PROVIDER = "gdb-service";
    process.env.CODE_DEBUGGER_BASE_URL = "http://debugger.example:3008";
    const selection = selectDebugger();
    expect(selection.kind).toBe("ready");
    if (selection.kind === "ready") expect(selection.adapter.name).toBe("gdb-service");
  });

  it("is unconfigured for an unknown provider", () => {
    process.env.CODE_DEBUGGER_PROVIDER = "totally-made-up";
    expect(selectDebugger().kind).toBe("unconfigured");
  });
});
