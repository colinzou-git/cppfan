"use client";

import { useState } from "react";
import type { UserContentEvaluationResult } from "@/features/user-content/user-content-evaluation";

const METHOD_LABEL: Record<string, string> = {
  ai_evaluation: "AI rubric evaluation",
  automated_plus_ai: "Automated tests + AI review",
  judge_plus_ai: "Judge + AI review"
};

/**
 * Formal AI / combined evaluation submission (#609) — the AUTHORITATIVE completion
 * action for the selected mode, distinct from the optional AI help/review panel.
 * For combined modes the deterministic objective is authoritative, so optimistic
 * AI can never flip a fail to a pass; a provider outage yields a retryable
 * "unavailable" outcome, never a pass. The submit handler is injected so the
 * component is fully testable without the server action.
 */
export function AiEvaluationPanel({
  mode,
  onSubmit
}: {
  mode: string;
  onSubmit: () => Promise<UserContentEvaluationResult>;
}) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<UserContentEvaluationResult | null>(null);
  const [error, setError] = useState("");

  async function submit() {
    setPending(true);
    setError("");
    try {
      setResult(await onSubmit());
    } catch {
      setError("Could not submit. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className="flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4"
      data-testid="ai-evaluation-panel"
      aria-labelledby="ai-eval-heading"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
          Evaluation method: {METHOD_LABEL[mode] ?? "formal evaluation"}
        </p>
        <h2 id="ai-eval-heading" className="mt-0.5 text-sm font-black text-indigo-950">
          Submit for evaluation
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Run your latest code through the author-approved evaluation. This is the formal completion
          check — separate from the optional AI help below.
        </p>
      </div>

      <button
        type="button"
        onClick={() => void submit()}
        disabled={pending}
        className="self-start rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {pending ? "Evaluating…" : "Submit for evaluation"}
      </button>

      {error ? <p className="text-xs font-semibold text-rose-700">{error}</p> : null}

      {result ? (
        <div
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${
            result.completionCredited
              ? "bg-emerald-100 text-emerald-900"
              : result.status === "unavailable"
                ? "bg-amber-100 text-amber-900"
                : "bg-slate-100 text-slate-700"
          }`}
          role="status"
          data-testid="ai-evaluation-result"
        >
          {result.nextAction}
        </div>
      ) : null}
    </section>
  );
}
