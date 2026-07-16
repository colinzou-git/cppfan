/**
 * Shared types for the Code Lab real debugger (#442). Breakpoint state plus the
 * debug-session transport contract (snapshot, start/action/stop requests, health)
 * shared by the browser client, the Next.js debug routes, and the GDB service.
 * The AI "explain current step" types land with that slice.
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

export type CodeDebugVariable = {
  name: string;
  value: string;
  type?: string;
  changed?: boolean;
  /** Child elements for array/vector-like values (#470), rendered expandably. */
  children?: CodeDebugVariable[];
};

export type CodeDebugWatch = {
  id: string;
  expression: string;
  value?: string;
  status: "ok" | "error" | "unavailable";
  message?: string;
};

export type CodeDebugFrame = {
  id: string;
  name: string;
  file?: string;
  line?: number | null;
};

export type CodeDebugStatus =
  | "idle"
  | "unconfigured"
  | "starting"
  | "running"
  | "paused"
  | "exited"
  | "compile_error"
  | "runtime_error"
  | "timeout"
  | "stale"
  | "error";

/** The single source of truth the UI renders for a debug session at any moment. */
export type CodeDebugSnapshot = {
  sessionId: string | null;
  status: CodeDebugStatus;
  reason?: string;
  file: "main.cpp";
  line: number | null;
  stdout: string;
  stderr: string;
  compileOutput: string;
  exitCode?: number | null;
  stack: CodeDebugFrame[];
  variables: CodeDebugVariable[];
  watches: CodeDebugWatch[];
  breakpoints: CodeBreakpoint[];
  message?: string;
};

export type CodeDebugStartRequest = {
  itemId: string;
  source: string;
  stdin?: string;
  breakpoints: CodeBreakpoint[];
  watches?: string[];
};

export type CodeDebugAction = "continue" | "pause" | "stepOver" | "stepInto" | "stepOut" | "restart";

export type CodeDebugActionRequest = {
  sessionId: string;
  action: CodeDebugAction;
  watches?: string[];
};

export type CodeDebugStopRequest = {
  sessionId: string;
};

export type CodeDebuggerHealth = {
  status: "ok" | "unconfigured" | "error";
  provider?: string;
  message?: string;
};

export type CodeDebugExplainRequest = {
  itemId: string;
  source: string;
  snapshot: CodeDebugSnapshot;
  userQuestion?: string;
  /** Published version the client loaded; a mismatch refuses the explain as stale (#611). */
  contentVersionId?: string;
  /** Active milestone for a multi-milestone user lab (#611). */
  milestoneIndex?: number;
};

export type CodeDebugExplainResult = {
  status: "ok" | "unavailable";
  explanation: string;
  relatedSkills?: string[];
  /**
   * True when the loaded user-content version changed under the learner, so the
   * explanation was refused rather than run against a new definition (#611).
   */
  staleDefinition?: boolean;
};
