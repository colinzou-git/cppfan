import { describe, expect, it } from "vitest";
import {
  applyAcceptedOperations,
  parseAuthoringProposal,
  type AuthoringOperation
} from "@/features/user-content/ai-authoring-proposal";
import { CURRENT_LESSON_SCHEMA_VERSION, type LessonPayload } from "@/features/user-content/user-content-types";

function lesson(overrides: Partial<LessonPayload> = {}): LessonPayload {
  return {
    schemaVersion: CURRENT_LESSON_SCHEMA_VERSION,
    itemType: "lesson",
    title: "T",
    content: "C",
    explanation: "E",
    ...overrides
  };
}

describe("parseAuthoringProposal (#487)", () => {
  it("parses fenced JSON and tags operations with ids", () => {
    const text = "Here you go:\n```json\n" + JSON.stringify({
      summary: "add intro",
      operations: [
        { type: "replace_field", field: "title", value: "Pointers" },
        { type: "append_section", section: "introduction", value: "Intro text" }
      ]
    }) + "\n```";
    const result = parseAuthoringProposal(text);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.summary).toBe("add intro");
      expect(result.value.operations).toHaveLength(2);
      expect(result.value.operations[0].id).toBe("op-0");
    }
  });

  it("drops invalid operations but keeps the valid ones", () => {
    const text = JSON.stringify({
      summary: "mixed",
      operations: [
        { type: "replace_field", field: "not_a_field", value: "x" },
        { type: "add_choice", text: "A", isCorrect: true },
        { type: "unknown_op" }
      ]
    });
    const result = parseAuthoringProposal(text);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.operations).toHaveLength(1);
      expect(result.value.operations[0].type).toBe("add_choice");
    }
  });

  it("rejects text with no JSON or no valid operations", () => {
    expect(parseAuthoringProposal("just prose, no json").ok).toBe(false);
    expect(parseAuthoringProposal(JSON.stringify({ summary: "x", operations: [] })).ok).toBe(false);
    expect(parseAuthoringProposal(42 as unknown as string).ok).toBe(false);
  });
});

describe("applyAcceptedOperations (#487)", () => {
  it("applies replace and append without mutating the input", () => {
    const original = lesson({ sections: { introduction: "one" } });
    const ops: AuthoringOperation[] = [
      { type: "replace_field", field: "title", value: "New" },
      { type: "append_section", section: "introduction", value: "two" },
      { type: "append_section", section: "summary", value: "wrap" }
    ];
    const next = applyAcceptedOperations(original, ops);
    expect(next.title).toBe("New");
    expect(next.sections?.introduction).toBe("one\n\ntwo");
    expect(next.sections?.summary).toBe("wrap");
    // input untouched
    expect(original.title).toBe("T");
    expect(original.sections?.introduction).toBe("one");
  });

  it("adds interactive items and sets arrays", () => {
    const next = applyAcceptedOperations(lesson({ choices: [{ text: "A", isCorrect: true }] }), [
      { type: "add_choice", text: "B", isCorrect: false },
      { type: "set_tags", value: ["ptr", "mem"] },
      { type: "set_objectives", value: ["Understand"] },
      { type: "add_parsons_block", text: "line", correctOrder: 0, isDistractor: false },
      { type: "add_completion_blank", position: 0, answer: "int" }
    ]);
    expect(next.choices).toHaveLength(2);
    expect(next.tags).toEqual(["ptr", "mem"]);
    expect(next.learningObjectives).toEqual(["Understand"]);
    expect(next.parsonsBlocks).toHaveLength(1);
    expect(next.completionBlanks?.[0].answer).toBe("int");
  });

  it("parses and applies an add_review_card operation", () => {
    const parsed = parseAuthoringProposal(
      JSON.stringify({
        summary: "add a quiz",
        operations: [
          {
            type: "add_review_card",
            prompt: "What does & return?",
            explanation: "It takes the address.",
            choices: [
              { text: "the address", isCorrect: true },
              { text: "the value", isCorrect: false }
            ]
          }
        ]
      })
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      const op = parsed.value.operations[0];
      expect(op.type).toBe("add_review_card");
      const next = applyAcceptedOperations(lesson(), parsed.value.operations);
      expect(next.reviewCards).toHaveLength(1);
      expect(next.reviewCards?.[0].prompt).toBe("What does & return?");
      expect(next.reviewCards?.[0].choices).toHaveLength(2);
      expect(next.reviewCards?.[0].choices[0].isCorrect).toBe(true);
      expect(next.reviewCards?.[0].explanation).toBe("It takes the address.");
    }
  });

  it("applies only the accepted subset", () => {
    const parsed = parseAuthoringProposal(
      JSON.stringify({
        summary: "s",
        operations: [
          { type: "replace_field", field: "title", value: "Accepted" },
          { type: "replace_field", field: "explanation", value: "Rejected" }
        ]
      })
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      const accepted = parsed.value.operations.filter((o) => o.id === "op-0");
      const next = applyAcceptedOperations(lesson(), accepted);
      expect(next.title).toBe("Accepted");
      expect(next.explanation).toBe("E"); // op-1 not accepted
    }
  });
});
