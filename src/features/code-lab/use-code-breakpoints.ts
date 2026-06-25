"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CodeBreakpoint, StoredCodeBreakpoint } from "./code-debug-types";

/**
 * Breakpoint persistence for the Code Lab debugger (#442). Breakpoints are saved
 * per Code Lab item in localStorage so they survive reloads, mirroring how code
 * drafts persist (see use-code-draft.ts). This slice is storage + pure list
 * operations only; the editor gutter, debug toolbar, and backend session are
 * wired in later slices.
 *
 * The list operations are exported as pure functions so they can be unit-tested
 * without a DOM, and reused by the editor gutter handler.
 */

/** localStorage key for an item's saved breakpoints. */
export function breakpointStorageKey(itemId: string): string {
  return `cppfan:code-debug-breakpoints:${itemId}`;
}

/** A positive integer is the only valid breakpoint line. */
export function isValidBreakpointLine(line: unknown): line is number {
  return typeof line === "number" && Number.isInteger(line) && line > 0;
}

/** Deterministic id keyed by line — breakpoints are unique per line. */
function breakpointId(line: number): string {
  return `bp-${line}`;
}

/** Drop invalid lines, de-duplicate by line (first wins), sort ascending. */
export function normalizeBreakpoints(list: CodeBreakpoint[]): CodeBreakpoint[] {
  const byLine = new Map<number, CodeBreakpoint>();
  for (const bp of list) {
    if (!isValidBreakpointLine(bp?.line)) continue;
    if (!byLine.has(bp.line)) byLine.set(bp.line, bp);
  }
  return [...byLine.values()].sort((a, b) => a.line - b.line);
}

export function findBreakpoint(list: CodeBreakpoint[], line: number): CodeBreakpoint | undefined {
  return list.find((bp) => bp.line === line);
}

/** Add a breakpoint at a line. No-op for invalid lines or an existing line. */
export function addBreakpointToList(list: CodeBreakpoint[], line: number): CodeBreakpoint[] {
  if (!isValidBreakpointLine(line) || findBreakpoint(list, line)) return list;
  return normalizeBreakpoints([...list, { id: breakpointId(line), line, enabled: true }]);
}

export function removeBreakpointFromList(list: CodeBreakpoint[], line: number): CodeBreakpoint[] {
  if (!findBreakpoint(list, line)) return list;
  return list.filter((bp) => bp.line !== line);
}

/** Toggle a line: remove it if present, otherwise add it. */
export function toggleBreakpointInList(list: CodeBreakpoint[], line: number): CodeBreakpoint[] {
  if (!isValidBreakpointLine(line)) return list;
  return findBreakpoint(list, line)
    ? removeBreakpointFromList(list, line)
    : addBreakpointToList(list, line);
}

export function updateBreakpointInList(
  list: CodeBreakpoint[],
  line: number,
  patch: Partial<Omit<CodeBreakpoint, "id" | "line">>
): CodeBreakpoint[] {
  if (!findBreakpoint(list, line)) return list;
  return list.map((bp) => (bp.line === line ? { ...bp, ...patch } : bp));
}

/** Parse persisted breakpoints, tolerating any malformed/legacy payload. */
export function parseStoredBreakpoints(raw: string | null): CodeBreakpoint[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return normalizeBreakpoints(
      parsed.map((entry) => ({
        id: typeof entry?.id === "string" ? entry.id : breakpointId(Number(entry?.line)),
        line: Number(entry?.line),
        enabled: entry?.enabled !== false
      }))
    );
  } catch {
    return [];
  }
}

export function serializeBreakpoints(list: CodeBreakpoint[]): string {
  const stored: StoredCodeBreakpoint[] = list.map(({ id, line, enabled }) => ({ id, line, enabled }));
  return JSON.stringify(stored);
}

function readStoredBreakpoints(itemId: string): CodeBreakpoint[] {
  try {
    return parseStoredBreakpoints(window.localStorage.getItem(breakpointStorageKey(itemId)));
  } catch {
    return [];
  }
}

function writeStoredBreakpoints(itemId: string, list: CodeBreakpoint[]): void {
  try {
    window.localStorage.setItem(breakpointStorageKey(itemId), serializeBreakpoints(list));
  } catch {
    // Best-effort: private mode / quota. Breakpoints are an ephemeral convenience.
  }
}

export type UseCodeBreakpoints = {
  breakpoints: CodeBreakpoint[];
  addBreakpoint: (line: number) => void;
  toggleBreakpoint: (line: number) => void;
  removeBreakpoint: (line: number) => void;
  updateBreakpoint: (line: number, patch: Partial<Omit<CodeBreakpoint, "id" | "line">>) => void;
  setBreakpoints: (list: CodeBreakpoint[]) => void;
};

export function useCodeBreakpoints(itemId: string): UseCodeBreakpoints {
  // Start empty (localStorage is unavailable during SSR) and hydrate on the
  // client, matching use-code-draft.
  const [breakpoints, setBreakpointsState] = useState<CodeBreakpoint[]>([]);
  const itemIdRef = useRef(itemId);
  itemIdRef.current = itemId;

  useEffect(() => {
    setBreakpointsState(readStoredBreakpoints(itemId));
  }, [itemId]);

  // Persist in the mutation path (not a separate effect) so switching items never
  // writes the previous item's breakpoints under the new item's key.
  const commit = useCallback((next: CodeBreakpoint[]) => {
    setBreakpointsState(next);
    writeStoredBreakpoints(itemIdRef.current, next);
  }, []);

  const addBreakpoint = useCallback(
    (line: number) => commit(addBreakpointToList(breakpoints, line)),
    [breakpoints, commit]
  );
  const toggleBreakpoint = useCallback(
    (line: number) => commit(toggleBreakpointInList(breakpoints, line)),
    [breakpoints, commit]
  );
  const removeBreakpoint = useCallback(
    (line: number) => commit(removeBreakpointFromList(breakpoints, line)),
    [breakpoints, commit]
  );
  const updateBreakpoint = useCallback(
    (line: number, patch: Partial<Omit<CodeBreakpoint, "id" | "line">>) =>
      commit(updateBreakpointInList(breakpoints, line, patch)),
    [breakpoints, commit]
  );
  const setBreakpoints = useCallback(
    (list: CodeBreakpoint[]) => commit(normalizeBreakpoints(list)),
    [commit]
  );

  return {
    breakpoints,
    addBreakpoint,
    toggleBreakpoint,
    removeBreakpoint,
    updateBreakpoint,
    setBreakpoints
  };
}
