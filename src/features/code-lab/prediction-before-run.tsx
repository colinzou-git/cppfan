"use client";

import { Lightbulb } from "lucide-react";
import type {
  CodePredictionComparison,
  CodePredictionPrompt
} from "./prediction-types";

/**
 * Prediction-before-run panel (#413). Renders prompts above Run/Test and, after
 * a run, the comparison of each prediction to the actual result. Controlled by
 * the parent so typed predictions persist across code edits.
 */
export function PredictionBeforeRun({
  prompts,
  values,
  onChange,
  comparisons,
  required,
  missingRequired
}: {
  prompts: CodePredictionPrompt[];
  values: Record<string, string>;
  onChange: (promptId: string, value: string) => void;
  comparisons: CodePredictionComparison[] | null;
  required: boolean;
  missingRequired: boolean;
}) {
  if (prompts.length === 0) return null;

  const comparisonById = new Map((comparisons ?? []).map((c) => [c.promptId, c]));

  return (
    <section
      className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3"
      data-testid="prediction-before-run"
    >
      <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
        <Lightbulb className="h-4 w-4" aria-hidden="true" />
        Predict before you run
      </p>

      {prompts.map((prompt) => {
        const comparison = comparisonById.get(prompt.id);
        return (
          <label key={prompt.id} className="flex flex-col gap-1 text-sm text-amber-950">
            <span className="font-medium">
              {prompt.label}
              {prompt.required ? <span className="text-amber-700"> *</span> : null}
            </span>
            <input
              type="text"
              value={values[prompt.id] ?? ""}
              placeholder={prompt.placeholder}
              onChange={(event) => onChange(prompt.id, event.target.value)}
              className="rounded-lg border border-amber-300 bg-white px-2 py-1 text-sm"
              data-testid="prediction-input"
              data-prompt-id={prompt.id}
            />
            {comparison ? (
              <span
                className={`text-xs ${
                  comparison.status === "matched"
                    ? "text-emerald-700"
                    : comparison.status === "mismatched"
                      ? "text-amber-800"
                      : "text-slate-600"
                }`}
                data-testid="prediction-comparison"
                data-status={comparison.status}
              >
                {comparison.explanation}
              </span>
            ) : null}
          </label>
        );
      })}

      {required && missingRequired ? (
        <p className="text-xs font-bold text-amber-800" data-testid="prediction-required-note">
          Fill in the required prediction(s) above to enable Run.
        </p>
      ) : null}
    </section>
  );
}
