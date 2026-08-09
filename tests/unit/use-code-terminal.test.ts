import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCodeTerminal } from "@/features/code-lab/use-code-terminal";
import type { CodeTerminalSnapshot } from "@/features/code-lab/code-terminal-types";

vi.mock("@/features/code-lab/code-terminal-client", () => ({
  startTerminalRequest: vi.fn(),
  pollTerminalRequest: vi.fn(),
  sendTerminalInput: vi.fn(),
  stopTerminalRequest: vi.fn(),
  recordTerminalAttemptRequest: vi.fn()
}));

import {
  pollTerminalRequest,
  recordTerminalAttemptRequest,
  sendTerminalInput,
  startTerminalRequest,
  stopTerminalRequest
} from "@/features/code-lab/code-terminal-client";

const startMock = vi.mocked(startTerminalRequest);
const pollMock = vi.mocked(pollTerminalRequest);
const inputMock = vi.mocked(sendTerminalInput);
const stopMock = vi.mocked(stopTerminalRequest);
const attemptMock = vi.mocked(recordTerminalAttemptRequest);

function snap(overrides: Partial<CodeTerminalSnapshot>): CodeTerminalSnapshot {
  return {
    sessionId: "s1",
    sessionToken: "tok-1",
    terminalAttemptId: "10000000-0000-4000-8000-000000000001",
    status: "running",
    events: [],
    nextSequence: 0,
    ...overrides
  };
}

const baseArgs = { itemId: "item-a", source: "int main(){}", stdin: "" };

beforeEach(() => {
  startMock.mockReset();
  pollMock.mockReset();
  inputMock.mockReset();
  stopMock.mockReset();
  attemptMock.mockReset();
  // Keep the poll loop quiet unless a test drives it.
  pollMock.mockResolvedValue(snap({ status: "running", events: [], nextSequence: 0 }));
  inputMock.mockResolvedValue({ ok: true });
  stopMock.mockResolvedValue({ ok: true });
  attemptMock.mockResolvedValue({
    status: "recorded",
    attemptId: "20000000-0000-4000-8000-000000000001"
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useCodeTerminal (#664)", () => {
  it("sends Input Args once at start and stores the running transcript", async () => {
    startMock.mockResolvedValue(
      snap({
        status: "running",
        events: [
          { sequence: 1, kind: "stdin", text: "5\n", createdAt: "t" },
          { sequence: 2, kind: "stdout", text: "n=", createdAt: "t" }
        ],
        nextSequence: 2
      })
    );
    const { result, unmount } = renderHook(() => useCodeTerminal({ ...baseArgs, stdin: "5\n" }));

    await act(async () => {
      await result.current.start();
    });

    expect(startMock).toHaveBeenCalledTimes(1);
    expect(startMock).toHaveBeenCalledWith(
      expect.objectContaining({ itemId: "item-a", stdin: "5\n" })
    );
    expect(result.current.status).toBe("running");
    expect(result.current.isActive).toBe(true);
    expect(result.current.events).toHaveLength(2);
    unmount();
  });

  it("sendInput posts the exact data and returns true on success", async () => {
    startMock.mockResolvedValue(snap({ status: "running", nextSequence: 0 }));
    const { result, unmount } = renderHook(() => useCodeTerminal(baseArgs));
    await act(async () => {
      await result.current.start();
    });

    let ok = false;
    await act(async () => {
      ok = await result.current.sendInput("hi there\n");
    });

    expect(ok).toBe(true);
    expect(inputMock).toHaveBeenCalledWith({
      sessionId: "s1",
      sessionToken: "tok-1",
      data: "hi there\n"
    });
    unmount();
  });

  it("allows an empty line to be sent", async () => {
    startMock.mockResolvedValue(snap({ status: "running", nextSequence: 0 }));
    const { result, unmount } = renderHook(() => useCodeTerminal(baseArgs));
    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await result.current.sendInput("\n");
    });
    expect(inputMock).toHaveBeenCalledWith({ sessionId: "s1", sessionToken: "tok-1", data: "\n" });
    unmount();
  });

  it("surfaces a retryable input error and returns false when delivery fails", async () => {
    startMock.mockResolvedValue(snap({ status: "running", nextSequence: 0 }));
    inputMock.mockRejectedValue(new Error("network down"));
    const { result, unmount } = renderHook(() => useCodeTerminal(baseArgs));
    await act(async () => {
      await result.current.start();
    });

    let ok = true;
    await act(async () => {
      ok = await result.current.sendInput("x\n");
    });

    expect(ok).toBe(false);
    expect(result.current.inputError).toBe("network down");
    unmount();
  });

  it("sendEof closes stdin without data", async () => {
    startMock.mockResolvedValue(snap({ status: "running", nextSequence: 0 }));
    const { result, unmount } = renderHook(() => useCodeTerminal(baseArgs));
    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await result.current.sendEof();
    });
    expect(inputMock).toHaveBeenCalledWith({ sessionId: "s1", sessionToken: "tok-1", eof: true });
    unmount();
  });

  it("marks the session stale when source changes during a run", async () => {
    startMock.mockResolvedValue(snap({ status: "running", nextSequence: 0 }));
    const { result, rerender, unmount } = renderHook((props) => useCodeTerminal(props), {
      initialProps: baseArgs
    });
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.isStale).toBe(false);

    rerender({ ...baseArgs, source: "int main(){return 1;}" });
    expect(result.current.isStale).toBe(true);
    unmount();
  });

  it("records exactly one attempt on an immediate compile error", async () => {
    startMock.mockResolvedValue(
      snap({
        sessionId: "s2",
        terminalAttemptId: "10000000-0000-4000-8000-000000000002",
        status: "compile_error",
        events: [{ sequence: 1, kind: "compiler", text: "error: expected ';'", createdAt: "t" }],
        nextSequence: 1
      })
    );
    const { result, unmount } = renderHook(() => useCodeTerminal(baseArgs));
    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe("compile_error");
    expect(attemptMock).toHaveBeenCalledTimes(1);
    expect(attemptMock).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: "item-a",
        terminalAttemptId: "10000000-0000-4000-8000-000000000002",
        sessionId: "s2",
        sessionToken: "tok-1",
        source: "int main(){}"
      })
    );
    expect(result.current.attemptSaveStatus).toBe("saved");
    unmount();
  });

  it("keeps the save unsaved through a transport failure, then retries after 500 ms", async () => {
    vi.useFakeTimers();
    try {
      startMock.mockResolvedValue(
        snap({
          sessionId: "s-retry",
          terminalAttemptId: "10000000-0000-4000-8000-000000000003",
          status: "compile_error"
        })
      );
      attemptMock.mockRejectedValueOnce(new Error("temporary")).mockResolvedValueOnce({
        status: "recorded",
        attemptId: "20000000-0000-4000-8000-000000000003"
      });
      const { result, unmount } = renderHook(() => useCodeTerminal(baseArgs));
      await act(async () => {
        await result.current.start();
        await Promise.resolve();
      });
      expect(attemptMock).toHaveBeenCalledTimes(1);
      expect(result.current.attemptSaveStatus).toBe("retrying");

      await act(async () => {
        await vi.advanceTimersByTimeAsync(499);
      });
      expect(attemptMock).toHaveBeenCalledTimes(1);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });
      expect(attemptMock).toHaveBeenCalledTimes(2);
      expect(result.current.attemptSaveStatus).toBe("saved");
      unmount();
    } finally {
      vi.useRealTimers();
    }
  });

  it("exposes manual retry after bounded failures and reuses the exact attempt id", async () => {
    vi.useFakeTimers();
    try {
      const terminalAttemptId = "10000000-0000-4000-8000-000000000004";
      startMock.mockResolvedValue(
        snap({
          sessionId: "s-manual",
          terminalAttemptId,
          status: "compile_error"
        })
      );
      attemptMock.mockResolvedValue({
        status: "retryable_error",
        message: "try later"
      });
      const { result, unmount } = renderHook(() => useCodeTerminal(baseArgs));
      await act(async () => {
        await result.current.start();
        await Promise.resolve();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500 + 1500 + 4000);
      });
      expect(attemptMock).toHaveBeenCalledTimes(4);
      expect(result.current.attemptSaveStatus).toBe("error");

      attemptMock.mockResolvedValueOnce({
        status: "already_recorded",
        attemptId: "row"
      });
      await act(async () => {
        await result.current.retryAttemptSave();
      });
      expect(attemptMock).toHaveBeenLastCalledWith(expect.objectContaining({ terminalAttemptId }));
      expect(result.current.attemptSaveStatus).toBe("saved");
      unmount();
    } finally {
      vi.useRealTimers();
    }
  });

  it("saves the source captured at start even if the editor changes", async () => {
    vi.useFakeTimers();
    try {
      startMock.mockResolvedValue(
        snap({
          sessionId: "s-source",
          terminalAttemptId: "10000000-0000-4000-8000-000000000005",
          status: "running"
        })
      );
      pollMock.mockResolvedValueOnce(
        snap({
          sessionId: "s-source",
          terminalAttemptId: undefined,
          status: "exited",
          exitCode: 0
        })
      );
      const { result, rerender, unmount } = renderHook((props) => useCodeTerminal(props), {
        initialProps: baseArgs
      });
      await act(async () => {
        await result.current.start();
      });
      rerender({ ...baseArgs, source: "int main(){return 99;}" });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(250);
      });
      expect(attemptMock).toHaveBeenCalledWith(expect.objectContaining({ source: "int main(){}" }));
      unmount();
    } finally {
      vi.useRealTimers();
    }
  });
});
