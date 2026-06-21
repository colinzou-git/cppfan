import {
  AI_PROVIDER_DEFAULT_MODELS,
  type PersonalAiProvider
} from "./ai-provider-options";
import type { AiProviderMessage } from "./ai-chat-policy";

export type AiProviderCredentialSource = "deployment" | "user";

export type AiProviderConfig = {
  provider: string;
  model: string;
  credential: string | null;
  credentialSource: AiProviderCredentialSource;
};

export type AiProviderRuntimeOverride = {
  provider: PersonalAiProvider;
  model: string;
  credential: string | null;
  credentialSource: "user";
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

function deploymentCredential(provider: string): string | null {
  if (provider === "google") {
    return process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || null;
  }
  if (provider === "groq") return process.env.GROQ_API_KEY?.trim() || null;
  return null;
}

function defaultModelForProvider(provider: string) {
  if (provider === "fake") return "cppfan-fake-tutor";
  if (provider === "google") return AI_PROVIDER_DEFAULT_MODELS.google;
  return AI_PROVIDER_DEFAULT_MODELS.groq;
}

export function getAiProviderConfig(override?: AiProviderRuntimeOverride | null): AiProviderConfig {
  if (override) {
    return {
      provider: override.provider,
      model: override.model || AI_PROVIDER_DEFAULT_MODELS[override.provider],
      credential: override.credential?.trim() || null,
      credentialSource: override.credentialSource
    };
  }

  const provider = configuredProvider();
  const model = process.env.AI_MODEL?.trim() || defaultModelForProvider(provider);
  return {
    provider,
    model,
    credential: deploymentCredential(provider),
    credentialSource: "deployment"
  };
}

export function isAiChatEnabled(override?: AiProviderRuntimeOverride | null): boolean {
  return Boolean(override) || process.env.AI_CHAT_ENABLED === "true" || configuredProvider() === "fake";
}

export function validateAiProviderConfig(config: AiProviderConfig): AiProviderError | null {
  if (config.provider === "fake") return null;
  if (config.provider !== "groq" && config.provider !== "google") {
    return new AiProviderError({
      code: "provider_unsupported",
      message: "The configured AI provider is not supported.",
      status: 503
    });
  }
  if (!config.credential?.trim()) {
    return new AiProviderError({
      code: "provider_unconfigured",
      message:
        config.credentialSource === "user"
          ? "Save a personal AI provider credential in Settings before using this provider."
          : "Free AI is not configured yet.",
      status: 503
    });
  }
  return null;
}

function retryAfterSeconds(response: Response): number | undefined {
  const raw = response.headers.get("retry-after");
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? Math.ceil(value) : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readProviderErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const payload: unknown = await response.json();
    if (isRecord(payload) && isRecord(payload.error)) {
      const message = payload.error.message;
      if (typeof message === "string" && message.trim()) return message.trim();
    }
  } catch {
    // Provider error payloads are not guaranteed to be JSON.
  }
  return fallback;
}

function maxOutputTokens() {
  return Math.max(128, Math.min(1600, Number(process.env.AI_MAX_OUTPUT_TOKENS) || 900));
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

function groqTextFromSseLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;
  const payload = trimmed.slice(5).trim();
  if (!payload || payload === "[DONE]") return null;
  try {
    const parsed = JSON.parse(payload) as GroqChunk;
    const content = parsed.choices?.[0]?.delta?.content;
    return content || null;
  } catch {
    return null;
  }
}

async function* groqStream({
  messages,
  signal,
  config
}: {
  messages: AiProviderMessage[];
  signal: AbortSignal;
  config: AiProviderConfig;
}): AsyncGenerator<string> {
  const apiKey = config.credential?.trim();
  if (!apiKey) {
    throw validateAiProviderConfig(config) ?? new AiProviderError({
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
      model: config.model,
      messages,
      stream: true,
      temperature: 0.2,
      max_tokens: maxOutputTokens()
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
          : await readProviderErrorMessage(response, "The AI provider could not complete this request."),
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
      const content = groqTextFromSseLine(line);
      if (content) yield content;
    }

    if (done) {
      const content = groqTextFromSseLine(buffer);
      if (content) yield content;
      break;
    }
  }
}

type GeminiContent = {
  role?: "user" | "model";
  parts: Array<{ text: string }>;
};

type GeminiChunk = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function geminiModelPath(model: string) {
  const normalized = model.trim().replace(/^models\//, "");
  return `models/${encodeURIComponent(normalized)}`;
}

function geminiRequestBody(messages: AiProviderMessage[]) {
  const systemText = messages
    .filter((message) => message.role === "system" && message.content.trim())
    .map((message) => message.content.trim())
    .join("\n\n");
  const contents: GeminiContent[] = messages
    .filter((message) => message.role !== "system" && message.content.trim())
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    }));

  return {
    ...(systemText ? { systemInstruction: { parts: [{ text: systemText }] } } : {}),
    contents: contents.length ? contents : [{ role: "user", parts: [{ text: "Continue." }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: maxOutputTokens()
    }
  };
}

function geminiTextFromSseLine(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return [];
  const payload = trimmed.slice(5).trim();
  if (!payload) return [];
  try {
    const parsed = JSON.parse(payload) as GeminiChunk;
    return parsed.candidates?.flatMap((candidate) =>
      candidate.content?.parts
        ?.map((part) => part.text)
        .filter((text): text is string => Boolean(text)) ?? []
    ) ?? [];
  } catch {
    return [];
  }
}

async function* googleStream({
  messages,
  signal,
  config
}: {
  messages: AiProviderMessage[];
  signal: AbortSignal;
  config: AiProviderConfig;
}): AsyncGenerator<string> {
  const apiKey = config.credential?.trim();
  if (!apiKey) {
    throw validateAiProviderConfig(config) ?? new AiProviderError({
      code: "provider_unconfigured",
      message: "Save a personal AI provider credential in Settings before using this provider.",
      status: 503
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${geminiModelPath(config.model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(geminiRequestBody(messages)),
      signal,
      cache: "no-store"
    }
  );

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
          ? "The selected Gemini provider is rate limited. Try again later."
          : await readProviderErrorMessage(response, "Gemini could not complete this request."),
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
      for (const content of geminiTextFromSseLine(line)) yield content;
    }

    if (done) {
      for (const content of geminiTextFromSseLine(buffer)) yield content;
      break;
    }
  }
}

export async function* streamAiTutorResponse({
  messages,
  signal,
  override
}: {
  messages: AiProviderMessage[];
  signal: AbortSignal;
  override?: AiProviderRuntimeOverride | null;
}): AsyncGenerator<string> {
  const config = getAiProviderConfig(override);
  const validation = validateAiProviderConfig(config);
  if (validation) throw validation;

  if (config.provider === "fake") {
    yield* fakeStream(messages);
    return;
  }
  if (config.provider === "groq") {
    yield* groqStream({ messages, signal, config });
    return;
  }
  if (config.provider === "google") {
    yield* googleStream({ messages, signal, config });
    return;
  }

  throw new AiProviderError({
    code: "provider_unsupported",
    message: "The configured AI provider is not supported.",
    status: 503
  });
}
