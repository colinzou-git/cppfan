import { describe, expect, it } from "vitest";
import {
  buildStructuredCodeReviewPrompt,
  buildStructuredCodeTracePrompt
} from "@/features/code-lab/code-feedback-prompts";
import { CODE_ERROR_TAGS } from "@/features/code-lab/code-error-tags";

describe("structured feedback prompts", () => {
  it("review prompt lists every allowed error tag and requires JSON only", () => {
    const prompt = buildStructuredCodeReviewPrompt({ hasFailingTests: true });
    for (const tag of CODE_ERROR_TAGS) {
      expect(prompt).toContain(tag);
    }
    expect(prompt).toMatch(/single JSON object/i);
    expect(prompt).toMatch(/advisory weak evidence/i);
  });

  it("trace prompt requires JSON, lists tags, and forbids fabricating runtime on compile error", () => {
    const prompt = buildStructuredCodeTracePrompt({ hasSelectedTest: true });
    expect(prompt).toContain(CODE_ERROR_TAGS[0]);
    expect(prompt).toMatch(/approximate/i);
    expect(prompt).toMatch(/empty steps array/i);
  });

  it("never embeds hidden test inputs (prompts are context-free system text)", () => {
    const prompt = buildStructuredCodeReviewPrompt();
    expect(prompt).not.toMatch(/secret/i);
  });
});
