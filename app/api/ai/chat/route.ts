import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fingerprintAiChatContext,
  isAiChatSourceKind,
  normalizeAiChatContext
} from "@/features/ai-chat/ai-chat-context";
import { buildAiProviderMessages } from "@/features/ai-chat/ai-chat-policy";
import {
  AiProviderError,
  getAiProviderConfig,
  isAiChatEnabled,
  streamAiTutorResponse,
  validateAiProviderConfig
} from "@/features/ai-chat/ai-chat-provider";
import { getAiProviderPreferenceOverride } from "@/features/ai-chat/provider-preferences";
import {
  appendMessage,
  consumeAiChatQuota,
  createConversation,
  deleteConversation,
  deleteItemConversations,
  getCompletedAssistantForRequest,
  getOwnedConversation,
  getRecentConversationMessages,
  listItemConversations,
  recordAiChatOutput,
  saveAssistantMessage
} from "@/features/ai-chat/ai-chat-store";
import type {
  AiChatApiError,
  AiChatStreamEvent
} from "@/features/ai-chat/ai-chat-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_MESSAGE_CHARS = 12_000;
const MAX_REQUESTS_PER_DAY = Math.max(
  1,
  Math.min(500, Number(process.env.AI_DAILY_REQUEST_LIMIT) || 50)
);
const MAX_INPUT_CHARS_PER_DAY = Math.max(
  10_000,
  Math.min(5_000_000, Number(process.env.AI_DAILY_INPUT_CHAR_LIMIT) || 250_000)
);
const MAX_REQUESTS_PER_MINUTE = Math.max(
  1,
  Math.min(30, Number(process.env.AI_MINUTE_REQUEST_LIMIT) || 6)
);
const REQUEST_TIMEOUT_MS = Math.max(
  5_000,
  Math.min(120_000, Number(process.env.AI_REQUEST_TIMEOUT_MS) || 45_000)
);

function apiError(
  code: string,
  message: string,
  status: number,
  retryAfterSeconds?: number
) {
  const body: AiChatApiError = {
    error: {
      code,
      message,
      ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds })
    }
  };
  return NextResponse.json(body, { status });
}

async function authenticatedClient() {
  const supabase = await createClient();
  if (!supabase) return { status: "unconfigured" as const };
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { status: "signed_out" as const };
  return { status: "ok" as const, supabase, user: data.user };
}

function parseBodyRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function streamFromEvents(events: AiChatStreamEvent[]) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      }
      controller.close();
    }
  });
}

function streamResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store, no-transform",
      "x-content-type-options": "nosniff"
    }
  });
}

export async function GET(request: Request) {
  const auth = await authenticatedClient();
  if (auth.status === "unconfigured") {
    return apiError("supabase_unconfigured", "Sign-in storage is not configured.", 503);
  }
  if (auth.status === "signed_out") {
    return apiError("authentication_required", "Sign in to use AI Chat.", 401);
  }

  const url = new URL(request.url);
  const sourceKind = url.searchParams.get("sourceKind") ?? "";
  const sourceId = (url.searchParams.get("sourceId") ?? "").trim();
  if (!isAiChatSourceKind(sourceKind) || !sourceId || sourceId.length > 240) {
    return apiError("invalid_source", "A valid item source is required.", 400);
  }

  try {
    const conversations = await listItemConversations({
      supabase: auth.supabase,
      userId: auth.user.id,
      sourceKind,
      sourceId
    });
    return NextResponse.json({ conversations }, { headers: { "cache-control": "no-store" } });
  } catch {
    return apiError("history_unavailable", "Chat history is temporarily unavailable.", 503);
  }
}

export async function DELETE(request: Request) {
  const auth = await authenticatedClient();
  if (auth.status === "unconfigured") {
    return apiError("supabase_unconfigured", "Sign-in storage is not configured.", 503);
  }
  if (auth.status === "signed_out") {
    return apiError("authentication_required", "Sign in to manage chat history.", 401);
  }

  let body: Record<string, unknown> | null = null;
  try {
    body = parseBodyRecord(await request.json());
  } catch {
    return apiError("invalid_request", "A valid deletion request is required.", 400);
  }
  if (!body) return apiError("invalid_request", "A valid deletion request is required.", 400);

  try {
    if (typeof body.conversationId === "string" && UUID_PATTERN.test(body.conversationId)) {
      await deleteConversation({
        supabase: auth.supabase,
        userId: auth.user.id,
        conversationId: body.conversationId
      });
      return NextResponse.json({ ok: true });
    }

    const sourceKind = typeof body.sourceKind === "string" ? body.sourceKind : "";
    const sourceId = typeof body.sourceId === "string" ? body.sourceId.trim() : "";
    if (body.allForItem === true && isAiChatSourceKind(sourceKind) && sourceId) {
      await deleteItemConversations({
        supabase: auth.supabase,
        userId: auth.user.id,
        sourceKind,
        sourceId
      });
      return NextResponse.json({ ok: true });
    }
    return apiError("invalid_request", "Choose a conversation or item history to delete.", 400);
  } catch {
    return apiError("delete_failed", "Chat history could not be deleted.", 503);
  }
}

export async function POST(request: Request) {
  const auth = await authenticatedClient();
  if (auth.status === "unconfigured") {
    return apiError("supabase_unconfigured", "Sign-in storage is not configured.", 503);
  }
  if (auth.status === "signed_out") {
    return apiError("authentication_required", "Sign in to use AI Chat.", 401);
  }

  const providerOverride = await getAiProviderPreferenceOverride();
  if (!isAiChatEnabled(providerOverride)) {
    return apiError("ai_unavailable", "Free AI Chat is not enabled yet.", 503);
  }

  let body: Record<string, unknown> | null = null;
  try {
    body = parseBodyRecord(await request.json());
  } catch {
    return apiError("invalid_request", "The AI Chat request is not valid.", 400);
  }
  if (!body) return apiError("invalid_request", "The AI Chat request is not valid.", 400);

  const parsedContext = normalizeAiChatContext(body.context);
  if (!parsedContext.ok) {
    return apiError("invalid_context", parsedContext.error, 400);
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const requestId = typeof body.requestId === "string" ? body.requestId : "";
  const requestedConversationId =
    typeof body.conversationId === "string" ? body.conversationId : null;

  if (!message || message.length > MAX_MESSAGE_CHARS) {
    return apiError(
      "invalid_message",
      `Enter a message between 1 and ${MAX_MESSAGE_CHARS.toLocaleString()} characters.`,
      400
    );
  }
  if (!UUID_PATTERN.test(requestId)) {
    return apiError("invalid_request_id", "A valid request identifier is required.", 400);
  }
  if (requestedConversationId && !UUID_PATTERN.test(requestedConversationId)) {
    return apiError("invalid_conversation", "The selected conversation is not valid.", 400);
  }

  const context = parsedContext.value;
  const config = getAiProviderConfig(providerOverride);
  const configError = validateAiProviderConfig(config);
  if (configError) {
    return apiError(
      configError.code,
      configError.message,
      configError.status,
      configError.retryAfterSeconds
    );
  }
  const contextFingerprint = fingerprintAiChatContext(context);

  try {
    let conversation = requestedConversationId
      ? await getOwnedConversation({
          supabase: auth.supabase,
          userId: auth.user.id,
          conversationId: requestedConversationId
        })
      : null;

    if (requestedConversationId && !conversation) {
      return apiError("conversation_not_found", "That conversation is not available.", 404);
    }
    if (
      conversation &&
      (conversation.source_kind !== context.sourceKind ||
        conversation.source_id !== context.sourceId ||
        conversation.source_version !== context.sourceVersion)
    ) {
      return apiError(
        "context_changed",
        "This item changed. Start a new chat with the current item context.",
        409
      );
    }

    if (!conversation) {
      conversation = await createConversation({
        supabase: auth.supabase,
        userId: auth.user.id,
        sourceKind: context.sourceKind,
        sourceId: context.sourceId,
        sourceVersion: context.sourceVersion,
        title: context.title,
        provider: config.provider,
        model: config.model,
        contextFingerprint
      });
    }
    const activeConversation = conversation;

    const completed = await getCompletedAssistantForRequest({
      supabase: auth.supabase,
      userId: auth.user.id,
      conversationId: activeConversation.id,
      requestId
    });
    if (completed) {
      return streamResponse(
        streamFromEvents([
          {
            type: "meta",
            conversationId: activeConversation.id,
            requestId,
            provider: completed.provider ?? config.provider,
            model: completed.model ?? config.model
          },
          { type: "delta", text: completed.content },
          { type: "done", status: "complete" }
        ])
      );
    }

    const minuteAgo = new Date(Date.now() - 60_000).toISOString();
    const recentResult = await auth.supabase
      .from("ai_chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.user.id)
      .eq("role", "user")
      .gte("created_at", minuteAgo);
    if (recentResult.error) throw recentResult.error;
    if ((recentResult.count ?? 0) >= MAX_REQUESTS_PER_MINUTE) {
      return apiError(
        "app_rate_limited",
        "You have sent several AI questions quickly. Try again in about a minute.",
        429,
        60
      );
    }

    const quota = await consumeAiChatQuota({
      supabase: auth.supabase,
      inputChars: message.length + JSON.stringify(context).length,
      maxRequests: MAX_REQUESTS_PER_DAY,
      maxInputChars: MAX_INPUT_CHARS_PER_DAY
    });
    if (!quota.allowed) {
      return apiError(
        "daily_free_limit_reached",
        "You reached today's shared free AI limit. Your saved history is still available.",
        429
      );
    }

    await appendMessage({
      supabase: auth.supabase,
      userId: auth.user.id,
      conversationId: activeConversation.id,
      requestId,
      role: "user",
      content: message,
      status: "complete"
    });

    const history = await getRecentConversationMessages({
      supabase: auth.supabase,
      userId: auth.user.id,
      conversationId: activeConversation.id
    });
    const providerMessages = buildAiProviderMessages(context, history);
    const encoder = new TextEncoder();
    const abortController = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      abortController.abort();
    }, REQUEST_TIMEOUT_MS);
    request.signal.addEventListener("abort", () => abortController.abort(), { once: true });

    const responseStream = new ReadableStream<Uint8Array>({
      start(controller) {
        const send = (event: AiChatStreamEvent) => {
          try {
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
            return true;
          } catch {
            return false;
          }
        };

        void (async () => {
          let output = "";
          send({
            type: "meta",
            conversationId: activeConversation.id,
            requestId,
            provider: config.provider,
            model: config.model
          });

          try {
            for await (const chunk of streamAiTutorResponse({
              messages: providerMessages,
              signal: abortController.signal,
              override: providerOverride
            })) {
              output += chunk;
              if (!send({ type: "delta", text: chunk })) abortController.abort();
            }
            await saveAssistantMessage({
              supabase: auth.supabase,
              userId: auth.user.id,
              conversationId: activeConversation.id,
              requestId,
              content: output,
              status: "complete",
              provider: config.provider,
              model: config.model
            });
            try {
              await recordAiChatOutput({
                supabase: auth.supabase,
                outputChars: output.length
              });
            } catch {
              // Usage accounting must not turn a completed response into a failure.
            }
            send({ type: "done", status: "complete" });
          } catch (error) {
            const stopped =
              abortController.signal.aborted &&
              !timedOut &&
              !(error instanceof AiProviderError);
            const status = stopped ? "stopped" : "failed";
            await saveAssistantMessage({
              supabase: auth.supabase,
              userId: auth.user.id,
              conversationId: activeConversation.id,
              requestId,
              content: output,
              status,
              provider: config.provider,
              model: config.model
            });

            if (stopped) {
              send({ type: "done", status: "stopped" });
            } else {
              const providerError =
                error instanceof AiProviderError
                  ? error
                  : new AiProviderError({
                      code: timedOut ? "request_timed_out" : "provider_unavailable",
                      message: timedOut
                        ? "The AI response took too long. Try again."
                        : "The AI provider could not complete this request.",
                      status: timedOut ? 504 : 502
                    });
              send({
                type: "error",
                code: providerError.code,
                message: providerError.message,
                retryAfterSeconds: providerError.retryAfterSeconds
              });
            }
          } finally {
            clearTimeout(timeoutId);
            try {
              controller.close();
            } catch {
              // The browser may already have closed the stream after Stop.
            }
          }
        })();
      },
      cancel() {
        abortController.abort();
        clearTimeout(timeoutId);
      }
    });

    return streamResponse(responseStream);
  } catch {
    return apiError("chat_unavailable", "AI Chat is temporarily unavailable.", 503);
  }
}
