"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type {
  CodeBreakpoint,
  CodeDebugAction,
  CodeDebugExplainResult,
  CodeDebugSnapshot,
  CodeDebugStatus
} from "./code-debug-types";
import {
  debugActionRequest,
  explainDebugRequest,
  startDebugRequest,
  stopDebugRequest
} from "./code-debug-client";

/**
 * Debug-session orchestration for the Code Lab Debug tab (#442). Owns the current
 * snapshot, busy/error state, and the watch-expression list, and proxies
 * start/action/stop to the debug API. The editor gutter, toolbar, and panels are
 * presentational over this hook. The AI "explain current step" call lands with
 * that slice.
 *
 * Stale detection: the source captured when a session starts is compared to the
 * live source; once they diverge while a session is active, `isStale` is true and
 * only Stop/Restart should remain enabled (the running program no longer matches
 * the editor).
 */

export type DebugWatch = { id: string; expression: string };

export type UseCodeDebuggerArgs = {
  itemId: string;
  source: string;
  stdin: string;
  breakpoints: CodeBreakpoint[];
  /** Published version loaded; threaded to the explain call for stale checks (#611). */
  contentVersionId?: string;
  /** Active milestone for a multi-milestone user lab (#611). */
  milestoneIndex?: number;
};

export type UseCodeDebugger = {
  snapshot: CodeDebugSnapshot | null;
  busy: boolean;
  error: string | null;
  isStale: boolean;
  watches: DebugWatch[];
  addWatch: (expression: string) => void;
  removeWatch: (id: string) => void;
  updateWatch: (id: string, expression: string) => void;
  startDebugging: () => Promise<void>;
  sendAction: (action: CodeDebugAction) => Promise<void>;
  stopDebugging: () => Promise<void>;
  restartDebugging: () => Promise<void>;
  explanation: CodeDebugExplainResult | null;
  explaining: boolean;
  explainCurrentStep: (userQuestion?: string) => Promise<void>;
};

const ACTIVE_STATUSES: ReadonlySet<CodeDebugStatus> = new Set<CodeDebugStatus>([
  "starting",
  "running",
  "paused",
  "compile_error",
  "runtime_error",
  "timeout"
]);

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The debugger request failed.";
}

let watchCounter = 0;
function nextWatchId(): string {
  watchCounter += 1;
  return `watch-${watchCounter}`;
}

export function useCodeDebugger({
  itemId,
  source,
  stdin,
  breakpoints,
  contentVersionId,
  milestoneIndex
}: UseCodeDebuggerArgs): UseCodeDebugger {
  const [snapshot, setSnapshot] = useState<CodeDebugSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watches, setWatches] = useState<DebugWatch[]>([]);
  const [explanation, setExplanation] = useState<CodeDebugExplainResult | null>(null);
  const [explaining, setExplaining] = useState(false);
  // The source the active session was started against (null when no session).
  const sessionSourceRef = useRef<string | null>(null);

  const watchExpressions = useMemo(
    () => watches.map((w) => w.expression).filter((expr) => expr.trim().length > 0),
    [watches]
  );

  const isStale =
    snapshot !== null &&
    ACTIVE_STATUSES.has(snapshot.status) &&
    sessionSourceRef.current !== null &&
    sessionSourceRef.current !== source;

  const startDebugging = useCallback(async () => {
    setBusy(true);
    setError(null);
    setExplanation(null);
    try {
      const next = await startDebugRequest({
        itemId,
        source,
        stdin,
        breakpoints,
        watches: watchExpressions
      });
      setSnapshot(next);
      // Only an actually-running session is subject to staleness; an unconfigured
      // response is a terminal informational state.
      sessionSourceRef.current = next.sessionId ? source : null;
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }, [itemId, source, stdin, breakpoints, watchExpressions]);

  const sendAction = useCallback(
    async (action: CodeDebugAction) => {
      const sessionId = snapshot?.sessionId;
      if (!sessionId) return;
      setBusy(true);
      setError(null);
      try {
        const next = await debugActionRequest({ sessionId, action, watches: watchExpressions });
        setSnapshot(next);
      } catch (caught) {
        setError(errorMessage(caught));
      } finally {
        setBusy(false);
      }
    },
    [snapshot, watchExpressions]
  );

  const stopDebugging = useCallback(async () => {
    const sessionId = snapshot?.sessionId;
    setBusy(true);
    try {
      if (sessionId) await stopDebugRequest({ sessionId });
    } catch {
      // Best-effort: the UI resets regardless so the learner is never stuck.
    } finally {
      setSnapshot(null);
      sessionSourceRef.current = null;
      setExplanation(null);
      setBusy(false);
    }
  }, [snapshot]);

  const restartDebugging = useCallback(async () => {
    await startDebugging();
  }, [startDebugging]);

  const explainCurrentStep = useCallback(
    async (userQuestion?: string) => {
      if (!snapshot) return;
      setExplaining(true);
      try {
        const result = await explainDebugRequest({
          itemId,
          source,
          snapshot,
          userQuestion,
          contentVersionId,
          milestoneIndex
        });
        setExplanation(result);
      } catch (caught) {
        setExplanation({ status: "unavailable", explanation: errorMessage(caught) });
      } finally {
        setExplaining(false);
      }
    },
    [itemId, source, snapshot, contentVersionId, milestoneIndex]
  );

  const addWatch = useCallback((expression: string) => {
    const trimmed = expression.trim();
    if (!trimmed) return;
    setWatches((prev) =>
      prev.some((w) => w.expression === trimmed) ? prev : [...prev, { id: nextWatchId(), expression: trimmed }]
    );
  }, []);

  const removeWatch = useCallback((id: string) => {
    setWatches((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const updateWatch = useCallback((id: string, expression: string) => {
    setWatches((prev) => prev.map((w) => (w.id === id ? { ...w, expression } : w)));
  }, []);

  return {
    snapshot,
    busy,
    error,
    isStale,
    watches,
    addWatch,
    removeWatch,
    updateWatch,
    startDebugging,
    sendAction,
    stopDebugging,
    restartDebugging,
    explanation,
    explaining,
    explainCurrentStep
  };
}
