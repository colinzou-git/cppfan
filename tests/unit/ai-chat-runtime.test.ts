import { afterEach, describe, expect, it, vi } from "vitest";
import { dictationTestUtils } from "@/features/ai-chat/dictation-control";
import {
  AI_PROVIDER_OUTPUT_TRUNCATED_CODE,
  AiProviderError,
  getAiProviderConfig,
  streamAiTutorResponse
} from "@/features/ai-chat/ai-chat-provider";

const originalProvider = process.env.AI_PROVIDER;
const originalModel = process.env.AI_MODEL;
const originalGroqKey = process.env.GROQ_API_KEY;
const originalGeminiKey = process.env.GEMINI_API_KEY;
const originalGoogleKey = process.env.GOOGLE_API_KEY;

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

function sseResponse(lines: string[]) {
  return new Response(`${lines.join("\n\n")}\n\n`, {
    status: 200,
    headers: { "content-type": "text/event-stream" }
  });
}

async function collectTutorStream() {
  let output = "";
  let caught: unknown = null;
  try {
    for await (const chunk of streamAiTutorResponse({
      messages: [{ role: "user", content: "Explain RAII." }],
      signal: new AbortController().signal
    })) {
      output += chunk;
    }
  } catch (error) {
    caught = error;
  }
  return { output, error: caught };
}

afterEach(() => {
  restoreEnv("AI_PROVIDER", originalProvider);
  restoreEnv("AI_MODEL", originalModel);
  restoreEnv("GROQ_API_KEY", originalGroqKey);
  restoreEnv("GEMINI_API_KEY", originalGeminiKey);
  restoreEnv("GOOGLE_API_KEY", originalGoogleKey);
  vi.restoreAllMocks();
});

describe("AI chat runtime", () => {
  it("uses a deterministic fake provider without external requests", async () => {
    process.env.AI_PROVIDER = "fake";
    delete process.env.AI_MODEL;

    expect(getAiProviderConfig()).toEqual({
      provider: "fake",
      model: "cppfan-fake-tutor",
      credential: null,
      credentialSource: "deployment"
    });

    let output = "";
    for await (const chunk of streamAiTutorResponse({
      messages: [{ role: "user", content: "Explain RAII." }],
      signal: new AbortController().signal
    })) {
      output += chunk;
    }
    expect(output).toContain("Explain RAII");
  });

  it("keeps a normally completed Groq response unchanged", async () => {
    process.env.AI_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "test-groq-key";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      sseResponse([
        'data: {"choices":[{"delta":{"content":"Complete answer."},"finish_reason":"stop"}]}',
        "data: [DONE]"
      ])
    );

    await expect(collectTutorStream()).resolves.toEqual({
      output: "Complete answer.",
      error: null
    });
  });

  it("detects Groq output-limit truncation without losing the final text chunk", async () => {
    process.env.AI_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "test-groq-key";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      sseResponse([
        'data: {"choices":[{"delta":{"content":"Partial answer with final words"},"finish_reason":"length"}]}',
        "data: [DONE]"
      ])
    );

    const result = await collectTutorStream();
    expect(result.output).toBe("Partial answer with final words");
    expect(result.error).toBeInstanceOf(AiProviderError);
    expect((result.error as AiProviderError).code).toBe(AI_PROVIDER_OUTPUT_TRUNCATED_CODE);
  });

  it("detects a Groq finish-reason-only truncation frame", async () => {
    process.env.AI_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "test-groq-key";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      sseResponse([
        'data: {"choices":[{"delta":{"content":"Partial answer"},"finish_reason":null}]}',
        'data: {"choices":[{"delta":{},"finish_reason":"length"}]}',
        "data: [DONE]"
      ])
    );

    const result = await collectTutorStream();
    expect(result.output).toBe("Partial answer");
    expect(result.error).toBeInstanceOf(AiProviderError);
    expect((result.error as AiProviderError).code).toBe(AI_PROVIDER_OUTPUT_TRUNCATED_CODE);
  });

  it("keeps a normally completed Gemini response unchanged", async () => {
    process.env.AI_PROVIDER = "google";
    process.env.GEMINI_API_KEY = "test-gemini-key";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      sseResponse([
        'data: {"candidates":[{"content":{"parts":[{"text":"Complete Gemini answer."}]},"finishReason":"STOP"}]}'
      ])
    );

    await expect(collectTutorStream()).resolves.toEqual({
      output: "Complete Gemini answer.",
      error: null
    });
  });

  it("detects Gemini MAX_TOKENS truncation without losing text from the same frame", async () => {
    process.env.AI_PROVIDER = "google";
    process.env.GEMINI_API_KEY = "test-gemini-key";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      sseResponse([
        'data: {"candidates":[{"content":{"parts":[{"text":"Partial Gemini final words"}]},"finishReason":"MAX_TOKENS"}]}'
      ])
    );

    const result = await collectTutorStream();
    expect(result.output).toBe("Partial Gemini final words");
    expect(result.error).toBeInstanceOf(AiProviderError);
    expect((result.error as AiProviderError).code).toBe(AI_PROVIDER_OUTPUT_TRUNCATED_CODE);
  });

  it("inserts dictated text at the current selection without submitting", () => {
    const textarea = {
      selectionStart: 6,
      selectionEnd: 11
    } as HTMLTextAreaElement;

    expect(
      dictationTestUtils.insertAtSelection("Hello world!", "C++ tutor", textarea)
    ).toEqual({
      value: "Hello C++ tutor!",
      caret: 15
    });
  });

  it("appends dictated text while preserving an existing prompt", () => {
    const textarea = {
      selectionStart: 12,
      selectionEnd: 12
    } as HTMLTextAreaElement;

    const result = dictationTestUtils.insertAtSelection(
      "Explain RAII",
      "with an example",
      textarea
    );
    expect(result.value).toBe("Explain RAII with an example");
  });
});
