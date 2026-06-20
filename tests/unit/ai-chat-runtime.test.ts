import { afterEach, describe, expect, it } from "vitest";
import { dictationTestUtils } from "@/features/ai-chat/dictation-control";
import { getAiProviderConfig, streamAiTutorResponse } from "@/features/ai-chat/ai-chat-provider";

const originalProvider = process.env.AI_PROVIDER;
const originalModel = process.env.AI_MODEL;

afterEach(() => {
  if (originalProvider === undefined) delete process.env.AI_PROVIDER;
  else process.env.AI_PROVIDER = originalProvider;
  if (originalModel === undefined) delete process.env.AI_MODEL;
  else process.env.AI_MODEL = originalModel;
});

describe("AI chat runtime", () => {
  it("uses a deterministic fake provider without external requests", async () => {
    process.env.AI_PROVIDER = "fake";
    delete process.env.AI_MODEL;

    expect(getAiProviderConfig()).toEqual({
      provider: "fake",
      model: "cppfan-fake-tutor"
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
