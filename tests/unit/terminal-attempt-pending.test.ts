import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPendingTerminalAttempt,
  loadPendingTerminalAttempt,
  savePendingTerminalAttempt
} from "@/features/code-lab/terminal-attempt-pending";

const attempt = {
  terminalAttemptId: "10000000-0000-4000-8000-000000000001",
  sessionId: "session",
  sessionToken: "token",
  itemId: "item",
  source: "source",
  contentVersionId: "version",
  createdAt: "2026-07-23T10:00:00.000Z"
};

beforeEach(() => {
  window.sessionStorage.clear();
  vi.useRealTimers();
});

describe("pending Terminal attempt recovery (#668)", () => {
  it("loads a matching item/version and clears by attempt id", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-23T10:01:00.000Z"));
    savePendingTerminalAttempt(attempt);
    expect(loadPendingTerminalAttempt("item", "version")).toMatchObject(attempt);
    expect(loadPendingTerminalAttempt("item", "other")).toBeNull();
    clearPendingTerminalAttempt(attempt.terminalAttemptId);
    expect(loadPendingTerminalAttempt("item", "version")).toBeNull();
  });

  it("removes records older than ten minutes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-23T10:11:00.001Z"));
    savePendingTerminalAttempt(attempt);
    expect(loadPendingTerminalAttempt("item", "version")).toBeNull();
    expect(window.sessionStorage.length).toBe(0);
  });
});
