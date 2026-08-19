"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { rateLessonCompletion } from "./lesson-rating-actions";
import {
  LESSON_COMPLETION_CHOICES,
  type LessonCompletionChoice,
  type LessonRatingState
} from "./lesson-rating-types";

const CHOICE_LABELS: Record<LessonCompletionChoice, string> = {
  hard: "Hard",
  good: "Good",
  mastered: "Mastered"
};

function dueDateLabel(dueAt: string): string {
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) {
    return "the scheduled time";
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function ScheduledLesson({ state }: { state: Extract<LessonRatingState, { state: "scheduled" }> }) {
  return (
    <div
      className="grid gap-3"
      role="status"
      aria-live="polite"
      data-testid="lesson-rating-scheduled"
    >
      <div>
        <p className="font-black text-emerald-950">Lesson completed</p>
        <p className="mt-1 text-sm font-medium text-emerald-900">
          Next review scheduled for{" "}
          <time dateTime={state.dueAt} suppressHydrationWarning>
            {dueDateLabel(state.dueAt)}
          </time>
          .
        </p>
      </div>
      <Button asChild className="w-fit">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}

export function LessonCompletionRating({
  itemId,
  initialState
}: {
  itemId: string;
  initialState: LessonRatingState;
}) {
  const [ratingState, setRatingState] = useState(initialState);
  const [attempt, setAttempt] = useState<{
    choice: LessonCompletionChoice;
    submissionId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function rate(choice: LessonCompletionChoice) {
    const nextAttempt =
      attempt?.choice === choice ? attempt : { choice, submissionId: crypto.randomUUID() };
    setAttempt(nextAttempt);
    setError(null);

    startTransition(async () => {
      const result = await rateLessonCompletion({
        itemId,
        choice: nextAttempt.choice,
        submissionId: nextAttempt.submissionId
      });

      if (result.status === "ok" || result.status === "already_processed") {
        setRatingState({ state: "scheduled", cardId: result.cardId, dueAt: result.dueAt, reps: 1 });
        return;
      }
      if (result.status === "already_scheduled") {
        setRatingState({ state: "scheduled", cardId: result.cardId, dueAt: result.dueAt, reps: 1 });
        return;
      }
      if (result.status === "signed_out") {
        setRatingState({ state: "signed_out" });
        return;
      }
      setError(
        result.status === "unavailable"
          ? "Saving lesson progress is temporarily unavailable. Please retry before leaving."
          : "Your rating was not saved. Please retry before leaving."
      );
    });
  }

  return (
    <section
      className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 sm:p-5"
      aria-labelledby="lesson-rating-heading"
      data-testid="lesson-completion-rating"
    >
      <h2 id="lesson-rating-heading" className="text-lg font-black text-slate-950">
        How well do you understand this lesson?
      </h2>
      <p className="mt-1 text-sm text-slate-700">
        Your answer completes this lesson and schedules its next review.
      </p>

      {ratingState.state === "scheduled" ? (
        <div className="mt-4">
          <ScheduledLesson state={ratingState} />
        </div>
      ) : ratingState.state === "signed_out" ? (
        <div className="mt-4 grid gap-3" role="status">
          <p className="text-sm font-semibold text-slate-800">
            Sign in before rating so cppFan can save your progress and review schedule.
          </p>
          <Button asChild className="w-fit">
            <Link href={`/login?next=${encodeURIComponent(`/learn/${itemId}`)}`}>
              Sign in to save
            </Link>
          </Button>
        </div>
      ) : ratingState.state === "unavailable" ? (
        <p className="mt-4 text-sm font-semibold text-amber-800" role="alert">
          Lesson progress cannot be saved right now. Please try again shortly.
        </p>
      ) : (
        <div className="mt-4 grid gap-3">
          <div
            className="grid grid-cols-1 gap-2 sm:grid-cols-3"
            data-testid="lesson-rating-choices"
          >
            {LESSON_COMPLETION_CHOICES.map((choice) => (
              <Button
                key={choice}
                type="button"
                variant={choice === "hard" ? "secondary" : "default"}
                disabled={isPending}
                aria-pressed={attempt?.choice === choice}
                onClick={() => rate(choice)}
                data-testid={`lesson-rate-${choice}`}
              >
                {isPending && attempt?.choice === choice ? "Saving…" : CHOICE_LABELS[choice]}
              </Button>
            ))}
          </div>

          {error ? (
            <p
              className="text-sm font-semibold text-rose-700"
              role="alert"
              data-testid="lesson-rating-error"
            >
              {error}
            </p>
          ) : null}

          <p className="text-xs font-medium leading-5 text-slate-600">
            “Mastered” schedules a longer review interval. It does not permanently remove the lesson
            or mark the entire skill mastered.
          </p>
          <Button asChild variant="ghost" className="w-fit">
            <Link href="/dashboard">Not yet</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
