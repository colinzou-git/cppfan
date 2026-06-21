"use client";

import type { CodeFeedbackNextAction, StructuredCodeFeedback } from "./code-feedback-types";
import { WEAK_EVIDENCE_NOTE } from "./code-feedback-types";

const NEXT_ACTION_LABELS: Record<CodeFeedbackNextAction, string> = {
  retry_current_code: "Try again with your current code",
  trace_with_ai: "Trace your code with AI",
  try_boundary_case_checklist: "Work through a boundary-case checklist",
  review_related_skill: "Review a related skill",
  try_completion_scaffold: "Try a completion scaffold",
  try_parsons_scaffold: "Try a Parsons scaffold",
  continue_next_item: "Continue to the next item"
};

/**
 * Renders structured Code Lab AI feedback (#410). Shared by AI Review and AI
 * Trace. Always shows the advisory weak-evidence note so a learner never reads
 * AI tags as grading.
 */
export function CodeFeedbackPanel({
  feedback,
  tone = "review"
}: {
  feedback: StructuredCodeFeedback;
  tone?: "review" | "trace";
}) {
  if (feedback.status === "unavailable") {
    return (
      <p className="text-sm text-slate-700" data-testid="code-feedback">
        {feedback.learnerMessage}
      </p>
    );
  }

  const accent = tone === "trace" ? "text-violet-800" : "text-blue-900";

  return (
    <div className="flex flex-col gap-2 text-sm" data-testid="code-feedback">
      {feedback.summary ? <p>{feedback.summary}</p> : <p>{feedback.learnerMessage}</p>}

      {feedback.likelyIssue ? (
        <p>
          <span className="font-bold">Likely issue: </span>
          {feedback.likelyIssue}
        </p>
      ) : null}

      {feedback.relatedSkills.length > 0 ? (
        <p className={`text-xs ${accent}`}>
          <span className="font-bold">Related skills: </span>
          {feedback.relatedSkills.join(", ")}
        </p>
      ) : null}

      {feedback.nextAction ? (
        <p className="text-xs" data-testid="code-feedback-next-action">
          <span className="font-bold">Suggested next: </span>
          {NEXT_ACTION_LABELS[feedback.nextAction]}
        </p>
      ) : null}

      {feedback.errorTags.length > 0 ? (
        <p className="flex flex-wrap gap-1" data-testid="code-feedback-tags">
          {feedback.errorTags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600"
            >
              {tag}
            </span>
          ))}
        </p>
      ) : null}

      <p className="text-xs text-slate-500">
        Confidence: {feedback.confidence}. {WEAK_EVIDENCE_NOTE}
      </p>
    </div>
  );
}
