import type {
  CodeBreakpoint,
  CodeDebugActionRequest,
  CodeDebugSnapshot,
  CodeDebugStartRequest,
  CodeDebugStopRequest,
  CodeDebuggerHealth
} from "./code-debug-types";

/**
 * A debugger backend (#442). The only implementation today is the OVH GDB
 * service adapter; the interface keeps the routes provider-agnostic and lets a
 * mock adapter stand in for tests.
 */
export interface CodeDebuggerAdapter {
  readonly name: string;
  start(input: CodeDebugStartRequest): Promise<CodeDebugSnapshot>;
  action(input: CodeDebugActionRequest): Promise<CodeDebugSnapshot>;
  stop(input: CodeDebugStopRequest): Promise<{ ok: boolean }>;
  health(): Promise<CodeDebuggerHealth>;
}

export const DEBUGGER_UNCONFIGURED_MESSAGE = "Real debugger service is not configured.";

/**
 * A successful, non-crashing response for when no debugger is configured. The UI
 * shows the Debug tab and a friendly message instead of an error — normal CI
 * runs with CODE_DEBUGGER_PROVIDER unset and must stay green.
 */
export function unconfiguredSnapshot(
  breakpoints: CodeBreakpoint[],
  message: string = DEBUGGER_UNCONFIGURED_MESSAGE
): CodeDebugSnapshot {
  return {
    sessionId: null,
    status: "unconfigured",
    file: "main.cpp",
    line: null,
    stdout: "",
    stderr: "",
    compileOutput: "",
    stack: [],
    variables: [],
    watches: [],
    breakpoints,
    message
  };
}
