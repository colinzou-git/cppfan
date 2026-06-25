import type {
  CodeDebugActionRequest,
  CodeDebugExplainRequest,
  CodeDebugExplainResult,
  CodeDebugSnapshot,
  CodeDebugStartRequest,
  CodeDebugStopRequest,
  CodeDebuggerHealth
} from "./code-debug-types";

/**
 * Browser fetch wrappers for the Code Lab debug API (#442). These run
 * client-side and never see the debugger service URL or CODE_DEBUGGER_API_KEY —
 * that all lives behind the Next.js route handlers. An "unconfigured" snapshot is
 * a successful result, not an error, so the Debug tab degrades gracefully.
 */

type ApiEnvelope<T> = { result?: T; error?: { code: string; message: string } };

async function requestJson<T>(url: string, init: RequestInit, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { ...init, signal });
  const data = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok || data.result === undefined) {
    throw new Error(data.error?.message ?? "The debugger request failed.");
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

export function startDebugRequest(
  input: CodeDebugStartRequest,
  signal?: AbortSignal
): Promise<CodeDebugSnapshot> {
  return postJson<CodeDebugSnapshot>("/api/code/debug/start", input, signal);
}

export function debugActionRequest(
  input: CodeDebugActionRequest,
  signal?: AbortSignal
): Promise<CodeDebugSnapshot> {
  return postJson<CodeDebugSnapshot>("/api/code/debug/action", input, signal);
}

export function stopDebugRequest(
  input: CodeDebugStopRequest,
  signal?: AbortSignal
): Promise<{ ok: boolean }> {
  return postJson<{ ok: boolean }>("/api/code/debug/stop", input, signal);
}

export function debugHealthRequest(signal?: AbortSignal): Promise<CodeDebuggerHealth> {
  return requestJson<CodeDebuggerHealth>("/api/code/debug/health", { method: "GET" }, signal);
}

export function explainDebugRequest(
  input: CodeDebugExplainRequest,
  signal?: AbortSignal
): Promise<CodeDebugExplainResult> {
  return postJson<CodeDebugExplainResult>("/api/code/debug/explain", input, signal);
}
