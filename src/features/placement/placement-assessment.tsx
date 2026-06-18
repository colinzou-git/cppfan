"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { resetPlacement, submitPlacement } from "./placement-actions";
import {
  INITIAL_PLACEMENT_QUESTION_COUNT,
  MAX_PLACEMENT_QUESTION_COUNT,
  PLACEMENT_QUESTION_BATCH_SIZE
} from "./placement-seed";
import type { PlacementModuleResult } from "./placement-scoring";
import type { PlacementQuestion, StoredPlacementResult } from "./placement-queries";

const LEVEL_LABEL: Record<PlacementModuleResult["level"], string> = {
  start_here: "Start here",
  review_soon: "Review soon",
  probably_familiar: "Probably familiar"
};

const LEVEL_ORDER: PlacementModuleResult["level"][] = ["start_here", "review_soon", "probably_familiar"];

const LEVEL_STYLE: Record<PlacementModuleResult["level"], string> = {
  start_here: "border-blue-300 bg-blue-50 text-blue-950",
  review_soon: "border-amber-300 bg-amber-50 text-amber-950",
  probably_familiar: "border-emerald-300 bg-emerald-50 text-emerald-950"
};

function ResultList({ results }: { results: PlacementModuleResult[] }) {
  return (
    <div className="grid gap-4" data-testid="placement-results">
      {LEVEL_ORDER.map((level) => {
        const inLevel = results.filter((r) => r.level === level);
        if (inLevel.length === 0) {
          return null;
        }
        return (
          <section key={level} className="grid gap-2">
            <h3 className="text-sm font-bold text-slate-700">{LEVEL_LABEL[level]}</h3>
            <ul className="grid gap-2">
              {inLevel.map((r) => (
                <li
                  key={r.module_id}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${LEVEL_STYLE[level]}`}
                >
                  <span className="font-bold">{r.title}</span>
                  <span className="mt-1 block text-xs font-medium opacity-80">{r.reason}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function PlacementAssessment({
  questions,
  initialResults,
  authenticated
}: {
  questions: PlacementQuestion[];
  initialResults: StoredPlacementResult[];
  authenticated: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<PlacementModuleResult[] | null>(null);
  const [persisted, setPersisted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(INITIAL_PLACEMENT_QUESTION_COUNT, questions.length, MAX_PLACEMENT_QUESTION_COUNT)
  );
  const [isPending, startTransition] = useTransition();

  const answeredCount = Object.keys(answers).length;
  const hasStored = initialResults.length > 0;
  const maxVisible = Math.min(questions.length, MAX_PLACEMENT_QUESTION_COUNT);
  const visibleQuestions = questions.slice(0, visibleCount);
  const remainingQuestionCount = maxVisible - visibleCount;
  const nextQuestionBatchSize = Math.min(PLACEMENT_QUESTION_BATCH_SIZE, Math.max(0, remainingQuestionCount));

  function onSubmit() {
    setError(null);
    startTransition(async () => {
      const response = await submitPlacement({ answers });
      if (response.status !== "ok") {
        setError("Placement is temporarily unavailable. Please try again in a moment.");
        return;
      }
      setResults(response.results);
      setPersisted(response.persisted);
    });
  }

  function onRetake() {
    setAnswers({});
    setResults(null);
    setError(null);
    setVisibleCount(Math.min(INITIAL_PLACEMENT_QUESTION_COUNT, questions.length, MAX_PLACEMENT_QUESTION_COUNT));
  }

  function onReset() {
    setError(null);
    startTransition(async () => {
      const response = await resetPlacement();
      if (response.status !== "ok") {
        setError("Could not reset your placement results. Please try again.");
        return;
      }
      setAnswers({});
      setResults(null);
      setVisibleCount(Math.min(INITIAL_PLACEMENT_QUESTION_COUNT, questions.length, MAX_PLACEMENT_QUESTION_COUNT));
    });
  }

  if (results) {
    return (
      <div className="grid gap-4" data-testid="placement-complete">
        <p className="text-sm font-semibold text-slate-700">
          Placement is a suggestion, not a lock — explore any module whenever you like.
        </p>
        {!persisted && authenticated ? (
          <p className="text-sm font-semibold text-amber-700" role="alert">
            We could not save your results, but here is your suggested start.
          </p>
        ) : null}
        {!authenticated ? (
          <p className="text-xs font-medium text-slate-500">Sign in to save your placement across sessions.</p>
        ) : null}
        <ResultList results={results} />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={onRetake} data-testid="placement-retake">
            Retake
          </Button>
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5" data-testid="placement-assessment">
      <p className="text-sm text-slate-600">
        Answer what you can — skip anything you are unsure about. This optional check suggests where to
        start. It never locks content or changes your mastery.
      </p>
      <p className="text-xs font-semibold text-slate-500" data-testid="placement-question-count">
        Showing {visibleQuestions.length} of {maxVisible} placement questions.
      </p>

      {hasStored ? (
        <p className="text-xs font-medium text-slate-500" data-testid="placement-has-stored">
          You have a saved placement. Submitting again updates it; Reset clears it.
        </p>
      ) : null}

      <ol className="grid gap-5">
        {visibleQuestions.map((q, index) => (
          <li key={q.itemId}>
            <fieldset className="grid gap-2">
              <legend className="text-sm font-semibold text-slate-800">
                {index + 1}. {q.prompt}
                <span className="ml-1 text-xs font-medium text-slate-400">({q.moduleTitle})</span>
              </legend>
              <div className="grid gap-2">
                {q.choices.map((choice) => {
                  const isSelected = answers[q.itemId] === choice.id;
                  return (
                    <label
                      key={choice.id}
                      className={[
                        "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                        isSelected
                          ? "border-blue-300 bg-blue-50 text-blue-950"
                          : "border-slate-200 bg-white text-slate-800 hover:border-blue-200"
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name={`placement-${q.itemId}`}
                        value={choice.id}
                        checked={isSelected}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.itemId]: choice.id }))}
                        className="h-4 w-4"
                      />
                      {choice.content}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>

      {error ? (
        <p className="text-sm font-semibold text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onSubmit} disabled={isPending} data-testid="placement-submit">
          {isPending ? "Scoring…" : `See my suggestions${answeredCount > 0 ? ` (${answeredCount})` : ""}`}
        </Button>
        {nextQuestionBatchSize > 0 ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setVisibleCount((count) => Math.min(count + PLACEMENT_QUESTION_BATCH_SIZE, maxVisible))}
            disabled={isPending}
            data-testid="placement-show-more"
          >
            Add {nextQuestionBatchSize} more questions
          </Button>
        ) : null}
        {authenticated && hasStored ? (
          <Button type="button" variant="secondary" onClick={onReset} disabled={isPending} data-testid="placement-reset">
            Reset saved results
          </Button>
        ) : null}
        <Button asChild variant="ghost">
          <Link href="/dashboard" data-testid="placement-skip">
            Skip for now
          </Link>
        </Button>
      </div>
    </div>
  );
}
