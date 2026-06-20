"use client";

import type { AiChatContext, AiChatConversationView, AiChatHistoryResponse, AiChatStreamEvent } from "./ai-chat-types";

const endpoint = ["/api", "/ai", "/chat"].join("");

export async function listThreads(context: AiChatContext): Promise<AiChatConversationView[]> {
  const params = new URLSearchParams({ sourceKind: context.sourceKind, sourceId: context.sourceId });
  const response = await fetch(`${endpoint}?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 401 ? "Sign in to use the tutor." : "Saved conversations are unavailable.");
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
  if (!response.ok || !response.body) throw new Error(response.status === 401 ? "Sign in to use the tutor." : "The tutor is unavailable.");
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
