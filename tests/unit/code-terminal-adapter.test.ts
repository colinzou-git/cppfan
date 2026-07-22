import { describe, expect, it } from "vitest";
import {
  MockTerminalAdapter,
  unconfiguredTerminalSnapshot
} from "@/features/code-lab/code-terminal-adapter";
import { isTerminalActive, isTerminalFinished } from "@/features/code-lab/code-terminal-types";

describe("terminal status reducers (#664)", () => {
  it("classifies active vs finished states", () => {
    expect(isTerminalActive("compiling")).toBe(true);
    expect(isTerminalActive("running")).toBe(true);
    expect(isTerminalActive("exited")).toBe(false);
    expect(isTerminalFinished("exited")).toBe(true);
    expect(isTerminalFinished("stopped")).toBe(true);
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
    const start = await mock.start({ itemId: "item", source: "int main(){}", stdin: "hi\n" });
    expect(start.status).toBe("running");
    expect(start.sessionId).toBeTruthy();
    expect(start.sessionToken).toBeTruthy();
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
    const start = await mock.start({ itemId: "item", source: "x", stdin: "" });
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
    const a = await mock.start({ itemId: "i", source: "x", stdin: "" });
    await mock.input({ sessionId: a.sessionId!, sessionToken: a.sessionToken!, eof: true });
    const afterEof = await mock.poll({ sessionId: a.sessionId!, sessionToken: a.sessionToken!, after: 0 });
    expect(afterEof.status).toBe("exited");

    const b = await mock.start({ itemId: "i", source: "x", stdin: "" });
    await mock.stop({ sessionId: b.sessionId!, sessionToken: b.sessionToken! });
    const afterStop = await mock.poll({ sessionId: b.sessionId!, sessionToken: b.sessionToken!, after: 0 });
    expect(afterStop.status).toBe("stopped");
  });

  it("denies a foreign session token", async () => {
    const mock = new MockTerminalAdapter();
    const a = await mock.start({ itemId: "i", source: "x", stdin: "" });
    const ack = await mock.input({ sessionId: a.sessionId!, sessionToken: "wrong-token", data: "x\n" });
    expect(ack.ok).toBe(false);
  });
});
