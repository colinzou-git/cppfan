"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CodeTerminalAttemptRequest,
  CodeTerminalEvent,
  CodeTerminalSnapshot,
  CodeTerminalStatus,
  TerminalAttemptSaveStatus
} from "./code-terminal-types";
import { isTerminalActive, isTerminalFinished } from "./code-terminal-types";
import {
  pollTerminalRequest,
  recordTerminalAttemptRequest,
  sendTerminalInput,
  startTerminalRequest,
  stopTerminalRequest
} from "./code-terminal-client";
import {
  clearPendingTerminalAttempt,
  loadPendingTerminalAttempt,
  savePendingTerminalAttempt
} from "./terminal-attempt-pending";

const POLL_MS = 250;
const ATTEMPT_RETRY_MS = [500, 1500, 4000] as const;

export type UseCodeTerminalArgs = {
  itemId: string;
  source: string;
  stdin: string;
  contentVersionId?: string;
  milestoneIndex?: number;
};

export type UseCodeTerminal = {
  status: CodeTerminalStatus;
  events: CodeTerminalEvent[];
  exitCode: number | null;
  durationMs: number | null;
  outputTruncated: boolean;
  message: string | null;
  isActive: boolean;
  isFinished: boolean;
  isStale: boolean;
  starting: boolean;
  sending: boolean;
  inputError: string | null;
  attemptSaveStatus: TerminalAttemptSaveStatus;
  attemptSaveError: string | null;
  clearInputError: () => void;
  start: () => Promise<void>;
  sendInput: (data: string) => Promise<boolean>;
  sendEof: () => Promise<boolean>;
  stop: () => Promise<void>;
  retryAttemptSave: () => Promise<void>;
};

export function useCodeTerminal({
  itemId,
  source,
  stdin,
  contentVersionId,
  milestoneIndex
}: UseCodeTerminalArgs): UseCodeTerminal {
  const [status, setStatus] = useState<CodeTerminalStatus>("idle");
  const [events, setEvents] = useState<CodeTerminalEvent[]>([]);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [outputTruncated, setOutputTruncated] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [attemptSaveStatus, setAttemptSaveStatus] = useState<TerminalAttemptSaveStatus>("idle");
  const [attemptSaveError, setAttemptSaveError] = useState<string | null>(null);

  const sessionRef = useRef<{
    id: string;
    token: string;
    terminalAttemptId?: string;
  } | null>(null);
  const cursorRef = useRef(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimersRef = useRef(new Set<ReturnType<typeof setTimeout>>());
  const activeRef = useRef(false);
  const eventsRef = useRef<CodeTerminalEvent[]>([]);
  const sessionSourceRef = useRef<string | null>(null);
  const pendingAttemptRef = useRef<CodeTerminalAttemptRequest | null>(null);
  const savingAttemptIdsRef = useRef(new Set<string>());
  const savedAttemptIdsRef = useRef(new Set<string>());
  const mountedRef = useRef(true);

  const stopPolling = useCallback(() => {
    activeRef.current = false;
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const showAttemptState = useCallback(
    (
      pending: CodeTerminalAttemptRequest,
      nextStatus: TerminalAttemptSaveStatus,
      error: string | null = null
    ) => {
      if (!mountedRef.current) return;
      if (pendingAttemptRef.current?.terminalAttemptId !== pending.terminalAttemptId) return;
      setAttemptSaveStatus(nextStatus);
      setAttemptSaveError(error);
    },
    []
  );

  const persistPendingAttempt = useCallback(
    async (pending: CodeTerminalAttemptRequest, retryIndex = 0, manual = false): Promise<void> => {
      if (
        savedAttemptIdsRef.current.has(pending.terminalAttemptId) ||
        savingAttemptIdsRef.current.has(pending.terminalAttemptId)
      ) {
        return;
      }
      savingAttemptIdsRef.current.add(pending.terminalAttemptId);
      showAttemptState(pending, retryIndex > 0 || manual ? "retrying" : "saving");

      let result:
        | Awaited<ReturnType<typeof recordTerminalAttemptRequest>>
        | { status: "retryable_error"; message: string };
      try {
        result = await recordTerminalAttemptRequest(pending);
      } catch {
        result = {
          status: "retryable_error",
          message: "Run history could not be saved yet."
        };
      } finally {
        savingAttemptIdsRef.current.delete(pending.terminalAttemptId);
      }

      if (result.status === "recorded" || result.status === "already_recorded") {
        savedAttemptIdsRef.current.add(pending.terminalAttemptId);
        clearPendingTerminalAttempt(pending.terminalAttemptId);
        if (pendingAttemptRef.current?.terminalAttemptId === pending.terminalAttemptId) {
          pendingAttemptRef.current = null;
          if (mountedRef.current) {
            setAttemptSaveStatus("saved");
            setAttemptSaveError(null);
          }
        }
        return;
      }

      if (result.status === "session_unavailable") {
        clearPendingTerminalAttempt(pending.terminalAttemptId);
        showAttemptState(
          pending,
          "error",
          "This finished run can no longer be recovered from the Terminal service."
        );
        return;
      }

      if (result.status === "signed_out" || result.status === "permanent_error") {
        showAttemptState(pending, "error", result.message);
        return;
      }

      if (retryIndex < ATTEMPT_RETRY_MS.length) {
        const timer = setTimeout(() => {
          retryTimersRef.current.delete(timer);
          void persistPendingAttempt(pending, retryIndex + 1);
        }, ATTEMPT_RETRY_MS[retryIndex]);
        retryTimersRef.current.add(timer);
        showAttemptState(pending, "retrying");
        return;
      }

      showAttemptState(
        pending,
        "error",
        result.message || "This run finished, but its history was not saved."
      );
    },
    [showAttemptState]
  );

  const queueFinalAttempt = useCallback(
    (session: NonNullable<typeof sessionRef.current>) => {
      if (!session.terminalAttemptId || !session.id || !session.token) return;
      if (savedAttemptIdsRef.current.has(session.terminalAttemptId)) return;
      if (pendingAttemptRef.current?.terminalAttemptId === session.terminalAttemptId) return;
      const pending: CodeTerminalAttemptRequest = {
        terminalAttemptId: session.terminalAttemptId,
        sessionId: session.id,
        sessionToken: session.token,
        itemId,
        source: sessionSourceRef.current ?? source,
        contentVersionId,
        milestoneIndex
      };
      pendingAttemptRef.current = pending;
      savePendingTerminalAttempt({ ...pending, createdAt: new Date().toISOString() });
      void persistPendingAttempt(pending);
    },
    [contentVersionId, itemId, milestoneIndex, persistPendingAttempt, source]
  );

  const applySnapshot = useCallback((snap: CodeTerminalSnapshot, replace: boolean) => {
    if (replace) {
      eventsRef.current = snap.events;
      setEvents(snap.events);
    } else if (snap.events.length > 0) {
      eventsRef.current = [...eventsRef.current, ...snap.events];
      setEvents(eventsRef.current);
    }
    if (typeof snap.nextSequence === "number" && snap.nextSequence >= cursorRef.current) {
      cursorRef.current = snap.nextSequence;
    }
    if (snap.terminalAttemptId && sessionRef.current) {
      sessionRef.current.terminalAttemptId = snap.terminalAttemptId;
    }
    setStatus(snap.status);
    setExitCode(snap.exitCode ?? null);
    setDurationMs(snap.durationMs ?? null);
    setOutputTruncated(Boolean(snap.outputTruncated));
    setMessage(snap.message ?? null);
  }, []);

  const pollOnce = useCallback(async () => {
    const session = sessionRef.current;
    if (!session || !activeRef.current) return;
    try {
      const snap = await pollTerminalRequest({
        sessionId: session.id,
        sessionToken: session.token,
        after: cursorRef.current
      });
      applySnapshot(snap, false);
      if (isTerminalFinished(snap.status)) {
        stopPolling();
        queueFinalAttempt(session);
        return;
      }
      if (snap.status === "unconfigured") {
        stopPolling();
        return;
      }
    } catch {
      // Transient poll failure: keep trying until server limits end the session.
    }
    if (activeRef.current) {
      pollTimer.current = setTimeout(() => void pollOnce(), POLL_MS);
    }
  }, [applySnapshot, queueFinalAttempt, stopPolling]);

  const start = useCallback(async () => {
    stopPolling();
    setStarting(true);
    setInputError(null);
    cursorRef.current = 0;
    eventsRef.current = [];
    setEvents([]);
    setExitCode(null);
    setDurationMs(null);
    setOutputTruncated(false);
    setMessage(null);
    setStatus("compiling");
    setAttemptSaveStatus("idle");
    setAttemptSaveError(null);
    pendingAttemptRef.current = null;
    sessionSourceRef.current = source;
    try {
      const snap = await startTerminalRequest({
        itemId,
        source,
        stdin,
        contentVersionId,
        milestoneIndex
      });
      sessionRef.current = snap.sessionId
        ? {
            id: snap.sessionId,
            token: snap.sessionToken ?? "",
            terminalAttemptId: snap.terminalAttemptId
          }
        : null;
      applySnapshot(snap, true);
      if (isTerminalActive(snap.status) && sessionRef.current) {
        activeRef.current = true;
        pollTimer.current = setTimeout(() => void pollOnce(), POLL_MS);
      } else if (isTerminalFinished(snap.status) && sessionRef.current) {
        queueFinalAttempt(sessionRef.current);
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "The terminal failed to start.");
    } finally {
      setStarting(false);
    }
  }, [
    applySnapshot,
    contentVersionId,
    itemId,
    milestoneIndex,
    pollOnce,
    queueFinalAttempt,
    source,
    stdin,
    stopPolling
  ]);

  const sendInput = useCallback(async (data: string): Promise<boolean> => {
    const session = sessionRef.current;
    if (!session) return false;
    setSending(true);
    setInputError(null);
    try {
      await sendTerminalInput({ sessionId: session.id, sessionToken: session.token, data });
      return true;
    } catch (error) {
      setInputError(error instanceof Error ? error.message : "Input could not be sent. Try again.");
      return false;
    } finally {
      setSending(false);
    }
  }, []);

  const sendEof = useCallback(async (): Promise<boolean> => {
    const session = sessionRef.current;
    if (!session) return false;
    setSending(true);
    setInputError(null);
    try {
      await sendTerminalInput({
        sessionId: session.id,
        sessionToken: session.token,
        eof: true
      });
      return true;
    } catch (error) {
      setInputError(error instanceof Error ? error.message : "Could not send EOF. Try again.");
      return false;
    } finally {
      setSending(false);
    }
  }, []);

  const stop = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;
    try {
      await stopTerminalRequest({ sessionId: session.id, sessionToken: session.token });
    } catch {
      // Best effort; poll/reaper resolves the final state.
    }
  }, []);

  const retryAttemptSave = useCallback(async () => {
    const pending = pendingAttemptRef.current;
    if (!pending || savedAttemptIdsRef.current.has(pending.terminalAttemptId)) return;
    await persistPendingAttempt(pending, 0, true);
  }, [persistPendingAttempt]);

  const clearInputError = useCallback(() => setInputError(null), []);

  useEffect(() => {
    mountedRef.current = true;
    const recovered = loadPendingTerminalAttempt(itemId, contentVersionId);
    if (recovered) {
      pendingAttemptRef.current = recovered;
      void persistPendingAttempt(recovered);
    }
    return () => {
      mountedRef.current = false;
      const wasActive = activeRef.current;
      stopPolling();
      for (const timer of retryTimersRef.current) clearTimeout(timer);
      retryTimersRef.current.clear();
      const session = sessionRef.current;
      if (session && wasActive) {
        void stopTerminalRequest({
          sessionId: session.id,
          sessionToken: session.token
        }).catch(() => undefined);
      }
    };
  }, [contentVersionId, itemId, persistPendingAttempt, stopPolling]);

  const isStale =
    isTerminalActive(status) &&
    sessionSourceRef.current !== null &&
    sessionSourceRef.current !== source;

  return {
    status,
    events,
    exitCode,
    durationMs,
    outputTruncated,
    message,
    isActive: isTerminalActive(status),
    isFinished: isTerminalFinished(status),
    isStale,
    starting,
    sending,
    inputError,
    attemptSaveStatus,
    attemptSaveError,
    clearInputError,
    start,
    sendInput,
    sendEof,
    stop,
    retryAttemptSave
  };
}
