import type { CodeRunResult, CodeTestResult } from "./code-lab-types";
import type { CodeTraceResult } from "./code-trace-types";
import type { StructuredCodeFeedback } from "./code-feedback-types";

/**
 * Browser fetch wrappers for the Code Lab API (#407). These run client-side and
 * never touch runner credentials or hidden tests — that all lives behind the
 * route handlers.
 */

type ApiEnvelope<T> = { result?: T; error?: { code: string; message: string } };

async function postJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal
  });
  const data = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok || !data.result) {
    throw new Error(data.error?.message ?? "The Code Lab request failed.");
  }
  return data.result;
}

export function runCodeRequest(
  input: { itemId: string; source: string; stdin?: string },
  signal?: AbortSignal
): Promise<CodeRunResult> {
  return postJson<CodeRunResult>("/api/code/run", input, signal);
}

export function runTestsRequest(
  input: { itemId: string; source: string },
  signal?: AbortSignal
): Promise<CodeTestResult> {
  return postJson<CodeTestResult>("/api/code/test", input, signal);
}

export function reviewCodeRequest(
  input: {
    itemId: string;
    source: string;
    lastRunResult?: CodeRunResult | null;
    lastTestResult?: CodeTestResult | null;
    userQuestion?: string;
  },
  signal?: AbortSignal
): Promise<StructuredCodeFeedback> {
  return postJson<StructuredCodeFeedback>("/api/code/review", input, signal);
}

export function traceCodeRequest(
  input: {
    itemId: string;
    source: string;
    selectedTestName?: string;
    selectedInput?: string;
    selectedActualOutput?: string;
    lastRunResult?: CodeRunResult | null;
    lastTestResult?: CodeTestResult | null;
  },
  signal?: AbortSignal
): Promise<CodeTraceResult> {
  return postJson<CodeTraceResult>("/api/code/trace", input, signal);
}
