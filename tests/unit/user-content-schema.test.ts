import { describe, expect, it } from "vitest";
import { parseLessonPayload, validateLessonForPublication } from "@/features/user-content/user-content-schema";
import { CURRENT_LESSON_SCHEMA_VERSION, LESSON_LIMITS, type LessonPayload } from "@/features/user-content/user-content-types";

function baseLesson(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    itemType: "lesson",
    title: "  Pointers 101  ",
    content: "A pointer holds an address.",
    explanation: "We cover addresses and dereferencing.",
    ...overrides
  };
}

describe("parseLessonPayload (#487)", () => {
  it("accepts and normalizes a minimal lesson", () => {
    const result = parseLessonPayload(baseLesson());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe("Pointers 101"); // trimmed
      expect(result.value.schemaVersion).toBe(CURRENT_LESSON_SCHEMA_VERSION);
      expect(result.value.itemType).toBe("lesson");
    }
  });

  it("requires title, content, and explanation", () => {
    const result = parseLessonPayload({ itemType: "lesson", title: "", content: "x", explanation: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const fields = result.issues.map((i) => i.field);
      expect(fields).toContain("title");
      expect(fields).toContain("explanation");
    }
  });

  it("rejects a non-object payload and unknown item types", () => {
    expect(parseLessonPayload(null).ok).toBe(false);
    expect(parseLessonPayload("nope").ok).toBe(false);
    expect(parseLessonPayload(baseLesson({ itemType: "quiz" })).ok).toBe(false);
  });

  it("rejects a schema version newer than supported", () => {
    const result = parseLessonPayload(baseLesson({ schemaVersion: CURRENT_LESSON_SCHEMA_VERSION + 1 }));
    expect(result.ok).toBe(false);
  });

  it("bounds tags and validates difficulty / estimated minutes", () => {
    const many = Array.from({ length: LESSON_LIMITS.maxTags + 5 }, (_, i) => ` tag${i} `);
    const result = parseLessonPayload(baseLesson({ tags: many, difficulty: "intermediate", estimatedMinutes: 15 }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.tags?.length).toBe(LESSON_LIMITS.maxTags);
      expect(result.value.tags?.[0]).toBe("tag0"); // trimmed
      expect(result.value.difficulty).toBe("intermediate");
      expect(result.value.estimatedMinutes).toBe(15);
    }
    expect(parseLessonPayload(baseLesson({ difficulty: "impossible" })).ok).toBe(false);
    expect(parseLessonPayload(baseLesson({ estimatedMinutes: 0 })).ok).toBe(false);
  });

  it("parses interactive fields without leaking undefined", () => {
    const result = parseLessonPayload(
      baseLesson({
        itemType: "multiple_choice",
        choices: [
          { text: "Yes", isCorrect: true },
          { text: "No", isCorrect: false }
        ]
      })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.choices).toEqual([
        { text: "Yes", isCorrect: true },
        { text: "No", isCorrect: false }
      ]);
    }
  });
});

describe("validateLessonForPublication (#487)", () => {
  function payload(overrides: Partial<LessonPayload>): LessonPayload {
    return {
      schemaVersion: CURRENT_LESSON_SCHEMA_VERSION,
      itemType: "lesson",
      title: "T",
      content: "C",
      explanation: "E",
      ...overrides
    };
  }

  it("passes a plain lesson", () => {
    expect(validateLessonForPublication(payload({}))).toEqual([]);
  });

  it("requires choices and a correct answer for multiple choice", () => {
    const noChoices = validateLessonForPublication(payload({ itemType: "multiple_choice" }));
    expect(noChoices.length).toBeGreaterThan(0);

    const noCorrect = validateLessonForPublication(
      payload({ itemType: "multiple_choice", choices: [{ text: "a", isCorrect: false }, { text: "b", isCorrect: false }] })
    );
    expect(noCorrect.some((i) => i.message.includes("correct"))).toBe(true);

    const ok = validateLessonForPublication(
      payload({ itemType: "multiple_choice", choices: [{ text: "a", isCorrect: true }, { text: "b", isCorrect: false }] })
    );
    expect(ok).toEqual([]);
  });

  it("requires solution blocks for parsons and answers for completion", () => {
    expect(validateLessonForPublication(payload({ itemType: "parsons", parsonsBlocks: [{ text: "a", correctOrder: 0, isDistractor: false }] })).length).toBeGreaterThan(0);
    expect(
      validateLessonForPublication(
        payload({
          itemType: "parsons",
          parsonsBlocks: [
            { text: "a", correctOrder: 0, isDistractor: false },
            { text: "b", correctOrder: 1, isDistractor: false }
          ]
        })
      )
    ).toEqual([]);

    expect(validateLessonForPublication(payload({ itemType: "completion", completionBlanks: [{ position: 0, answer: "" }] })).length).toBeGreaterThan(0);
    expect(validateLessonForPublication(payload({ itemType: "completion", completionBlanks: [{ position: 0, answer: "42" }] }))).toEqual([]);
  });
});
