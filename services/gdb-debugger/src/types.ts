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

/**
 * Interactive Terminal wire types (#664). A terminal session compiles the
 * learner source, spawns the binary with piped stdin/stdout/stderr, and streams
 * an ordered transcript the browser retrieves by cursor. Distinct from the
 * one-shot Judge0 runner and from the GDB debug session above.
 */
import type { TerminalEvent } from "./terminal-event-buffer.js";

export type TerminalStatus =
  | "idle"
  | "compiling"
  | "running"
  | "exited"
  | "stopped"
  | "compile_error"
  | "runtime_error"
  | "timeout"
  | "error";

export type TerminalSnapshot = {
  sessionId: string | null;
  /** Unguessable per-session capability required for poll/input/stop (#664). */
  sessionToken?: string;
  status: TerminalStatus;
  events: TerminalEvent[];
  /** Cursor the client sends on its next poll (highest sequence emitted). */
  nextSequence: number;
  exitCode?: number | null;
  durationMs?: number | null;
  outputTruncated?: boolean;
  message?: string;
};

export type TerminalStartBody = { itemId?: string; source?: string; stdin?: string };
export type TerminalPollBody = { sessionId?: string; sessionToken?: string; after?: number };
export type TerminalInputBody = {
  sessionId?: string;
  sessionToken?: string;
  data?: string;
  /** Close stdin without killing the process, so read-until-EOF loops can finish. */
  eof?: boolean;
};
export type TerminalStopBody = { sessionId?: string; sessionToken?: string };
