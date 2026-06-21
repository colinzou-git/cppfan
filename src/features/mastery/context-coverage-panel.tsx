import { Check, Circle } from "lucide-react";
import { MASTERY_EVIDENCE_CONTEXTS, type MasteryEvidenceContext, type SkillContextCoverage } from "./context-coverage-types";
import { explainMissingCoverage } from "./context-coverage-explanations";

/**
 * Compact cross-context coverage breakdown (#417). Shown where mastery details
 * are displayed; it explains what evidence is present and what is still missing.
 */

const CONTEXT_LABELS: Record<MasteryEvidenceContext, string> = {
  recognition: "Recognition",
  code_reading: "Code reading",
  bug_spotting: "Bug spotting",
  completion: "Completion",
  parsons: "Parsons",
  code_lab: "Code Lab",
  project_milestone: "Project milestone",
  delayed_review: "Delayed review"
};

export function ContextCoveragePanel({ coverage }: { coverage: SkillContextCoverage }) {
  const missing = explainMissingCoverage(coverage);

  return (
    <section
      className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3"
      data-testid="context-coverage"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Evidence contexts</p>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {MASTERY_EVIDENCE_CONTEXTS.map((context) => {
          const done = coverage.contexts[context].count > 0;
          return (
            <li
              key={context}
              className="flex items-center gap-1.5 text-xs text-slate-700"
              data-testid="context-coverage-item"
              data-context={context}
              data-covered={done}
            >
              {done ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
              )}
              <span>
                {CONTEXT_LABELS[context]}: {done ? "done" : "needs practice"}
              </span>
            </li>
          );
        })}
      </ul>
      {missing.length > 0 ? (
        <ul className="flex flex-col gap-0.5 text-xs text-slate-600" data-testid="context-coverage-missing">
          {missing.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
