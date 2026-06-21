"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveRubric, savePeerRubric } from "./rubric-actions";
import {
  RUBRIC_CRITERIA,
  reviewSession,
  type RubricCategory,
  type RubricCriterionId,
  type RubricScore,
  type ScoreBand
} from "./rubric";

type EntrySource = "self" | "peer";

const BAND_STYLE: Record<ScoreBand, string> = {
  strong: "bg-emerald-100 text-emerald-800",
  solid: "bg-blue-100 text-blue-800",
  developing: "bg-amber-100 text-amber-800",
  needs_work: "bg-rose-100 text-rose-800"
};

const BAND_LABEL: Record<ScoreBand, string> = {
  strong: "Strong",
  solid: "Solid",
  developing: "Developing",
  needs_work: "Needs work"
};

const CATEGORY_LABEL: Record<RubricCategory, string> = {
  problem_solving: "Problem solving",
  implementation: "Implementation",
  communication: "Communication",
  process: "Process"
};

const SCORE_OPTIONS = [0, 1, 2, 3, 4] as const;

/**
 * Post-session rubric self-review (#179). The learner scores each of the twelve
 * dimensions separately (0-4); the heat map, category averages, and remediation
 * recompute live from the pure reviewSession. Saving persists self-reported
 * evidence under RLS; signed-out keeps the local view and prompts to sign in.
 */
export function RubricReview({
  initialScores,
  authenticated
}: {
  initialScores: RubricScore[];
  authenticated: boolean;
}) {
  const byEntrySource = useMemo(() => {
    const maps: Record<EntrySource, Partial<Record<RubricCriterionId, number>>> = { self: {}, peer: {} };
    for (const s of initialScores) {
      if (s.source === "self" || s.source === "peer") {
        maps[s.source][s.criterion] = s.score;
      }
    }
    return maps;
  }, [initialScores]);

  // Automated evidence (#178 judge / session) is trusted and read-only here — the
  // rater sees it alongside their own scoring but never edits it.
  const automatedByCriterion = useMemo(() => {
    const map: Partial<Record<RubricCriterionId, number>> = {};
    for (const s of initialScores) {
      if (s.source === "automated") {
        map[s.criterion] = s.score;
      }
    }
    return map;
  }, [initialScores]);

  const [entrySource, setEntrySource] = useState<EntrySource>("self");
  const [scoresBySource, setScoresBySource] = useState(byEntrySource);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();

  const scoresById = scoresBySource[entrySource];

  const enteredScores = useMemo<RubricScore[]>(
    () =>
      RUBRIC_CRITERIA.filter((c) => scoresById[c.id] !== undefined).map((c) => ({
        criterion: c.id,
        score: scoresById[c.id] as number,
        source: entrySource
      })),
    [scoresById, entrySource]
  );

  const review = useMemo(() => reviewSession(enteredScores), [enteredScores]);
  const summaryByCriterion = useMemo(
    () => new Map(review.summaries.map((s) => [s.criterion, s])),
    [review]
  );

  function setScore(id: RubricCriterionId, value: number) {
    setScoresBySource((prev) => ({
      ...prev,
      [entrySource]: { ...prev[entrySource], [id]: value }
    }));
  }

  const sourceLabel = entrySource === "self" ? "self-review" : "peer review";

  function onSave() {
    startTransition(async () => {
      const result = await (entrySource === "self" ? saveRubric(enteredScores) : savePeerRubric(enteredScores));
      if (result.status === "signed_out") {
        setNotice(`Sign in to save this ${sourceLabel}.`);
      } else if (result.status === "error") {
        setNotice(`Could not save your ${sourceLabel} just now.`);
      } else {
        setNotice("Saved.");
      }
    });
  }

  return (
    <div className="grid gap-6" data-testid="rubric-review">
      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-black text-slate-900">Score each dimension</h2>
          <div
            className="flex gap-1 rounded-full bg-slate-100 p-1"
            role="group"
            aria-label="Feedback source"
            data-testid="rubric-source-toggle"
          >
            {(["self", "peer"] as const).map((source) => (
              <Button
                key={source}
                type="button"
                size="sm"
                variant={entrySource === source ? "default" : "secondary"}
                aria-pressed={entrySource === source}
                onClick={() => {
                  setEntrySource(source);
                  setNotice(null);
                }}
                data-testid={`rubric-source-${source}`}
              >
                {source === "self" ? "Self" : "Peer interviewer"}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-xs font-medium text-slate-500">
          {entrySource === "self"
            ? "Your own reflection. Kept separate from peer and automated evidence."
            : "A mock-interview partner's assessment. Stored as a distinct, trusted source."}
        </p>
        <div className="grid gap-2">
          {RUBRIC_CRITERIA.map((criterion) => {
            const summary = summaryByCriterion.get(criterion.id);
            const band = summary?.band ?? null;
            return (
              <div
                key={criterion.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm"
                data-testid="rubric-criterion"
                data-criterion-id={criterion.id}
                data-band={band ?? "unscored"}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900">{criterion.label}</p>
                  <p className="text-xs font-medium text-slate-500">{CATEGORY_LABEL[criterion.category]}</p>
                </div>
                {band ? (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${BAND_STYLE[band]}`}>
                    {BAND_LABEL[band]}
                  </span>
                ) : null}
                {automatedByCriterion[criterion.id] !== undefined ? (
                  <span
                    className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800"
                    title="Automated evidence from the judge/session (read-only)"
                    data-testid="rubric-automated-score"
                    data-criterion-id={criterion.id}
                  >
                    Auto {automatedByCriterion[criterion.id]}
                  </span>
                ) : null}
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="sr-only">{criterion.label} score</span>
                  <select
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
                    value={scoresById[criterion.id] ?? ""}
                    onChange={(event) => setScore(criterion.id, Number(event.target.value))}
                    data-testid="rubric-score-select"
                    aria-label={`${criterion.label} score`}
                  >
                    <option value="" disabled>
                      —
                    </option>
                    {SCORE_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-2" data-testid="rubric-categories">
        <h2 className="text-lg font-black text-slate-900">Category averages</h2>
        {Object.keys(review.categoryAverages).length === 0 ? (
          <p className="text-sm text-slate-600">Score a few dimensions to see your category breakdown.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(Object.entries(review.categoryAverages) as [RubricCategory, number][]).map(([category, avg]) => (
              <span
                key={category}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700"
                data-testid="rubric-category"
                data-category-id={category}
              >
                {CATEGORY_LABEL[category]}: {avg.toFixed(1)}
              </span>
            ))}
          </div>
        )}
      </section>

      {review.remediation.length > 0 ? (
        <section className="grid gap-2" data-testid="rubric-remediation">
          <h2 className="text-lg font-black text-slate-900">Where to focus</h2>
          <ul className="grid gap-2">
            {review.remediation.map((item) => (
              <li
                key={item.criterion}
                className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
                data-testid="rubric-remediation-item"
                data-criterion-id={item.criterion}
              >
                <p className="font-bold">
                  {item.label} · {item.average.toFixed(1)}
                </p>
                <p className="mt-1 text-rose-800">{item.advice}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={onSave} disabled={saving || enteredScores.length === 0} data-testid="rubric-save">
          {saving ? "Saving…" : entrySource === "self" ? "Save self-review" : "Save peer review"}
        </Button>
        {notice ? (
          <p className="text-sm font-semibold text-amber-700" role="status" data-testid="rubric-notice">
            {notice}
          </p>
        ) : null}
      </div>

      {!authenticated ? (
        <p className="text-xs font-medium text-slate-500">Sign in to save your review across sessions.</p>
      ) : null}
    </div>
  );
}
