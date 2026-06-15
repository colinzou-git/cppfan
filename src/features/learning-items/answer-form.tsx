"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitAnswer } from "./attempt-actions";
import type { SubmitAnswerResult } from "./submit-service";
import { ExplanationPanel } from "./explanation-panel";
import type { PublicLearningItemChoice } from "./learning-item-types";

/*
 * Interactive answering for a choice-based learning item. Grading runs in the
 * submitAnswer server action; this component only renders the choices, the
 * result, and a retry control. The answer key is never sent here — the correct
 * choice id arrives in the result only after a submission. The answer-bearing
 * explanation is likewise revealed only after grading (#145), and hidden again
 * on retry.
 */
export function AnswerForm({
  itemId,
  choices,
  explanation
}: {
  itemId: string;
  choices: PublicLearningItemChoice[];
  explanation?: string | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitAnswerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const graded = result?.status === "graded" ? result : null;

  function onSubmit() {
    if (!selectedId) {
      return;
    }
    setError(null);
    // A stable id per submission makes the server-authoritative write idempotent,
    // so a double tap or retry of the same answer is recorded once (#218).
    const submissionId = crypto.randomUUID();
    startTransition(async () => {
      const response = await submitAnswer({ itemId, choiceId: selectedId, submissionId });
      if (response.status === "error") {
        setError("Grading is temporarily unavailable. Please try again in a moment.");
        return;
      }
      if (response.status === "invalid") {
        setError("That answer could not be graded. Please try again.");
        return;
      }
      setResult(response);
    });
  }

  function onRetry() {
    setResult(null);
    setSelectedId(null);
    setError(null);
  }

  return (
    <div className="grid gap-3" data-testid="answer-form">
      <p className="text-sm font-semibold text-slate-700">Choose an answer</p>

      <ul className="grid gap-2">
        {choices.map((choice) => {
          const isSelected = selectedId === choice.id;
          const isCorrectChoice = graded?.correctChoiceId === choice.id;
          const isWrongSelected = Boolean(graded) && isSelected && !isCorrectChoice;

          return (
            <li key={choice.id}>
              <label
                data-testid="answer-choice"
                className={[
                  "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition",
                  isCorrectChoice
                    ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                    : isWrongSelected
                      ? "border-rose-300 bg-rose-50 text-rose-950"
                      : isSelected
                        ? "border-blue-300 bg-blue-50 text-blue-950"
                        : "border-slate-200 bg-white text-slate-800 hover:border-blue-200"
                ].join(" ")}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`answer-${itemId}`}
                    value={choice.id}
                    checked={isSelected}
                    disabled={Boolean(graded) || isPending}
                    onChange={() => setSelectedId(choice.id)}
                    className="h-4 w-4"
                  />
                  {choice.content}
                </span>
                {graded && isCorrectChoice ? <Check className="h-4 w-4 text-emerald-600" /> : null}
                {isWrongSelected ? <X className="h-4 w-4 text-rose-600" /> : null}
              </label>
            </li>
          );
        })}
      </ul>

      {error ? (
        <p className="text-sm font-semibold text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      {graded ? (
        <div
          data-testid="answer-result"
          role="status"
          className={[
            "rounded-2xl px-4 py-3 text-sm font-bold",
            graded.isCorrect ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
          ].join(" ")}
        >
          {graded.isCorrect ? "Correct!" : "Not quite — see the highlighted answer."}
          {!graded.persisted ? (
            <span className="mt-1 block text-xs font-medium opacity-80">
              Sign in to save your progress. This attempt was not recorded.
            </span>
          ) : null}
        </div>
      ) : null}

      {graded && explanation ? (
        <div aria-live="polite">
          <ExplanationPanel explanation={explanation} />
        </div>
      ) : null}

      {graded ? (
        <Button type="button" variant="secondary" onClick={onRetry} data-testid="answer-retry">
          Try again
        </Button>
      ) : (
        <Button type="button" onClick={onSubmit} disabled={!selectedId || isPending} data-testid="answer-submit">
          {isPending ? "Checking…" : "Submit answer"}
        </Button>
      )}
    </div>
  );
}
