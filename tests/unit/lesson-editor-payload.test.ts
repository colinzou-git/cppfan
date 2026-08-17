import { describe, expect, it } from "vitest";
import { buildLessonPayload, fieldsFromLessonPayload } from "@/features/user-content/lesson-editor";
import { applyAcceptedOperations } from "@/features/user-content/ai-authoring-proposal";
import {
  CURRENT_LESSON_SCHEMA_VERSION,
  type LessonPayload
} from "@/features/user-content/user-content-types";

function completeLesson(): LessonPayload {
  return {
    schemaVersion: CURRENT_LESSON_SCHEMA_VERSION,
    itemType: "lesson",
    title: "Pointers",
    content: "Core lesson",
    explanation: "Why it matters",
    difficulty: "intermediate",
    estimatedMinutes: 12,
    tags: ["pointers", "memory"],
    learningObjectives: ["Explain address-of", "Avoid dangling pointers"],
    sourceNotes: "Private author notes",
    sections: {
      introduction: "Intro",
      commonMistakes: "Dereferencing null"
    },
    examples: [{ input: "&value", output: "address", note: "Conceptual" }],
    sampleCode: "int value = 1;",
    starterCode: "int main() {}",
    referenceSolution: "int main() { return 0; }",
    expectedOutput: "",
    solutionExplanation: "Return success",
    reviewCards: [
      {
        prompt: "What does & do?",
        choices: [
          { text: "Takes an address", isCorrect: true },
          { text: "Dereferences", isCorrect: false }
        ]
      }
    ]
  };
}

describe("lesson editor payload preservation", () => {
  it("round-trips every supported optional lesson field", () => {
    const payload = completeLesson();
    expect(buildLessonPayload(fieldsFromLessonPayload(payload))).toMatchObject({
      tags: payload.tags,
      learningObjectives: payload.learningObjectives,
      sourceNotes: payload.sourceNotes,
      sections: payload.sections,
      examples: payload.examples,
      sampleCode: payload.sampleCode,
      starterCode: payload.starterCode,
      referenceSolution: payload.referenceSolution,
      solutionExplanation: payload.solutionExplanation,
      reviewCards: payload.reviewCards
    });
  });

  it("retains AI objectives and common-mistakes sections through the editor model", () => {
    const applied = applyAcceptedOperations(completeLesson(), [
      { type: "set_objectives", value: ["Use pointers safely"] },
      {
        type: "append_section",
        section: "commonMistakes",
        value: "Do not dereference a null pointer."
      }
    ]);

    const savedPayload = buildLessonPayload(fieldsFromLessonPayload(applied));
    expect(savedPayload).toMatchObject({
      learningObjectives: ["Use pointers safely"],
      sections: {
        commonMistakes: "Dereferencing null\n\nDo not dereference a null pointer."
      }
    });
  });
});
