"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CodeTerminalEvent, CodeTerminalSnapshot, CodeTerminalStatus } from "./code-terminal-types";
import { isTerminalActive, isTerminalFinished } from "./code-terminal-types";
import {
  pollTerminalRequest,
  recordTerminalAttemptRequest,
  sendTerminalInput,
  startTerminalRequest,
  stopTerminalRequest
} from "./code-terminal-client";

/**
 * Interactive Terminal session orchestration for the Code Lab (#664). Owns the
 * transcript, status, cursor, and the short polling loop, and exposes
 * start/input/EOF/stop. Composed alongside useCodeLabController (which stays
 * authoritative for source, Input Args, tests, AI, and attempts) rather than
 * folded into it, so the interactive path is isolated.
 *
 * The server reaper is authoritative for teardown; the unmount/pagehide cleanup
 * here is best-effort only.
 */

const POLL_MS = 250;

export type UseCodeTerminalArgs = {
  itemId: string;
  source: string;
  /** Input Args: initial stdin, written once at launch; stdin stays open after. */
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
  clearInputError: () => void;
  start: () => Promise<void>;
  sendInput: (data: string) => Promise<boolean>;
  sendEof: () => Promise<boolean>;
  stop: () => Promise<void>;
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

  const sessionRef = useRef<{ id: string; token: string } | null>(null);
  const cursorRef = useRef(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);
  const attemptRecordedRef = useRef(false);
  const eventsRef = useRef<CodeTerminalEvent[]>([]);
  // Source captured when the active session started (null when no session), so an
  // edit during a run can mark the running program as an older version.
  const sessionSourceRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    activeRef.current = false;
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const joinKind = useCallback((kind: CodeTerminalEvent["kind"]): string => {
    return eventsRef.current
      .filter((event) => event.kind === kind)
      .map((event) => event.text)
      .join("");
  }, []);

  const recordFinalAttempt = useCallback(
    (finalStatus: CodeTerminalStatus, finalExit: number | null) => {
      if (attemptRecordedRef.current) return;
      attemptRecordedRef.current = true;
      void recordTerminalAttemptRequest({
        itemId,
        source: sessionSourceRef.current ?? source,
        status: finalStatus,
        exitCode: finalExit,
        compileOutput: joinKind("compiler"),
        stdout: joinKind("stdout"),
        stderr: joinKind("stderr"),
        contentVersionId,
        milestoneIndex
      }).catch(() => undefined);
    },
    [itemId, source, contentVersionId, milestoneIndex, joinKind]
  );

  const applySnapshot = useCallback(
    (snap: CodeTerminalSnapshot, replace: boolean) => {
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
      setStatus(snap.status);
      setExitCode(snap.exitCode ?? null);
      setDurationMs(snap.durationMs ?? null);
      setOutputTruncated(Boolean(snap.outputTruncated));
      setMessage(snap.message ?? null);
    },
    []
  );

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
        recordFinalAttempt(snap.status, snap.exitCode ?? null);
        return;
      }
      if (snap.status === "unconfigured") {
        stopPolling();
        return;
      }
    } catch {
      // Transient poll failure: keep trying until wall/idle caps end the session.
    }
    if (activeRef.current) {
      pollTimer.current = setTimeout(() => void pollOnce(), POLL_MS);
    }
  }, [applySnapshot, recordFinalAttempt, stopPolling]);

  const start = useCallback(async () => {
    stopPolling();
    setStarting(true);
    setInputError(null);
    attemptRecordedRef.current = false;
    cursorRef.current = 0;
    eventsRef.current = [];
    setEvents([]);
    setExitCode(null);
    setDurationMs(null);
    setOutputTruncated(false);
    setMessage(null);
    setStatus("compiling");
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
        ? { id: snap.sessionId, token: snap.sessionToken ?? "" }
        : null;
      applySnapshot(snap, true);
      if (isTerminalActive(snap.status) && sessionRef.current) {
        activeRef.current = true;
        pollTimer.current = setTimeout(() => void pollOnce(), POLL_MS);
      } else if (isTerminalFinished(snap.status)) {
        // e.g. an immediate compile error — record the single attempt now.
        recordFinalAttempt(snap.status, snap.exitCode ?? null);
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "The terminal failed to start.");
    } finally {
      setStarting(false);
    }
  }, [
    itemId,
    source,
    stdin,
    contentVersionId,
    milestoneIndex,
    applySnapshot,
    pollOnce,
    recordFinalAttempt,
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
      await sendTerminalInput({ sessionId: session.id, sessionToken: session.token, eof: true });
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
      // Best-effort — the poll loop and the server reaper resolve the final state.
    }
    // Keep polling briefly so the "stopped" transition (and its attempt) lands;
    // if polling already ended, fall back to a direct finalize.
    if (!activeRef.current) {
      stopPolling();
      recordFinalAttempt("stopped", null);
      setStatus("stopped");
    }
  }, [recordFinalAttempt, stopPolling]);

  const clearInputError = useCallback(() => setInputError(null), []);

  // Best-effort teardown when the component unmounts. The server reaper remains
  // authoritative, so a missed beacon still gets cleaned up.
  useEffect(() => {
    return () => {
      stopPolling();
      const session = sessionRef.current;
      if (session && !attemptRecordedRef.current) {
        void stopTerminalRequest({ sessionId: session.id, sessionToken: session.token }).catch(
          () => undefined
        );
      }
    };
  }, [stopPolling]);

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
    clearInputError,
    start,
    sendInput,
    sendEof,
    stop
  };
}
