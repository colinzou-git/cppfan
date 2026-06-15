"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { submitCompletion } from "./completion-actions";
import type { PublicCompletionBlank } from "./learning-item-types";

type Feedback =
  | { kind: "correct" }
  | { kind: "partial"; correctCount: number; total: number }
  | { kind: "error" }
  | null;

/**
 * Accessible fill-in-the-blanks interaction for a `completion` item (#124). The
 * learner types each blank in order; grading runs server-side (submitCompletion)
 * and only structural feedback (how many blanks are correct) is shown — never the
 * expected answers. Each blank is a labelled text input, so it is fully keyboard-
 * and screen-reader usable.
 */
export function CompletionExercise({
  itemId,
  blanks
}: {
  itemId: string;
  blanks: PublicCompletionBlank[];
}) {
  const ordered = [...blanks].sort((a, b) => a.position - b.position);
  const [values, setValues] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isPending, startTransition] = useTransition();

  function check() {
    const answers = ordered.map((blank) => values[blank.position] ?? "");
    if (answers.every((a) => a.trim() === "")) {
      return;
    }
    startTransition(async () => {
      const result = await submitCompletion({ itemId, answers });
      if (result.status === "graded") {
        setFeedback(
          result.isCorrect
            ? { kind: "correct" }
            : { kind: "partial", correctCount: result.correctCount, total: result.total }
        );
      } else {
        setFeedback({ kind: "error" });
      }
    });
  }

  const feedbackText =
    feedback === null
      ? ""
      : feedback.kind === "correct"
        ? "Correct — every blank is filled in correctly."
        : feedback.kind === "partial"
          ? `${feedback.correctCount} of ${feedback.total} blanks are correct. Adjust and check again.`
          : "That could not be graded. Please try again.";

  return (
    <div className="grid gap-3" data-testid="completion-exercise">
      <p className="text-sm font-semibold text-slate-700">Fill in the blanks</p>

      <ol className="grid gap-2">
        {ordered.map((blank) => (
          <li key={blank.id} className="flex items-center gap-2">
            <label className="flex flex-1 items-center gap-2 text-sm font-medium text-slate-800">
              <span className="shrink-0 font-bold">Blank {blank.position}</span>
              <input
                type="text"
                value={values[blank.position] ?? ""}
                disabled={isPending}
                onChange={(e) => {
                  setFeedback(null);
                  setValues((prev) => ({ ...prev, [blank.position]: e.target.value }));
                }}
                aria-label={`Blank ${blank.position}`}
                data-testid="completion-blank"
                data-position={blank.position}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900"
              />
            </label>
          </li>
        ))}
      </ol>

      <div>
        <Button type="button" onClick={check} disabled={isPending} data-testid="completion-check">
          {isPending ? "Checking…" : "Check answers"}
        </Button>
      </div>

      <p
        className={`min-h-[1.25rem] text-sm font-semibold ${
          feedback?.kind === "correct"
            ? "text-emerald-700"
            : feedback?.kind === "error"
              ? "text-rose-700"
              : "text-slate-700"
        }`}
        role="status"
        aria-live="polite"
        data-testid="completion-feedback"
      >
        {feedbackText}
      </p>
    </div>
  );
}
