"use client";

import type {
  AiChatContext,
  AiChatConversationView,
  AiChatHistoryResponse,
  AiChatStreamEvent
} from "./ai-chat-types";

const endpoint = ["/api", "/ai", "/chat"].join("");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readAiChatApiErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const payload: unknown = await response.json();
    if (isRecord(payload) && isRecord(payload.error)) {
      const message = payload.error.message;
      if (typeof message === "string" && message.trim()) return message.trim();
    }
  } catch {
    // Non-JSON platform/proxy errors still use the safe fallback below.
  }
  return fallback;
}

export async function listThreads(context: AiChatContext): Promise<AiChatConversationView[]> {
  const params = new URLSearchParams({ sourceKind: context.sourceKind, sourceId: context.sourceId });
  const response = await fetch(`${endpoint}?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(
      await readAiChatApiErrorMessage(
        response,
        response.status === 401 ? "Sign in to use the tutor." : "Saved conversations are unavailable."
      )
    );
  }
  const body = (await response.json()) as AiChatHistoryResponse;
  return Array.isArray(body.conversations) ? body.conversations : [];
}

export async function runTutor(args: {
  context: AiChatContext;
  message: string;
  requestId: string;
  conversationId: string | null;
  signal: AbortSignal;
  onEvent: (event: AiChatStreamEvent) => void;
}): Promise<void> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/x-ndjson" },
    body: JSON.stringify({ context: args.context, message: args.message, requestId: args.requestId, conversationId: args.conversationId }),
    signal: args.signal
  });
  if (!response.ok) {
    throw new Error(
      await readAiChatApiErrorMessage(
        response,
        response.status === 401 ? "Sign in to use the tutor." : "The tutor is unavailable."
      )
    );
  }
  if (!response.body) throw new Error("The tutor returned an empty response.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) if (line.trim()) args.onEvent(JSON.parse(line) as AiChatStreamEvent);
    if (done) break;
  }
}
