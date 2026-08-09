import { afterEach, describe, expect, it } from "vitest";
import {
  MockTerminalAdapter,
  unconfiguredTerminalSnapshot
} from "@/features/code-lab/code-terminal-adapter";
import { isTerminalActive, isTerminalFinished } from "@/features/code-lab/code-terminal-types";
import { selectTerminalProvider } from "@/features/code-lab/code-terminal-service";

describe("terminal status reducers (#664)", () => {
  it("classifies active vs finished states", () => {
    expect(isTerminalActive("compiling")).toBe(true);
    expect(isTerminalActive("running")).toBe(true);
    expect(isTerminalActive("exited")).toBe(false);
    expect(isTerminalFinished("exited")).toBe(true);
    expect(isTerminalFinished("stopped")).toBe(true);
    expect(isTerminalFinished("stale_definition")).toBe(true);
    expect(isTerminalFinished("item_unavailable")).toBe(true);
    expect(isTerminalFinished("invalid_contract")).toBe(true);
    expect(isTerminalFinished("running")).toBe(false);
    expect(isTerminalFinished("unconfigured")).toBe(false);
  });
});

describe("unconfiguredTerminalSnapshot (#664)", () => {
  it("is a successful, non-crashing snapshot with no session", () => {
    const snap = unconfiguredTerminalSnapshot();
    expect(snap.status).toBe("unconfigured");
    expect(snap.sessionId).toBeNull();
    expect(snap.events).toEqual([]);
  });
});

describe("MockTerminalAdapter (#664)", () => {
  it("starts running, echoes Input Args once, and cursors events", async () => {
    const mock = new MockTerminalAdapter();
    const start = await mock.start({
      source: "int main(){}",
      stdin: "hi\n",
      files: [],
      compilerFlags: ["-std=c++20"]
    });
    expect(start.status).toBe("running");
    expect(start.sessionId).toBeTruthy();
    expect(start.sessionToken).toBeTruthy();
    expect(start.provider).toBe("mock");
    expect(start.events.filter((e) => e.kind === "stdin").map((e) => e.text)).toEqual(["hi\n"]);

    const poll = await mock.poll({
      sessionId: start.sessionId!,
      sessionToken: start.sessionToken!,
      after: start.nextSequence
    });
    // No new events yet, so the delta is empty.
    expect(poll.events).toEqual([]);
  });

  it("echoes live input once and simulates a response", async () => {
    const mock = new MockTerminalAdapter();
    const start = await mock.start({
      source: "x",
      stdin: "",
      files: [],
      compilerFlags: ["-std=c++20"]
    });
    const creds = { sessionId: start.sessionId!, sessionToken: start.sessionToken! };
    const ack = await mock.input({ ...creds, data: "42\n" });
    expect(ack.ok).toBe(true);

    const poll = await mock.poll({ ...creds, after: start.nextSequence });
    const stdin = poll.events.filter((e) => e.kind === "stdin").map((e) => e.text);
    expect(stdin).toEqual(["42\n"]);
    expect(poll.events.some((e) => e.kind === "stdout" && e.text.includes("42"))).toBe(true);
  });

  it("exits on EOF and stops on Stop", async () => {
    const mock = new MockTerminalAdapter();
    const a = await mock.start({
      source: "x",
      stdin: "",
      files: [],
      compilerFlags: ["-std=c++20"]
    });
    await mock.input({ sessionId: a.sessionId!, sessionToken: a.sessionToken!, eof: true });
    const afterEof = await mock.poll({
      sessionId: a.sessionId!,
      sessionToken: a.sessionToken!,
      after: 0
    });
    expect(afterEof.status).toBe("exited");

    const b = await mock.start({
      source: "x",
      stdin: "",
      files: [],
      compilerFlags: ["-std=c++20"]
    });
    await mock.stop({ sessionId: b.sessionId!, sessionToken: b.sessionToken! });
    const afterStop = await mock.poll({
      sessionId: b.sessionId!,
      sessionToken: b.sessionToken!,
      after: 0
    });
    expect(afterStop.status).toBe("stopped");
  });

  it("denies a foreign session token", async () => {
    const mock = new MockTerminalAdapter();
    const a = await mock.start({
      source: "x",
      stdin: "",
      files: [],
      compilerFlags: ["-std=c++20"]
    });
    const ack = await mock.input({
      sessionId: a.sessionId!,
      sessionToken: "wrong-token",
      data: "x\n"
    });
    expect(ack.ok).toBe(false);
  });
});

describe("real Terminal provider requirement (#667)", () => {
  const original = {
    provider: process.env.CODE_TERMINAL_PROVIDER,
    baseUrl: process.env.CODE_TERMINAL_BASE_URL,
    apiKey: process.env.CODE_TERMINAL_API_KEY,
    requireReal: process.env.CPPFAN_REQUIRE_REAL_CODE_TERMINAL,
    vercelEnv: process.env.VERCEL_ENV
  };

  afterEach(() => {
    for (const [key, value] of [
      ["CODE_TERMINAL_PROVIDER", original.provider],
      ["CODE_TERMINAL_BASE_URL", original.baseUrl],
      ["CODE_TERMINAL_API_KEY", original.apiKey],
      ["CPPFAN_REQUIRE_REAL_CODE_TERMINAL", original.requireReal],
      ["VERCEL_ENV", original.vercelEnv]
    ] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it.each([undefined, "mock"])(
    "refuses provider %s when a real service is required",
    (provider) => {
      process.env.CPPFAN_REQUIRE_REAL_CODE_TERMINAL = "true";
      if (provider) process.env.CODE_TERMINAL_PROVIDER = provider;
      else delete process.env.CODE_TERMINAL_PROVIDER;
      expect(selectTerminalProvider()).toMatchObject({ kind: "unconfigured" });
    }
  );

  it("accepts a complete execution-service configuration", () => {
    process.env.CPPFAN_REQUIRE_REAL_CODE_TERMINAL = "true";
    process.env.CODE_TERMINAL_PROVIDER = "execution-service";
    process.env.CODE_TERMINAL_BASE_URL = "http://127.0.0.1:23581";
    process.env.CODE_TERMINAL_API_KEY = "test-only";
    const selection = selectTerminalProvider();
    expect(selection.kind).toBe("ready");
    expect(selection.kind === "ready" && selection.adapter.name).toBe(
      "execution-service"
    );
  });

  it("keeps normal local unset configuration on the deterministic mock", () => {
    delete process.env.CPPFAN_REQUIRE_REAL_CODE_TERMINAL;
    delete process.env.CODE_TERMINAL_PROVIDER;
    delete process.env.VERCEL_ENV;
    const selection = selectTerminalProvider();
    expect(selection.kind === "ready" && selection.adapter.name).toBe("mock");
  });
});
