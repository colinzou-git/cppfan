import type {
  CodeTerminalHealth,
  CodeTerminalAttemptRequest,
  CodeTerminalInputRequest,
  CodeTerminalPollRequest,
  CodeTerminalSnapshot,
  CodeTerminalStartRequest,
  CodeTerminalStopRequest,
  RecordTerminalAttemptResult
} from "./code-terminal-types";

/**
 * Browser fetch wrappers for the Code Lab terminal API (#664). These run
 * client-side and never see the execution-service URL or CODE_TERMINAL_API_KEY —
 * that all lives behind the Next.js route handlers. Poll/input/stop are POSTs so
 * the per-session capability token travels in the body rather than in a URL that
 * could land in access logs. An "unconfigured" snapshot is a successful result,
 * not an error, so the Terminal degrades gracefully.
 */

type ApiEnvelope<T> = { result?: T; error?: { code: string; message: string } };

async function requestJson<T>(url: string, init: RequestInit, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { ...init, signal });
  const data = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok || data.result === undefined) {
    throw new Error(data.error?.message ?? "The terminal request failed.");
  }
  return data.result;
}

function postJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return requestJson<T>(
    url,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) },
    signal
  );
}

export function startTerminalRequest(
  input: CodeTerminalStartRequest,
  signal?: AbortSignal
): Promise<CodeTerminalSnapshot> {
  return postJson<CodeTerminalSnapshot>("/api/code/terminal/start", input, signal);
}

export function pollTerminalRequest(
  input: CodeTerminalPollRequest,
  signal?: AbortSignal
): Promise<CodeTerminalSnapshot> {
  return postJson<CodeTerminalSnapshot>("/api/code/terminal/poll", input, signal);
}

export function sendTerminalInput(
  input: CodeTerminalInputRequest,
  signal?: AbortSignal
): Promise<{ ok: boolean }> {
  return postJson<{ ok: boolean }>("/api/code/terminal/input", input, signal);
}

export function stopTerminalRequest(
  input: CodeTerminalStopRequest,
  signal?: AbortSignal
): Promise<{ ok: boolean }> {
  return postJson<{ ok: boolean }>("/api/code/terminal/stop", input, signal);
}

export function terminalHealthRequest(signal?: AbortSignal): Promise<CodeTerminalHealth> {
  return requestJson<CodeTerminalHealth>("/api/code/terminal/health", { method: "GET" }, signal);
}

/** Persist a final Terminal run through the server-authoritative snapshot. */
export function recordTerminalAttemptRequest(
  input: CodeTerminalAttemptRequest,
  signal?: AbortSignal
): Promise<RecordTerminalAttemptResult> {
  return postJson<RecordTerminalAttemptResult>("/api/code/terminal/attempt", input, signal);
}
