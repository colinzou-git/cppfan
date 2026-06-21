import type { AiProviderMessage } from "./ai-chat-policy";

export type AiProviderConfig = {
  provider: string;
  model: string;
};

export class AiProviderError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryAfterSeconds?: number;

  constructor({
    code,
    message,
    status = 500,
    retryAfterSeconds
  }: {
    code: string;
    message: string;
    status?: number;
    retryAfterSeconds?: number;
  }) {
    super(message);
    this.name = "AiProviderError";
    this.code = code;
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function configuredProvider(): string {
  return (process.env.AI_PROVIDER ?? "groq").trim().toLowerCase();
}

export function getAiProviderConfig(): AiProviderConfig {
  const provider = configuredProvider();
  const model =
    process.env.AI_MODEL?.trim() ||
    (provider === "fake" ? "cppfan-fake-tutor" : "openai/gpt-oss-120b");
  return { provider, model };
}

export function isAiChatEnabled(): boolean {
  return process.env.AI_CHAT_ENABLED === "true" || configuredProvider() === "fake";
}

function retryAfterSeconds(response: Response): number | undefined {
  const raw = response.headers.get("retry-after");
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? Math.ceil(value) : undefined;
}

async function* fakeStream(messages: AiProviderMessage[]): AsyncGenerator<string> {
  const last = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const response = `Fake tutor response for local testing: ${last.slice(0, 180)}`;
  for (const chunk of response.match(/.{1,24}/g) ?? []) {
    await Promise.resolve();
    yield chunk;
  }
}

type GroqChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
};

async function* groqStream({
  messages,
  signal,
  model
}: {
  messages: AiProviderMessage[];
  signal: AbortSignal;
  model: string;
}): AsyncGenerator<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new AiProviderError({
      code: "provider_unconfigured",
      message: "Free AI is not configured yet.",
      status: 503
    });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.2,
      max_tokens: Math.max(128, Math.min(1600, Number(process.env.AI_MAX_OUTPUT_TOKENS) || 900))
    }),
    signal,
    cache: "no-store"
  });

  if (!response.ok) {
    const code =
      response.status === 429
        ? "provider_rate_limited"
        : response.status === 401 || response.status === 403
          ? "provider_auth_failed"
          : response.status === 413
            ? "context_too_large"
            : "provider_unavailable";
    throw new AiProviderError({
      code,
      message:
        response.status === 429
          ? "The shared free AI limit is busy. Try again later."
          : "The AI provider could not complete this request.",
      status: response.status === 429 ? 429 : 502,
      retryAfterSeconds: retryAfterSeconds(response)
    });
  }

  if (!response.body) {
    throw new AiProviderError({
      code: "provider_empty_response",
      message: "The AI provider returned no response.",
      status: 502
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const parsed = JSON.parse(payload) as GroqChunk;
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // Ignore malformed provider event fragments. A complete stream remains usable.
      }
    }

    if (done) break;
  }
}

export async function* streamAiTutorResponse({
  messages,
  signal
}: {
  messages: AiProviderMessage[];
  signal: AbortSignal;
}): AsyncGenerator<string> {
  const { provider, model } = getAiProviderConfig();
  if (provider === "fake") {
    yield* fakeStream(messages);
    return;
  }
  if (provider !== "groq") {
    throw new AiProviderError({
      code: "provider_unsupported",
      message: "The configured AI provider is not supported.",
      status: 503
    });
  }
  yield* groqStream({ messages, signal, model });
}

/**
 * Collect a full (non-streamed) provider response. Used by features that need a
 * single structured answer (e.g. Code Lab AI review/trace) rather than an
 * incremental stream. Reuses the same provider selection, gating, and fake
 * fallback as the streaming path so behaviour stays consistent.
 */
export async function completeAiResponse({
  messages,
  signal
}: {
  messages: AiProviderMessage[];
  signal: AbortSignal;
}): Promise<string> {
  let output = "";
  for await (const chunk of streamAiTutorResponse({ messages, signal })) {
    output += chunk;
  }
  return output;
}
