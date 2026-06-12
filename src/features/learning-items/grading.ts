export type GradingChoice = {
  id: string;
  is_correct?: boolean;
};

export type GradeOutcome =
  | { status: "invalid"; reason: "no_choices" | "no_correct_choice" | "unknown_choice" }
  | { status: "graded"; isCorrect: boolean; correctChoiceId: string };

/**
 * Grade a choice-based attempt against the item's choices. Pure and
 * DB-independent so it can be unit tested and reused on the server.
 *
 * Returns an `invalid` outcome (rather than throwing) for submissions that
 * cannot be graded: an item with no choices, a choice set with no correct
 * answer, or a selected id that does not belong to the item.
 */
export function gradeChoiceAttempt(choices: GradingChoice[], selectedChoiceId: string): GradeOutcome {
  if (choices.length === 0) {
    return { status: "invalid", reason: "no_choices" };
  }

  const correct = choices.find((choice) => choice.is_correct);
  if (!correct) {
    return { status: "invalid", reason: "no_correct_choice" };
  }

  if (!choices.some((choice) => choice.id === selectedChoiceId)) {
    return { status: "invalid", reason: "unknown_choice" };
  }

  return {
    status: "graded",
    isCorrect: selectedChoiceId === correct.id,
    correctChoiceId: correct.id
  };
}
