import type { CodeTerminalAttemptRequest } from "./code-terminal-types";

export type PendingTerminalAttempt = CodeTerminalAttemptRequest & {
  createdAt: string;
};

const PREFIX = "cppfan:terminal-attempt-pending:";
const MAX_AGE_MS = 10 * 60_000;

export function savePendingTerminalAttempt(value: PendingTerminalAttempt): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(`${PREFIX}${value.terminalAttemptId}`, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private/restricted browser contexts. The
    // in-memory retry still runs; persistence failure remains visible in the UI.
  }
}

export function loadPendingTerminalAttempt(
  itemId: string,
  contentVersionId?: string
): PendingTerminalAttempt | null {
  if (typeof window === "undefined") return null;
  const now = Date.now();
  let newest: PendingTerminalAttempt | null = null;
  try {
    for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = window.sessionStorage.key(index);
      if (!key?.startsWith(PREFIX)) continue;
      const raw = window.sessionStorage.getItem(key);
      if (!raw) continue;
      let value: PendingTerminalAttempt;
      try {
        value = JSON.parse(raw) as PendingTerminalAttempt;
      } catch {
        window.sessionStorage.removeItem(key);
        continue;
      }
      const createdAt = Date.parse(value.createdAt);
      if (!Number.isFinite(createdAt) || now - createdAt > MAX_AGE_MS) {
        window.sessionStorage.removeItem(key);
        continue;
      }
      if (
        value.itemId === itemId &&
        (value.contentVersionId ?? undefined) === (contentVersionId ?? undefined) &&
        (!newest || Date.parse(newest.createdAt) < createdAt)
      ) {
        newest = value;
      }
    }
  } catch {
    return null;
  }
  return newest;
}

export function clearPendingTerminalAttempt(terminalAttemptId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(`${PREFIX}${terminalAttemptId}`);
  } catch {
    // Best effort; the server-side idempotency key still prevents duplicates.
  }
}
