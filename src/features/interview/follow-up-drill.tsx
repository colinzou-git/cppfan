"use client";

import { useMemo, useState } from "react";
import { decideFollowUpDelivery, gradeFollowUp, type FollowUpCredit } from "./follow-up-delivery";

const CREDIT_STYLE: Record<FollowUpCredit, string> = {
  full: "bg-emerald-100 text-emerald-800",
  partial: "bg-amber-100 text-amber-800",
  none: "bg-rose-100 text-rose-800"
};

const CREDIT_LABEL: Record<FollowUpCredit, string> = {
  full: "Full credit",
  partial: "Partial credit",
  none: "No credit"
};

/**
 * Adaptation drill for a timed session (#181). Deterministically delivers a
 * reviewed follow-up for the problem given the learner's first solution and the
 * minutes left, keeping the original solution visible (adaptation, not retyping).
 * A short self-assessment grades the adaptation by reasoning, with partial credit
 * when implementation time expires. No live generation; no migration.
 */
export function FollowUpDrill({ problemId, durationMinutes }: { problemId: string; durationMinutes: number }) {
  const [baseSolutionCorrect, setBaseSolutionCorrect] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(Math.max(5, Math.round(durationMinutes / 3)));

  const [explainedImpactBeforeEdit, setExplained] = useState(false);
  const [reasoningCorrect, setReasoningCorrect] = useState(false);
  const [implementationComplete, setImplementationComplete] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

  const delivery = useMemo(
    () => decideFollowUpDelivery(problemId, { baseSolutionCorrect, minutesRemaining }),
    [problemId, baseSolutionCorrect, minutesRemaining]
  );

  const outcome = useMemo(
    () => gradeFollowUp({ explainedImpactBeforeEdit, reasoningCorrect, implementationComplete, timeExpired }),
    [explainedImpactBeforeEdit, reasoningCorrect, implementationComplete, timeExpired]
  );

  return (
    <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm" data-testid="follow-up-drill">
      <div>
        <h2 className="text-lg font-black text-slate-900">Adaptation drill</h2>
        <p className="text-sm text-slate-600">
          Keep your original solution visible — a follow-up tests whether you can adapt the reasoning,
          not retype code. Reviewed variants only; nothing is generated live.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <input
            type="checkbox"
            checked={baseSolutionCorrect}
            onChange={(e) => setBaseSolutionCorrect(e.target.checked)}
            data-testid="drill-base-correct"
          />
          My base solution is correct
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          Minutes left
          <input
            type="number"
            min={0}
            value={minutesRemaining}
            onChange={(e) => setMinutesRemaining(Math.max(0, Math.trunc(Number(e.target.value) || 0)))}
            className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-normal"
            data-testid="drill-minutes"
          />
        </label>
      </div>

      <div
        className="rounded-xl border border-blue-200 bg-blue-50 p-3"
        data-testid="drill-delivery"
        data-mode={delivery.mode}
      >
        {delivery.mode === "follow_up" ? (
          <div className="grid gap-1">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
              Follow-up · {delivery.followUp.kind.replaceAll("_", " ")} · ~{delivery.followUp.timeBudgetMinutes} min
            </p>
            <p className="font-semibold text-slate-900" data-testid="drill-prompt">
              {delivery.followUp.prompt}
            </p>
            <p className="text-sm text-slate-700">Changed constraints: {delivery.followUp.affectedConstraints}</p>
            <p className="text-sm text-slate-700">Expected shift: {delivery.followUp.expectedReasoningShift}</p>
          </div>
        ) : (
          <p className="text-sm font-semibold text-slate-700">{delivery.reason}</p>
        )}
      </div>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-bold text-slate-800">Self-assess your adaptation</legend>
        <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-700">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={explainedImpactBeforeEdit} onChange={(e) => setExplained(e.target.checked)} data-testid="drill-explained" />
            Explained the impact before editing
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={reasoningCorrect} onChange={(e) => setReasoningCorrect(e.target.checked)} data-testid="drill-reasoning" />
            Reasoning is correct
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={implementationComplete} onChange={(e) => setImplementationComplete(e.target.checked)} data-testid="drill-impl" />
            Implementation finished
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={timeExpired} onChange={(e) => setTimeExpired(e.target.checked)} data-testid="drill-expired" />
            Time expired
          </label>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-2" data-testid="drill-outcome" data-credit={outcome.credit}>
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${CREDIT_STYLE[outcome.credit]}`}>
          {CREDIT_LABEL[outcome.credit]}
        </span>
        <span className="text-sm text-slate-700">{outcome.reason}</span>
      </div>
    </section>
  );
}
