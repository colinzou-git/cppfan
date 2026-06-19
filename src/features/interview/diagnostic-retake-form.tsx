"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveDiagnostic } from "./diagnostic-actions";
import { buildHeatMap, type AreaLevel } from "./diagnostic";
import { diagnosticRetakeAvailability } from "./target-profile";

export type DiagnosticSectionOption = { id: string; title: string };

const STYLES: Record<AreaLevel, string> = {
  interview_ready: "bg-emerald-100 text-emerald-800",
  practice_under_time: "bg-amber-100 text-amber-800",
  refresh_first: "bg-rose-100 text-rose-800"
};
const LABELS: Record<AreaLevel, string> = {
  interview_ready: "Interview ready",
  practice_under_time: "Practice under time",
  refresh_first: "Refresh first"
};
const RATINGS = [0, 1, 2, 3, 4] as const;

export function DiagnosticRetakeForm({ sections, initialScores, authenticated, lastCompletedAt }: {
  sections: DiagnosticSectionOption[];
  initialScores: Record<string, number>;
  authenticated: boolean;
  lastCompletedAt: string | null;
}) {
  const initialRatings = useMemo(() => Object.fromEntries(
    sections.flatMap((section) => typeof initialScores[section.id] === "number"
      ? [[section.id, Math.round(initialScores[section.id] * 4)]]
      : [])
  ), [sections, initialScores]);

  const [ratings, setRatings] = useState<Record<string, number>>(initialRatings);
  const [lastCompletedMs, setLastCompletedMs] = useState(lastCompletedAt ? Date.parse(lastCompletedAt) : null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();

  const scores = useMemo(() => Object.fromEntries(
    Object.entries(ratings).map(([id, rating]) => [id, rating / 4])
  ), [ratings]);
  const heat = useMemo(() => new Map(buildHeatMap(scores).map((entry) => [entry.sectionId, entry])), [scores]);
  const complete = sections.every((section) => ratings[section.id] !== undefined);
  const availability = diagnosticRetakeAvailability(lastCompletedMs, Date.now());
  const isRetake = lastCompletedMs !== null;

  function save() {
    if (!authenticated) {
      setNotice("Sign in to save your diagnostic.");
      return;
    }
    startTransition(async () => {
      const result = await saveDiagnostic(scores, `${Date.now()}-${sections.map((section) => ratings[section.id]).join("")}`);
      if (result.status === "ok") {
        setLastCompletedMs(Date.now());
        setNotice(isRetake ? "Retake saved." : "Baseline saved.");
      } else if (result.status === "retake_not_ready") {
        setNotice(`Next retake available ${new Date(result.nextAllowedAtMs).toLocaleDateString()}.`);
      } else if (result.status === "signed_out") {
        setNotice("Sign in to save your diagnostic.");
      } else {
        setNotice("Could not save your diagnostic just now.");
      }
    });
  }

  return (
    <div className="grid gap-3" data-testid="diagnostic-form">
      <div>
        <h2 className="text-lg font-black text-slate-900">Rate each area</h2>
        <p className="text-sm text-slate-600">Complete all four ratings before an authenticated save. Saved retakes are spaced at least seven days apart.</p>
      </div>
      <div className="grid gap-2">
        {sections.map((section) => {
          const level = ratings[section.id] === undefined ? null : heat.get(section.id)?.level ?? null;
          return (
            <div key={section.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm" data-testid="diagnostic-section-row" data-section-id={section.id} data-level={level ?? "unrated"}>
              <span className="min-w-0 flex-1 font-semibold text-slate-800">{section.title}</span>
              {level ? <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STYLES[level]}`}>{LABELS[level]}</span> : null}
              <select aria-label={`${section.title} rating`} className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm" data-testid="diagnostic-rating-select" value={ratings[section.id] ?? ""} onChange={(event) => setRatings((previous) => ({ ...previous, [section.id]: Number(event.target.value) }))}>
                <option value="" disabled>—</option>
                {RATINGS.map((rating) => <option key={rating} value={rating}>{rating}</option>)}
              </select>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={save} disabled={saving || (authenticated && (!complete || !availability.allowed))} data-testid="diagnostic-save">
          {saving ? "Saving…" : isRetake ? "Save retake" : "Save baseline"}
        </Button>
        {notice ? <p role="status" className="text-sm font-semibold text-amber-700" data-testid="diagnostic-notice">{notice}</p> : null}
      </div>
      {!complete ? <p className="text-xs text-slate-600">Rate every area before an authenticated save.</p> : null}
      {authenticated && !availability.allowed && availability.nextAllowedAtMs !== null ? (
        <p className="text-xs text-slate-600" data-testid="diagnostic-retake-date">Next retake available {new Date(availability.nextAllowedAtMs).toLocaleDateString()}.</p>
      ) : null}
      {!authenticated ? <p className="text-xs text-slate-600">Sign in to save results and retake history.</p> : null}
    </div>
  );
}
