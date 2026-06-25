/**
 * Wire types for the GDB debugger service (#442). These mirror the snapshot the
 * Code Lab renders (CodeDebugSnapshot in the Next app) so the route adapter can
 * pass them through unchanged.
 */

export type DebugStatus =
  | "running"
  | "paused"
  | "exited"
  | "compile_error"
  | "runtime_error"
  | "timeout"
  | "error";

export type DebugFrame = { id: string; name: string; file?: string; line?: number | null };
export type DebugVariable = { name: string; value: string; type?: string };
export type DebugWatchResult = {
  id: string;
  expression: string;
  value?: string;
  status: "ok" | "error" | "unavailable";
  message?: string;
};

export type DebugSnapshot = {
  sessionId: string | null;
  status: DebugStatus;
  reason?: string;
  file: "main.cpp";
  line: number | null;
  stdout: string;
  stderr: string;
  compileOutput: string;
  exitCode?: number | null;
  stack: DebugFrame[];
  variables: DebugVariable[];
  watches: DebugWatchResult[];
  breakpoints: { id: string; line: number; enabled: boolean; status?: string }[];
  message?: string;
};

export type StartBody = {
  itemId?: string;
  source?: string;
  stdin?: string;
  breakpoints?: { id?: string; line?: number; enabled?: boolean }[];
  watches?: string[];
};

export type ActionBody = {
  sessionId?: string;
  action?: "continue" | "pause" | "stepOver" | "stepInto" | "stepOut" | "restart";
  watches?: string[];
};

export type StopBody = { sessionId?: string };
