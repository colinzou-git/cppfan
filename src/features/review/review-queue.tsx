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
 * Client review queue. Renders each due card, reveals the explanation on
 * demand, and submits an FSRS rating. Rated cards are removed from the local
 * queue so the learner moves through the session.
 */
export function ReviewQueue({ entries }: { entries: DueReviewEntry[] }) {
  const [remaining, setRemaining] = useState<DueReviewEntry[]>(entries);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const current = remaining[0] ?? null;

  function rate(rating: ReviewRating) {
    if (!current) {
      return;
    }
    setError(null);
    const cardId = current.cardId;
    startTransition(async () => {
      const result = await rateReview({ cardId, rating });
      if (result.status === "error") {
        setError("That review could not be saved. Please try again.");
        return;
      }
      setRemaining((queue) => queue.filter((entry) => entry.cardId !== cardId));
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
        <div className="whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-800">
          {current.prompt}
        </div>

        {error ? (
          <p className="text-sm font-semibold text-rose-700" role="alert">
            {error}
          </p>
        ) : null}

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
      </CardContent>
    </Card>
  );
}
