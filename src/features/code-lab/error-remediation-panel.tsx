"use client";

import { useState } from "react";
import { Compass, X } from "lucide-react";
import type {
  CodeRemediationAction,
  CodeRemediationRecommendation
} from "./error-remediation-types";

const ACTION_CTA: Record<CodeRemediationAction, string> = {
  use_boundary_checklist: "Open the boundary-case checklist",
  trace_with_ai: "Trace with AI",
  try_completion_item: "Try a completion exercise",
  try_parsons_item: "Try a Parsons exercise",
  review_related_skill: "Review the related skill",
  retry_code_lab: "Retry in the Code Lab"
};

/**
 * Shows a single, explainable, dismissible remediation recommendation (#414).
 * Never hard-locks the learner — it can always be dismissed.
 */
export function ErrorRemediationPanel({
  recommendation,
  onAction
}: {
  recommendation: CodeRemediationRecommendation | null;
  onAction?: (recommendation: CodeRemediationRecommendation) => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (!recommendation || dismissed) return null;

  return (
    <section
      className="flex flex-col gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3"
      data-testid="code-remediation"
      data-priority={recommendation.priority}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-900">
          <Compass className="h-4 w-4" aria-hidden="true" />
          Recommended next: {recommendation.title}
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss recommendation"
          className="rounded p-0.5 text-emerald-700 hover:bg-emerald-100"
          data-testid="code-remediation-dismiss"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p className="text-xs text-emerald-900">Reason: {recommendation.reason}</p>
      <button
        type="button"
        onClick={() => onAction?.(recommendation)}
        className="w-fit rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
        data-testid="code-remediation-action"
      >
        {ACTION_CTA[recommendation.action]}
      </button>
    </section>
  );
}
