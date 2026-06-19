import type { GoalEvaluationFinding } from "./evaluation-engine";

const LABEL: Record<GoalEvaluationFinding["status"], string> = {
  ready_to_advance: "Ready to advance",
  developing: "Developing",
  needs_prerequisite_support: "Needs prerequisite support",
  evidence_uncertain: "Evidence uncertain",
  probably_familiar: "Probably familiar"
};

export function EvaluationResults({ findings }: { findings: GoalEvaluationFinding[] }) {
  return (
    <div className="grid gap-3" data-testid="goal-evaluation-findings">
      {findings.map((finding) => (
        <article key={finding.moduleId} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-black text-slate-950">{finding.moduleId}</h3>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-900">
              {LABEL[finding.status]}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-700">
            Estimate band {finding.estimateBand} of 5 · {finding.confidence} confidence · {finding.evidenceCount} observations
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{finding.reasonCodes.join(" · ")}</p>
        </article>
      ))}
    </div>
  );
}
