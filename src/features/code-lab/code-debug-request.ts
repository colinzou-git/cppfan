import { CODE_LAB_LIMITS } from "./code-lab-types";
import { getCodeLabConfigForItem } from "./code-lab-catalog";
import { isUserLearningItemId } from "@/features/user-content/user-content-id";
import type { CodeBreakpoint, CodeDebugAction, CodeDebugSnapshot } from "./code-debug-types";

/**
 * Request validation for the Code Lab debug routes (#442), mirroring
 * code-lab-request.ts. Enforces the same boundary limits plus debugger-specific
 * caps (breakpoints, watches) before any proxying to the debugger service.
 */

const MAX_BREAKPOINTS = 20;
const MAX_WATCHES = 20;
const MAX_WATCH_CHARS = 120;
const MAX_SESSION_ID_CHARS = 200;

const DEBUG_ACTIONS: readonly CodeDebugAction[] = [
  "continue",
  "pause",
  "stepOver",
  "stepInto",
  "stepOut",
  "restart"
];

export type ParsedDebugStart =
  | {
      ok: true;
      itemId: string;
      source: string;
      stdin: string;
      breakpoints: CodeBreakpoint[];
      watches: string[];
    }
  | { ok: false; code: string; message: string };

function parseBreakpoints(value: unknown): CodeBreakpoint[] | { error: string } {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return { error: "Breakpoints must be a list." };
  if (value.length > MAX_BREAKPOINTS) {
    return { error: `At most ${MAX_BREAKPOINTS} breakpoints are allowed.` };
  }
  const out: CodeBreakpoint[] = [];
  for (const entry of value) {
    const line = Number((entry as { line?: unknown })?.line);
    if (!Number.isInteger(line) || line <= 0) {
      return { error: "Breakpoint lines must be positive integers." };
    }
    out.push({
      id: typeof (entry as { id?: unknown })?.id === "string" ? (entry as { id: string }).id : `bp-${line}`,
      line,
      enabled: (entry as { enabled?: unknown })?.enabled !== false
    });
  }
  return out;
}

function parseWatches(value: unknown): string[] | { error: string } {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return { error: "Watches must be a list." };
  if (value.length > MAX_WATCHES) return { error: `At most ${MAX_WATCHES} watches are allowed.` };
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") return { error: "Watch expressions must be strings." };
    const expr = entry.trim();
    if (!expr) continue;
    if (expr.length > MAX_WATCH_CHARS) {
      return { error: `Watch expressions must be under ${MAX_WATCH_CHARS} characters.` };
    }
    out.push(expr);
  }
  return out;
}

export function validateDebugStartRequest(body: Record<string, unknown>): ParsedDebugStart {
  const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
  if (!itemId || itemId.length > 240) {
    return { ok: false, code: "invalid_item", message: "A valid item id is required." };
  }
  if (!getCodeLabConfigForItem(itemId) && !isUserLearningItemId(itemId)) {
    return { ok: false, code: "not_code_capable", message: "This item does not have a Code Lab." };
  }

  const source = typeof body.source === "string" ? body.source : "";
  if (!source.trim()) {
    return { ok: false, code: "empty_source", message: "Write some code before debugging." };
  }
  if (source.length > CODE_LAB_LIMITS.maxSourceChars) {
    return { ok: false, code: "source_too_large", message: "Code is too large to debug." };
  }

  const stdin = typeof body.stdin === "string" ? body.stdin : "";
  if (stdin.length > CODE_LAB_LIMITS.maxStdinChars) {
    return { ok: false, code: "stdin_too_large", message: "Input is too large." };
  }

  const breakpoints = parseBreakpoints(body.breakpoints);
  if ("error" in breakpoints) {
    return { ok: false, code: "invalid_breakpoints", message: breakpoints.error };
  }
  const watches = parseWatches(body.watches);
  if ("error" in watches) {
    return { ok: false, code: "invalid_watches", message: watches.error };
  }

  return { ok: true, itemId, source, stdin, breakpoints, watches };
}

export type ParsedDebugAction =
  | { ok: true; sessionId: string; action: CodeDebugAction; watches: string[] }
  | { ok: false; code: string; message: string };

export function validateDebugActionRequest(body: Record<string, unknown>): ParsedDebugAction {
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId || sessionId.length > MAX_SESSION_ID_CHARS) {
    return { ok: false, code: "invalid_session", message: "A valid session id is required." };
  }
  const action = body.action as CodeDebugAction;
  if (!DEBUG_ACTIONS.includes(action)) {
    return { ok: false, code: "invalid_action", message: "Unknown debug action." };
  }
  const watches = parseWatches(body.watches);
  if ("error" in watches) {
    return { ok: false, code: "invalid_watches", message: watches.error };
  }
  return { ok: true, sessionId, action, watches };
}

export type ParsedDebugStop =
  | { ok: true; sessionId: string }
  | { ok: false; code: string; message: string };

export function validateDebugStopRequest(body: Record<string, unknown>): ParsedDebugStop {
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId || sessionId.length > MAX_SESSION_ID_CHARS) {
    return { ok: false, code: "invalid_session", message: "A valid session id is required." };
  }
  return { ok: true, sessionId };
}

export type ParsedDebugExplain =
  | { ok: true; itemId: string; source: string; snapshot: CodeDebugSnapshot; userQuestion?: string }
  | { ok: false; code: string; message: string };

export function validateDebugExplainRequest(body: Record<string, unknown>): ParsedDebugExplain {
  const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
  if (!itemId || itemId.length > 240) {
    return { ok: false, code: "invalid_item", message: "A valid item id is required." };
  }
  if (!getCodeLabConfigForItem(itemId) && !isUserLearningItemId(itemId)) {
    return { ok: false, code: "not_code_capable", message: "This item does not have a Code Lab." };
  }

  const source = typeof body.source === "string" ? body.source : "";
  if (!source.trim()) {
    return { ok: false, code: "empty_source", message: "There is no code to explain." };
  }
  if (source.length > CODE_LAB_LIMITS.maxSourceChars) {
    return { ok: false, code: "source_too_large", message: "Code is too large." };
  }

  const snapshot = body.snapshot;
  if (
    typeof snapshot !== "object" ||
    snapshot === null ||
    typeof (snapshot as { status?: unknown }).status !== "string"
  ) {
    return { ok: false, code: "invalid_snapshot", message: "A debug snapshot is required." };
  }

  const userQuestion =
    typeof body.userQuestion === "string" ? body.userQuestion.slice(0, 1_000) : undefined;

  return { ok: true, itemId, source, snapshot: snapshot as CodeDebugSnapshot, userQuestion };
}
