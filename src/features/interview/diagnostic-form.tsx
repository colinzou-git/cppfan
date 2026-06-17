"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveDiagnostic } from "./diagnostic-actions";
import { buildHeatMap, type AreaLevel } from "./diagnostic";

export type DiagnosticSectionOption = { id: string; title: string };

const LEVEL_STYLE: Record<AreaLevel, string> = {
  interview_ready: "bg-emerald-100 text-emerald-800",
  practice_under_time: "bg-amber-100 text-amber-800",
  refresh_first: "bg-rose-100 text-rose-800"
};

const LEVEL_LABEL: Record<AreaLevel, string> = {
  interview_ready: "Interview ready",
  practice_under_time: "Practice under time",
  refresh_first: "Refresh first"
};

const RATINGS = [0, 1, 2, 3, 4] as const;

/**
 * Records the learner's baseline diagnostic self-assessment (#175/#182): a 0-4
 * rating per section that maps to a [0,1] score. The per-area heat map (never a
 * single pass/fail) recomputes live from the pure buildHeatMap; saving persists
 * the baseline under RLS, and signed-out keeps the local view with a sign-in note.
 */
export function DiagnosticForm({
  sections,
  initialScores,
  authenticated
}: {
  sections: DiagnosticSectionOption[];
  initialScores: Record<string, number>;
  authenticated: boolean;
}) {
  const initialRatings = useMemo(() => {
    const map: Record<string, number> = {};
    for (const section of sections) {
      const score = initialScores[section.id];
      if (typeof score === "number") {
        map[section.id] = Math.round(score * 4);
      }
    }
    return map;
  }, [sections, initialScores]);

  const [ratings, setRatings] = useState<Record<string, number>>(initialRatings);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();

  const scores = useMemo(() => {
    const map: Record<string, number> = {};
    for (const [id, rating] of Object.entries(ratings)) {
      map[id] = rating / 4;
    }
    return map;
  }, [ratings]);

  const heatBySection = useMemo(() => new Map(buildHeatMap(scores).map((e) => [e.sectionId, e])), [scores]);
  const hasAnyRating = Object.keys(ratings).length > 0;

  function onSave() {
    startTransition(async () => {
      const result = await saveDiagnostic(scores);
      if (result.status === "signed_out") {
        setNotice("Sign in to save your baseline diagnostic.");
      } else if (result.status === "error") {
        setNotice("Could not save your diagnostic just now.");
      } else {
        setNotice("Saved.");
      }
    });
  }

  return (
    <div className="grid gap-3" data-testid="diagnostic-form">
      <h2 className="text-lg font-black text-slate-900">Rate each area (baseline)</h2>
      <div className="grid gap-2">
        {sections.map((section) => {
          const entry = heatBySection.get(section.id);
          const level = entry && ratings[section.id] !== undefined ? entry.level : null;
          return (
            <div
              key={section.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm"
              data-testid="diagnostic-section-row"
              data-section-id={section.id}
              data-level={level ?? "unrated"}
            >
              <span className="min-w-0 flex-1 font-semibold text-slate-800">{section.title}</span>
              {level ? (
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${LEVEL_STYLE[level]}`}>
                  {LEVEL_LABEL[level]}
                </span>
              ) : null}
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="sr-only">{section.title} rating</span>
                <select
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
                  value={ratings[section.id] ?? ""}
                  onChange={(e) => setRatings((prev) => ({ ...prev, [section.id]: Number(e.target.value) }))}
                  data-testid="diagnostic-rating-select"
                  aria-label={`${section.title} rating`}
                >
                  <option value="" disabled>
                    —
                  </option>
                  {RATINGS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={onSave} disabled={saving || !hasAnyRating} data-testid="diagnostic-save">
          {saving ? "Saving…" : "Save baseline"}
        </Button>
        {notice ? (
          <p className="text-sm font-semibold text-amber-700" role="status" data-testid="diagnostic-notice">
            {notice}
          </p>
        ) : null}
      </div>

      {!authenticated ? (
        <p className="text-xs font-medium text-slate-600">Sign in to save your baseline across sessions.</p>
      ) : null}
    </div>
  );
}
