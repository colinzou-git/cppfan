/**
 * Shared types for the Code Lab real debugger (#442).
 *
 * This slice (Part of #442) covers only breakpoint state — the persistence hook
 * and editor gutter wiring depend on it. The debug-session contract (snapshot,
 * start/action/stop requests, explain) is added with the debug client/route
 * slices so each type lands next to the code that uses it.
 */

export type CodeBreakpointStatus = "pending" | "verified" | "invalid" | "disabled";

export type CodeBreakpoint = {
  id: string;
  line: number;
  enabled: boolean;
  status?: CodeBreakpointStatus;
  /** GDB breakpoint number, once the backend verifies it. */
  gdbNumber?: string;
  message?: string;
};

/** Minimal shape persisted to localStorage per Code Lab item. */
export type StoredCodeBreakpoint = {
  id: string;
  line: number;
  enabled: boolean;
};
