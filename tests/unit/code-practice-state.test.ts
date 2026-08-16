import { describe, expect, it } from "vitest";
import { nextPracticeName, practiceDisplaySource } from "@/features/code-lab/use-code-practices";
import type { CodePractice } from "@/features/code-lab/code-practice-types";

function practice(overrides: Partial<CodePractice> = {}): CodePractice {
  return {
    id: "practice-1",
    itemId: "cpp.values_types.variables.sample_code",
    name: "Practice 1",
    sourceCode: "learner-v1",
    language: "cpp",
    skillIds: ["cpp.values_types.variables"],
    contentVersionId: null,
    lessonSourceVersion: "sha256:v1",
    standardSourceCodeSnapshot: "standard-v1",
    createdAt: "2026-08-09T12:00:00Z",
    updatedAt: "2026-08-09T12:00:00Z",
    ...overrides
  };
}

describe("saved Code Lab practice state", () => {
  it("suggests the first unused Practice N name", () => {
    expect(nextPracticeName([])).toBe("Practice 1");
    expect(nextPracticeName([practice(), practice({ id: "p2", name: "Practice 2" })])).toBe(
      "Practice 3"
    );
    expect(nextPracticeName([practice({ name: "custom" }), practice({ id: "p2", name: "Practice 2" })])).toBe(
      "Practice 1"
    );
  });

  it("switches between learner, current standard, and immutable standard-at-save source", () => {
    const saved = practice({ standardSourceCodeSnapshot: "standard-v1" });

    expect(
      practiceDisplaySource({
        mode: "learner",
        learnerSource: "learner-edited",
        currentStandardSource: "standard-v2",
        activePractice: saved
      })
    ).toBe("learner-edited");

    expect(
      practiceDisplaySource({
        mode: "current_standard",
        learnerSource: "learner-edited",
        currentStandardSource: "standard-v2",
        activePractice: saved
      })
    ).toBe("standard-v2");

    expect(
      practiceDisplaySource({
        mode: "saved_standard",
        learnerSource: "learner-edited",
        currentStandardSource: "standard-v2",
        activePractice: saved
      })
    ).toBe("standard-v1");
  });

  it("does not invent a historical source when no saved practice is active", () => {
    expect(
      practiceDisplaySource({
        mode: "saved_standard",
        learnerSource: "draft",
        currentStandardSource: "standard-current",
        activePractice: null
      })
    ).toBe("standard-current");
  });
});
