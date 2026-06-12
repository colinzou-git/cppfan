import { describe, expect, it } from "vitest";
import { gradeChoiceAttempt } from "@/features/learning-items/grading";
import { getChoicesForItem } from "@/features/learning-items/learning-item-seed";

const choices = [
  { id: "a", is_correct: true },
  { id: "b", is_correct: false },
  { id: "c", is_correct: false }
];

describe("gradeChoiceAttempt", () => {
  it("marks the correct choice correct", () => {
    const outcome = gradeChoiceAttempt(choices, "a");
    expect(outcome).toEqual({ status: "graded", isCorrect: true, correctChoiceId: "a" });
  });

  it("marks a wrong choice incorrect but still reports the correct answer", () => {
    const outcome = gradeChoiceAttempt(choices, "b");
    expect(outcome).toEqual({ status: "graded", isCorrect: false, correctChoiceId: "a" });
  });

  it("rejects a choice id that does not belong to the item", () => {
    expect(gradeChoiceAttempt(choices, "z")).toEqual({ status: "invalid", reason: "unknown_choice" });
  });

  it("rejects an item with no choices", () => {
    expect(gradeChoiceAttempt([], "a")).toEqual({ status: "invalid", reason: "no_choices" });
  });

  it("rejects a choice set with no correct answer", () => {
    const broken = [
      { id: "a", is_correct: false },
      { id: "b", is_correct: false }
    ];
    expect(gradeChoiceAttempt(broken, "a")).toEqual({ status: "invalid", reason: "no_correct_choice" });
  });
});

describe("grading against seeded content", () => {
  it("grades the seeded default-access multiple choice item", () => {
    const seedChoices = getChoicesForItem("cpp.structs_classes.syntax.mc_default_access");
    expect(seedChoices.length).toBeGreaterThan(0);

    const correct = seedChoices.find((choice) => choice.is_correct);
    expect(correct?.id).toBe("cpp.structs_classes.syntax.mc_default_access.a");

    const right = gradeChoiceAttempt(seedChoices, "cpp.structs_classes.syntax.mc_default_access.a");
    expect(right.status === "graded" && right.isCorrect).toBe(true);

    const wrong = gradeChoiceAttempt(seedChoices, "cpp.structs_classes.syntax.mc_default_access.b");
    expect(wrong.status === "graded" && wrong.isCorrect).toBe(false);
  });
});
