"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { rateReview } from "./review-actions";
import { REVIEW_RATINGS, type ReviewRating } from "@/lib/fsrs/scheduler";
import type { DueReviewEntry } from "./review-types";

const RATING_LABELS: Record<ReviewRating, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy"
};

/*
 * Client review queue. For each due card the learner first attempts recall from
 * the prompt, then reveals the explanation (and the choices as neutral
 * reference), and only then rates with FSRS. The reveal gate is reset when
 * advancing to the next card. The answer key is never sent to the client.
 */
export function ReviewQueue({ entries }: { entries: DueReviewEntry[] }) {
  const [remaining, setRemaining] = useState<DueReviewEntry[]>(entries);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const current = remaining[0] ?? null;

  function rate(rating: ReviewRating) {
    if (!current) {
      return;
    }
    setError(null);
    const cardId = current.cardId;
    // A stable id per click so an in-flight retry / double-tap cannot rate twice.
    const submissionId = crypto.randomUUID();
    startTransition(async () => {
      const result = await rateReview({ cardId, rating, submissionId });
      if (result.status === "error") {
        setError("That review could not be saved. Please try again.");
        return;
      }
      // `ok` and `stale` (already rated elsewhere) both advance past this card.
      setRemaining((queue) => queue.filter((entry) => entry.cardId !== cardId));
      // Next card starts hidden so the learner attempts recall first.
      setRevealed(false);
    });
  }

  if (!current) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/90 shadow-sm" data-testid="review-empty">
        <CardHeader>
          <CardTitle>All caught up</CardTitle>
        </CardHeader>
        <CardContent className="text-sm font-semibold text-emerald-950">
          No reviews are due right now. New cards become due as you keep learning.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/70 bg-white/85 shadow-sm backdrop-blur" data-testid="review-queue">
      <CardHeader>
        <CardTitle>{current.title}</CardTitle>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500" data-testid="review-remaining">
          {remaining.length} due
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div
          className="whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-800"
          data-testid="review-prompt"
        >
          {current.prompt}
        </div>

        {error ? (
          <p className="text-sm font-semibold text-rose-700" role="alert">
            {error}
          </p>
        ) : null}

        {!revealed ? (
          <>
            <p className="text-xs font-medium text-slate-500">
              Try to recall the answer, then reveal the explanation to rate yourself.
            </p>
            <Button
              type="button"
              onClick={() => setRevealed(true)}
              disabled={isPending}
              data-testid="review-reveal"
            >
              Reveal answer
            </Button>
          </>
        ) : (
          <>
            {current.choices.length > 0 ? (
              <div className="grid gap-2" data-testid="review-choices">
                <p className="text-sm font-semibold text-slate-700">Choices</p>
                <ul className="grid gap-2">
                  {current.choices.map((choice) => (
                    <li
                      key={choice.id}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800"
                    >
                      {choice.content}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {current.explanation ? (
              <div
                className="rounded-2xl bg-emerald-50/80 p-4 text-sm leading-6 text-emerald-950"
                data-testid="review-explanation"
              >
                {current.explanation}
              </div>
            ) : null}

            <p className="text-xs font-medium text-slate-500">
              How well did you recall this? Your rating schedules the next review.
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" data-testid="review-ratings">
              {REVIEW_RATINGS.map((rating) => (
                <Button
                  key={rating}
                  type="button"
                  variant={rating === "again" ? "secondary" : "default"}
                  disabled={isPending}
                  onClick={() => rate(rating)}
                  data-testid={`review-rate-${rating}`}
                >
                  {RATING_LABELS[rating]}
                </Button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
