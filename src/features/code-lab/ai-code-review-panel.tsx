"use client";

import type { StructuredCodeFeedback } from "./code-feedback-types";
import { CodeFeedbackPanel } from "./code-feedback-panel";

export function AiCodeReviewPanel({
  review,
  pending
}: {
  review: StructuredCodeFeedback | null;
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

  if (review.status === "unavailable") {
    return (
      <section
        className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
        data-testid="code-ai-review"
        aria-live="polite"
      >
        {review.learnerMessage}
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-blue-950"
      data-testid="code-ai-review"
      aria-live="polite"
    >
      <CodeFeedbackPanel feedback={review} tone="review" />
    </section>
  );
}
