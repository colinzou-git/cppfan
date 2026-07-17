"use client";

import { useState } from "react";
import type { UserContentEvaluationResult } from "@/features/user-content/user-content-evaluation";

/**
 * Formal self-evaluation submission for a self_evaluation user item (#609). This
 * is the AUTHORITATIVE completion action for the selected mode — distinct from
 * the optional AI help/review panel. The learner makes an intentional rating +
 * optional reflection; a "complete" rating credits completion as explicitly
 * weaker evidence than objective tests. The submit handler is injected so the
 * component is fully testable without the server action.
 */
export function SelfEvaluationPanel({
  onSubmit
}: {
  onSubmit: (rating: "not_yet" | "partial" | "complete", reflection: string) => Promise<UserContentEvaluationResult>;
}) {
  const [rating, setRating] = useState<"not_yet" | "partial" | "complete">("complete");
  const [reflection, setReflection] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<UserContentEvaluationResult | null>(null);
  const [error, setError] = useState("");

  async function submit() {
    setPending(true);
    setError("");
    try {
      setResult(await onSubmit(rating, reflection.trim()));
    } catch {
      setError("Could not submit. Try again.");
    } finally {
      setPending(false);
    }
  }

  const ratings: { value: "not_yet" | "partial" | "complete"; label: string }[] = [
    { value: "complete", label: "I'm confident this is complete and correct" },
    { value: "partial", label: "Partially done — some cases still fail" },
    { value: "not_yet", label: "Not yet — I need more work" }
  ];

  return (
    <section
      className="flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4"
      data-testid="self-evaluation-panel"
      aria-labelledby="self-eval-heading"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">Evaluation method: self-assessment</p>
        <h2 id="self-eval-heading" className="mt-0.5 text-sm font-black text-indigo-950">
          Submit your self-evaluation
        </h2>
      </div>

      <fieldset className="flex flex-col gap-1.5" disabled={pending}>
        {ratings.map((r) => (
          <label key={r.value} className="flex items-center gap-2 text-sm text-slate-800">
            <input
              type="radio"
              name="self-eval-rating"
              value={r.value}
              checked={rating === r.value}
              onChange={() => setRating(r.value)}
            />
            {r.label}
          </label>
        ))}
      </fieldset>

      <label className="grid gap-1 text-xs font-semibold text-slate-600">
        Reflection (optional)
        <textarea
          className="min-h-16 rounded-lg border border-slate-300 px-2 py-1 text-sm font-normal text-slate-800"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="What did you learn? What is still uncertain?"
          disabled={pending}
        />
      </label>

      <button
        type="button"
        onClick={() => void submit()}
        disabled={pending}
        className="self-start rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit evaluation"}
      </button>

      {error ? <p className="text-xs font-semibold text-rose-700">{error}</p> : null}

      {result ? (
        <div
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${
            result.completionCredited ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-700"
          }`}
          role="status"
          data-testid="self-evaluation-result"
        >
          {result.nextAction}
        </div>
      ) : null}
    </section>
  );
}
