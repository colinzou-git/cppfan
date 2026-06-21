"use client";

import type { CodeReviewResult } from "./code-lab-types";

export function AiCodeReviewPanel({
  review,
  pending
}: {
  review: CodeReviewResult | null;
  pending: boolean;
}) {
  if (pending) {
    return (
      <section
        className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900"
        data-testid="code-ai-review"
        aria-live="polite"
      >
        Reviewing your code…
      </section>
    );
  }

  if (!review) return null;

  if (review.status !== "ok") {
    return (
      <section
        className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
        data-testid="code-ai-review"
        aria-live="polite"
      >
        {review.message}
      </section>
    );
  }

  return (
    <section
      className="flex flex-col gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950"
      data-testid="code-ai-review"
      aria-live="polite"
    >
      {review.summary ? <p>{review.summary}</p> : null}
      {review.likelyIssue ? (
        <p>
          <span className="font-bold">Likely issue: </span>
          {review.likelyIssue}
        </p>
      ) : null}
      {review.nextHint ? (
        <p>
          <span className="font-bold">Next hint: </span>
          {review.nextHint}
        </p>
      ) : null}
      {review.relatedSkills && review.relatedSkills.length > 0 ? (
        <p className="text-xs text-blue-900">
          <span className="font-bold">Related skills: </span>
          {review.relatedSkills.join(", ")}
        </p>
      ) : null}
      <p className="text-xs text-blue-700">
        AI-generated feedback. Compiler output and test results are the source of truth.
      </p>
    </section>
  );
}
