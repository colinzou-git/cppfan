"use client";

import { useState, useTransition } from "react";
import { ItemHelpLinks } from "@/components/item-help-links";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setExercise } from "./exercise-actions";
import type { ExerciseStatus } from "./exercise-evidence";
import type { ExerciseView } from "./exercise-view";
import type { ExerciseProgress } from "./exercise-progress";

type Entry = { status: ExerciseStatus; reflection: string | null };

const STATUS_LABEL: Record<ExerciseStatus | "none", string> = {
  none: "Not started",
  started: "In progress",
  completed: "Tests passed"
};

export function ExerciseCatalogView({
  exercises,
  initialProgress,
  authenticated
}: {
  exercises: ExerciseView[];
  initialProgress: ExerciseProgress[];
  authenticated: boolean;
}) {
  const [progress, setProgress] = useState<Record<string, Entry>>(() =>
    Object.fromEntries(initialProgress.map((p) => [p.exercise_id, { status: p.status, reflection: p.reflection }]))
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const draftFor = (id: string) => drafts[id] ?? progress[id]?.reflection ?? "";

  function apply(exerciseId: string, status: ExerciseStatus, reflection: string | null) {
    setNotice(null);
    setPendingId(exerciseId);
    startTransition(async () => {
      const result = await setExercise({ exerciseId, status, reflection });
      setPendingId(null);
      if (result.status === "ok") {
        setProgress((prev) => ({ ...prev, [exerciseId]: { status, reflection } }));
      } else if (result.status === "signed_out") {
        setNotice("Sign in to save your exercise progress.");
      } else {
        setNotice("Could not save that just now. Please try again.");
      }
    });
  }

  return (
    <section className="grid gap-4" data-testid="exercise-catalog" aria-label="Write-code exercises">
      <div>
        <h2 className="text-xl font-black text-slate-900">Write-code exercises</h2>
        <p className="text-sm text-slate-600">
          Test-backed C++ exercises you build in a Codespace or your own editor — cppFan never runs
          your code. Reference solutions in the public repo are honor-system material.
        </p>
      </div>

      {notice ? (
        <p className="text-sm font-semibold text-amber-700" role="alert" data-testid="exercise-notice">
          {notice}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {exercises.map((exercise) => {
        const entry = progress[exercise.id] as Entry | undefined;
        const status: ExerciseStatus | "none" = entry ? entry.status : "none";
        const isPending = pendingId === exercise.id;
        const isOpen = openId === exercise.id;
        const reflection = draftFor(exercise.id);
        return (
          <article
            key={exercise.id}
            className={cn(
              "grid min-w-0 gap-3 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm",
              isOpen && "lg:col-span-2"
            )}
            data-testid="exercise-card"
            data-exercise-id={exercise.id}
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900">{exercise.title}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-600">
                {exercise.difficulty}
              </span>
              <span className="text-xs font-medium text-slate-400">~{exercise.estimatedMinutes} min</span>
              <span
                className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${
                  status === "completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : status === "started"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-slate-100 text-slate-600"
                }`}
                data-testid="exercise-status"
              >
                {STATUS_LABEL[status]}
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {exercise.skillTitles.map((title) => (
                <span key={title} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-900">
                  {title}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpenId(isOpen ? null : exercise.id)}
                aria-expanded={isOpen}
                data-testid="exercise-instructions-toggle"
              >
                {isOpen ? "Hide instructions" : "Open instructions"}
              </Button>
              <ItemHelpLinks
                context={{
                  schemaVersion: 1,
                  sourceKind: "write_code_exercise",
                  sourceId: exercise.id,
                  sourceVersion: "1",
                  title: exercise.title,
                  prompt: `Complete the ${exercise.title} C++ exercise and pass its repository tests.`,
                  topic: exercise.skillTitles.join(", "),
                  instructions: [
                    `Prepare a working copy with scripts/exercises/prepare.sh ${exercise.id}.`,
                    `Edit ${exercise.editableFiles.join(", ")}.`,
                    `Run scripts/exercises/test.sh ${exercise.id}.`,
                    ...exercise.hints.map((hint) => `Hint available to the learner: ${hint}`)
                  ],
                  learnerDraft: reflection || undefined,
                  assessmentState:
                    status === "completed" ? "completed" : status === "started" ? "answered" : "unanswered",
                  revealPolicy: "normal",
                  metadata: {
                    difficulty: exercise.difficulty,
                    estimatedMinutes: exercise.estimatedMinutes
                  }
                }}
              />
            </div>

            {isOpen ? (
              <div className="grid gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700" data-testid="exercise-instructions">
                <p>
                  Open this repository in a GitHub Codespace (or clone it locally). On iPhone, use the
                  GitHub app or open the Codespace in your mobile browser.
                </p>
                <ol className="ml-4 list-decimal">
                  <li>
                    Prepare a working copy: <code>scripts/exercises/prepare.sh {exercise.id}</code>
                  </li>
                  <li>
                    Edit: <code>{exercise.editableFiles.join(", ")}</code>
                  </li>
                  <li>
                    Run the tests: <code>scripts/exercises/test.sh {exercise.id}</code>
                  </li>
                </ol>
                {exercise.hints.length > 0 ? (
                  <details>
                    <summary className="cursor-pointer font-semibold">Hints</summary>
                    <ul className="ml-4 list-disc">
                      {exercise.hints.map((hint) => (
                        <li key={hint}>{hint}</li>
                      ))}
                    </ul>
                  </details>
                ) : null}
                <p className="text-xs text-slate-500">
                  Mark it complete only after the tests pass for you — this is self-reported and never
                  declares mastery on its own.
                </p>
              </div>
            ) : null}

            {status !== "none" ? (
              <textarea
                className="min-h-[3rem] rounded-lg border border-slate-200 px-2 py-1 text-sm"
                placeholder="Your reflection (optional)"
                aria-label={`Reflection for ${exercise.title}`}
                value={reflection}
                readOnly={status === "completed"}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [exercise.id]: e.target.value }))}
                data-testid="exercise-reflection"
              />
            ) : null}

            <div className="flex flex-wrap gap-2">
              {status === "none" ? (
                <Button
                  type="button"
                  onClick={() => apply(exercise.id, "started", null)}
                  disabled={isPending}
                  data-testid="exercise-start"
                >
                  Start exercise
                </Button>
              ) : null}
              {status === "started" ? (
                <Button
                  type="button"
                  onClick={() => apply(exercise.id, "completed", reflection || null)}
                  disabled={isPending}
                  data-testid="exercise-complete"
                >
                  Mark tests passed
                </Button>
              ) : null}
              {status === "completed" ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => apply(exercise.id, "started", progress[exercise.id]?.reflection ?? null)}
                  disabled={isPending}
                  data-testid="exercise-reopen"
                >
                  Reopen
                </Button>
              ) : null}
            </div>
          </article>
        );
      })}
      </div>

      {!authenticated ? (
        <p className="text-xs font-medium text-slate-500">Sign in to save exercise progress across sessions.</p>
      ) : null}
    </section>
  );
}
