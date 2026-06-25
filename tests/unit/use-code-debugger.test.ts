import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCodeDebugger } from "@/features/code-lab/use-code-debugger";
import type { CodeDebugSnapshot } from "@/features/code-lab/code-debug-types";

vi.mock("@/features/code-lab/code-debug-client", () => ({
  startDebugRequest: vi.fn(),
  debugActionRequest: vi.fn(),
  stopDebugRequest: vi.fn()
}));

import {
  debugActionRequest,
  startDebugRequest,
  stopDebugRequest
} from "@/features/code-lab/code-debug-client";

const startMock = vi.mocked(startDebugRequest);
const actionMock = vi.mocked(debugActionRequest);
const stopMock = vi.mocked(stopDebugRequest);

function snap(overrides: Partial<CodeDebugSnapshot>): CodeDebugSnapshot {
  return {
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
    breakpoints: [],
    ...overrides
  };
}

const baseArgs = { itemId: "item-a", source: "int main(){}", stdin: "", breakpoints: [] };

beforeEach(() => {
  startMock.mockReset();
  actionMock.mockReset();
  stopMock.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useCodeDebugger (#442)", () => {
  it("starts a session and stores the snapshot", async () => {
    startMock.mockResolvedValue(snap({ sessionId: "s1", status: "paused", line: 1 }));
    const { result } = renderHook(() => useCodeDebugger(baseArgs));

    await act(async () => {
      await result.current.startDebugging();
    });

    expect(startMock).toHaveBeenCalledWith(expect.objectContaining({ itemId: "item-a" }));
    expect(result.current.snapshot?.sessionId).toBe("s1");
    expect(result.current.busy).toBe(false);
  });

  it("an unconfigured session is never stale, even if the source changes", async () => {
    startMock.mockResolvedValue(snap({ sessionId: null, status: "unconfigured" }));
    const { result, rerender } = renderHook((props) => useCodeDebugger(props), {
      initialProps: baseArgs
    });

    await act(async () => {
      await result.current.startDebugging();
    });
    rerender({ ...baseArgs, source: "int main(){return 1;}" });

    expect(result.current.isStale).toBe(false);
  });

  it("becomes stale when the source changes after an active session starts", async () => {
    startMock.mockResolvedValue(snap({ sessionId: "s1", status: "paused" }));
    const { result, rerender } = renderHook((props) => useCodeDebugger(props), {
      initialProps: baseArgs
    });

    await act(async () => {
      await result.current.startDebugging();
    });
    expect(result.current.isStale).toBe(false);

    rerender({ ...baseArgs, source: "int main(){return 1;}" });
    expect(result.current.isStale).toBe(true);
  });

  it("sendAction is a no-op without a live session id", async () => {
    const { result } = renderHook(() => useCodeDebugger(baseArgs));
    await act(async () => {
      await result.current.sendAction("continue");
    });
    expect(actionMock).not.toHaveBeenCalled();
  });

  it("sendAction proxies to the action endpoint with the session id", async () => {
    startMock.mockResolvedValue(snap({ sessionId: "s1", status: "paused" }));
    actionMock.mockResolvedValue(snap({ sessionId: "s1", status: "paused", line: 5 }));
    const { result } = renderHook(() => useCodeDebugger(baseArgs));

    await act(async () => {
      await result.current.startDebugging();
    });
    await act(async () => {
      await result.current.sendAction("stepOver");
    });

    expect(actionMock).toHaveBeenCalledWith(expect.objectContaining({ sessionId: "s1", action: "stepOver" }));
    expect(result.current.snapshot?.line).toBe(5);
  });

  it("stopDebugging clears the snapshot and calls stop for a live session", async () => {
    startMock.mockResolvedValue(snap({ sessionId: "s1", status: "paused" }));
    stopMock.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useCodeDebugger(baseArgs));

    await act(async () => {
      await result.current.startDebugging();
    });
    await act(async () => {
      await result.current.stopDebugging();
    });

    expect(stopMock).toHaveBeenCalledWith({ sessionId: "s1" });
    expect(result.current.snapshot).toBeNull();
  });

  it("captures an error message when start rejects", async () => {
    startMock.mockRejectedValue(new Error("debugger down"));
    const { result } = renderHook(() => useCodeDebugger(baseArgs));

    await act(async () => {
      await result.current.startDebugging();
    });

    expect(result.current.error).toBe("debugger down");
    expect(result.current.busy).toBe(false);
  });

  it("manages watch expressions (add, dedupe, empty-ignore, remove, update)", async () => {
    startMock.mockResolvedValue(snap({ sessionId: "s1", status: "paused" }));
    const { result } = renderHook(() => useCodeDebugger(baseArgs));

    act(() => result.current.addWatch("i + 1"));
    act(() => result.current.addWatch("i + 1"));
    act(() => result.current.addWatch("   "));
    expect(result.current.watches).toHaveLength(1);

    await act(async () => {
      await result.current.startDebugging();
    });
    expect(startMock).toHaveBeenCalledWith(expect.objectContaining({ watches: ["i + 1"] }));

    const id = result.current.watches[0].id;
    act(() => result.current.updateWatch(id, "i + 2"));
    expect(result.current.watches[0].expression).toBe("i + 2");
    act(() => result.current.removeWatch(id));
    expect(result.current.watches).toHaveLength(0);
  });
});
