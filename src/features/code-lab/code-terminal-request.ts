import { CODE_LAB_LIMITS } from "./code-lab-types";
import { CODE_TERMINAL_LIMITS } from "./code-terminal-types";
import { getCodeLabConfigForItem } from "./code-lab-catalog";
import { isUserLearningItemId } from "@/features/user-content/user-content-id";

/**
 * Request validation for the Code Lab terminal routes (#664), mirroring
 * code-lab-request.ts / code-debug-request.ts. Enforces the boundary limits plus
 * terminal-specific caps before any proxying to the execution service. The
 * service validates again; these keep obviously-bad payloads off the wire.
 */

const MAX_SESSION_ID_CHARS = 200;
const MAX_SESSION_TOKEN_CHARS = 400;

// Allow tab/newline/carriage return; reject other C0/DEL control characters.
const DISALLOWED_CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export type ParsedTerminalStart =
  | {
      ok: true;
      itemId: string;
      source: string;
      stdin: string;
      contentVersionId?: string;
      milestoneIndex?: number;
    }
  | { ok: false; code: string; message: string };

function parseContentVersionId(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 && value.length <= 100 ? value : undefined;
}

function parseMilestoneIndex(value: unknown): number | undefined {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 1000
    ? value
    : undefined;
}

export function validateTerminalStartRequest(body: Record<string, unknown>): ParsedTerminalStart {
  const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
  if (!itemId || itemId.length > 240) {
    return { ok: false, code: "invalid_item", message: "A valid item id is required." };
  }
  if (!getCodeLabConfigForItem(itemId) && !isUserLearningItemId(itemId)) {
    return { ok: false, code: "not_code_capable", message: "This item does not have a Code Lab." };
  }

  const source = typeof body.source === "string" ? body.source : "";
  if (!source.trim()) {
    return { ok: false, code: "empty_source", message: "Write some code before running." };
  }
  if (source.length > CODE_LAB_LIMITS.maxSourceChars) {
    return { ok: false, code: "source_too_large", message: "Code is too large to run." };
  }

  const stdin = typeof body.stdin === "string" ? body.stdin : "";
  if (stdin.length > CODE_LAB_LIMITS.maxStdinChars) {
    return { ok: false, code: "stdin_too_large", message: "Input Args is too large." };
  }
  if (DISALLOWED_CONTROL.test(stdin)) {
    return {
      ok: false,
      code: "invalid_stdin",
      message: "Input Args contains disallowed control characters."
    };
  }

  return {
    ok: true,
    itemId,
    source,
    stdin,
    contentVersionId: parseContentVersionId(body.contentVersionId),
    milestoneIndex: parseMilestoneIndex(body.milestoneIndex)
  };
}

type SessionCredentials =
  | { ok: true; sessionId: string; sessionToken: string }
  | { ok: false; code: string; message: string };

function parseCredentials(body: Record<string, unknown>): SessionCredentials {
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId || sessionId.length > MAX_SESSION_ID_CHARS) {
    return { ok: false, code: "invalid_session", message: "A valid session id is required." };
  }
  const sessionToken = typeof body.sessionToken === "string" ? body.sessionToken : "";
  if (!sessionToken || sessionToken.length > MAX_SESSION_TOKEN_CHARS) {
    return { ok: false, code: "invalid_session", message: "A valid session token is required." };
  }
  return { ok: true, sessionId, sessionToken };
}

export type ParsedTerminalPoll =
  | { ok: true; sessionId: string; sessionToken: string; after: number }
  | { ok: false; code: string; message: string };

export function validateTerminalPollRequest(body: Record<string, unknown>): ParsedTerminalPoll {
  const creds = parseCredentials(body);
  if (!creds.ok) return creds;
  const rawAfter = Number(body.after);
  const after = Number.isFinite(rawAfter) && rawAfter >= 0 ? Math.floor(rawAfter) : 0;
  return { ok: true, sessionId: creds.sessionId, sessionToken: creds.sessionToken, after };
}

export type ParsedTerminalInput =
  | { ok: true; sessionId: string; sessionToken: string; data: string; eof: boolean }
  | { ok: false; code: string; message: string };

export function validateTerminalInputRequest(body: Record<string, unknown>): ParsedTerminalInput {
  const creds = parseCredentials(body);
  if (!creds.ok) return creds;
  const eof = body.eof === true;
  const hasData = typeof body.data === "string";
  const data = hasData ? (body.data as string) : "";
  if (!eof && !hasData) {
    return { ok: false, code: "invalid_input", message: "Input data or EOF is required." };
  }
  if (data.length > CODE_TERMINAL_LIMITS.maxInputPayloadChars) {
    return { ok: false, code: "input_too_large", message: "Input line is too large." };
  }
  if (DISALLOWED_CONTROL.test(data)) {
    return {
      ok: false,
      code: "invalid_input",
      message: "Input contains disallowed control characters."
    };
  }
  return { ok: true, sessionId: creds.sessionId, sessionToken: creds.sessionToken, data, eof };
}

export type ParsedTerminalStop =
  | { ok: true; sessionId: string; sessionToken: string }
  | { ok: false; code: string; message: string };

export function validateTerminalStopRequest(body: Record<string, unknown>): ParsedTerminalStop {
  const creds = parseCredentials(body);
  if (!creds.ok) return creds;
  return { ok: true, sessionId: creds.sessionId, sessionToken: creds.sessionToken };
}

export type ParsedTerminalAttempt =
  | {
      ok: true;
      terminalAttemptId: string;
      sessionId: string;
      sessionToken: string;
      itemId: string;
      source: string;
      contentVersionId?: string;
      milestoneIndex?: number;
    }
  | { ok: false; code: string; message: string };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate the once-per-session final-attempt payload (#664). Provider/simulated
 * are NOT taken from the client — the route derives them from the selected
 * provider, so a browser can never forge non-simulated learning evidence.
 */
export function validateTerminalAttemptRequest(
  body: Record<string, unknown>
): ParsedTerminalAttempt {
  const forbidden = ["status", "exitCode", "compileOutput", "stdout", "stderr"];
  if (forbidden.some((field) => Object.prototype.hasOwnProperty.call(body, field))) {
    return {
      ok: false,
      code: "invalid_attempt",
      message: "Final Terminal status and output are read from the execution session."
    };
  }
  const terminalAttemptId =
    typeof body.terminalAttemptId === "string" ? body.terminalAttemptId.trim() : "";
  if (!UUID_PATTERN.test(terminalAttemptId)) {
    return {
      ok: false,
      code: "invalid_attempt",
      message: "A valid Terminal attempt id is required."
    };
  }
  const creds = parseCredentials(body);
  if (!creds.ok) return creds;
  const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
  if (!itemId || itemId.length > 240) {
    return { ok: false, code: "invalid_item", message: "A valid item id is required." };
  }
  if (!getCodeLabConfigForItem(itemId) && !isUserLearningItemId(itemId)) {
    return { ok: false, code: "not_code_capable", message: "This item does not have a Code Lab." };
  }
  const source = typeof body.source === "string" ? body.source : "";
  if (!source.trim()) {
    return { ok: false, code: "empty_source", message: "Source is required." };
  }
  if (source.length > CODE_LAB_LIMITS.maxSourceChars) {
    return { ok: false, code: "source_too_large", message: "Code is too large." };
  }

  return {
    ok: true,
    terminalAttemptId,
    sessionId: creds.sessionId,
    sessionToken: creds.sessionToken,
    itemId,
    source,
    contentVersionId: parseContentVersionId(body.contentVersionId),
    milestoneIndex: parseMilestoneIndex(body.milestoneIndex)
  };
}
