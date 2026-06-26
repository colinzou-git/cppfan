"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { startExercise } from "./exercise-actions";
import type { ExerciseStatus } from "./exercise-evidence";
import type { ExerciseView } from "./exercise-view";
import type { ExerciseProgress } from "./exercise-progress";
import { buildGroupedExerciseView, type ExerciseRowView } from "./exercise-grouped-view";

type Entry = { status: ExerciseStatus; started_at: string | null; completed_at: string | null };

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : date.toISOString().slice(0, 10);
}

/**
 * Redesigned Exercises catalog (#447, #472): a grouped accordion list with one
 * shared right-side detail panel. The Start and Complete columns show real dates
 * — Start is the first Study-click (`started_at`), Complete is the auto-complete
 * from a passing real Code Lab test (`completed_at`). Clicking Study records the
 * start date (preserving any existing start/completion) and opens the Code Lab.
 */
export function ExerciseCatalogView({
  exercises,
  initialProgress,
  authenticated
}: {
  exercises: ExerciseView[];
  initialProgress: ExerciseProgress[];
  authenticated: boolean;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState<Record<string, Entry>>(() =>
    Object.fromEntries(
      initialProgress.map((p) => [
        p.exercise_id,
        { status: p.status, started_at: p.started_at, completed_at: p.completed_at }
      ])
    )
  );

  // Fold live progress into the grouped model so the table reflects edits.
  const groups = useMemo(() => {
    const progressRows: ExerciseProgress[] = Object.entries(progress).map(([exercise_id, entry]) => ({
      exercise_id,
      status: entry.status,
      reflection: null,
      started_at: entry.started_at,
      completed_at: entry.completed_at
    }));
    return buildGroupedExerciseView(exercises, progressRows);
  }, [exercises, progress]);

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(() => groups[0]?.id ?? null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    () => groups[0]?.exercises[0]?.id ?? null
  );

  const selected = useMemo(() => {
    for (const group of groups) {
      const child = group.exercises.find((row) => row.id === selectedChildId);
      if (child) return { group, child };
    }
    return null;
  }, [groups, selectedChildId]);

  function selectGroup(groupId: string) {
    setExpandedGroupId((current) => (current === groupId ? null : groupId));
  }

  function handleStudy(exerciseId: string) {
    // Record the first Study click as the start date (best-effort, preserving any
    // existing start/completion), then navigate regardless of the outcome.
    void startExercise({ exerciseId })
      .then((result) => {
        if (result.status === "ok") {
          setProgress((prev) => {
            const entry = prev[exerciseId];
            if (entry?.started_at) return prev; // keep the first start date
            return {
              ...prev,
              [exerciseId]: {
                status: entry?.status ?? "started",
                started_at: entry?.started_at ?? new Date().toISOString(),
                completed_at: entry?.completed_at ?? null
              }
            };
          });
        }
      })
      .catch(() => {});
    router.push(`/lab/${encodeURIComponent(exerciseId)}`);
  }

  return (
    <section className="grid gap-4" data-testid="exercise-catalog" aria-label="Write-code exercises">
      <p className="text-sm text-slate-600">
        Pick a group, choose an exercise, then open it in the built-in Code Lab to write, run, and test
        your C++.
      </p>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/85" data-testid="exercise-table">
          <div className="grid grid-cols-[1fr_8rem_6rem_6rem] gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <span>Exercise</span>
            <span>Progress</span>
            <span>Start</span>
            <span>Complete</span>
          </div>

          {groups.map((group) => {
            const expanded = expandedGroupId === group.id;
            return (
              <div key={group.id} data-testid="exercise-group" data-group-id={group.id}>
                <button
                  type="button"
                  onClick={() => selectGroup(group.id)}
                  aria-expanded={expanded}
                  className="grid w-full grid-cols-[1fr_8rem_6rem_6rem] items-center gap-2 px-4 py-3 text-left hover:bg-slate-50"
                  data-testid="exercise-group-row"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    )}
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-indigo-100 text-[11px] font-black text-indigo-700">
                      {group.badge}
                    </span>
                    <span className="truncate font-bold text-slate-900">{group.title}</span>
                  </span>
                  <ProgressCell pct={group.progressPct} />
                  <span className="text-sm text-slate-600">{formatDate(group.startDate)}</span>
                  <span className="text-sm text-slate-600">{formatDate(group.completeDate)}</span>
                </button>

                {expanded
                  ? group.exercises.map((row) => (
                      <ChildRow
                        key={row.id}
                        row={row}
                        groupTitle={group.title}
                        selected={selectedChildId === row.id}
                        onSelect={() => setSelectedChildId(row.id)}
                      />
                    ))
                  : null}
              </div>
            );
          })}
        </div>

        <DetailPanel
          group={selected?.group.title ?? null}
          child={selected?.child ?? null}
          onStudy={handleStudy}
        />
      </div>

      {!authenticated ? (
        <p className="text-xs font-medium text-slate-500" data-testid="exercise-signed-out-note">
          Sign in to save exercise progress across sessions.
        </p>
      ) : null}
    </section>
  );
}

function ProgressCell({ pct }: { pct: number }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
        <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </span>
      <span className="text-xs font-bold text-slate-600">{pct}%</span>
    </span>
  );
}

function ChildRow({
  row,
  groupTitle,
  selected,
  onSelect
}: {
  row: ExerciseRowView;
  groupTitle: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_8rem_6rem_6rem] items-center gap-2 border-t border-slate-100 px-4 py-2",
        selected && "bg-blue-50"
      )}
      data-testid="exercise-child-row"
      data-exercise-id={row.id}
    >
      <label className="flex min-w-0 items-center gap-2 pl-6">
        <input
          type="radio"
          name="exercise-row"
          checked={selected}
          onChange={onSelect}
          aria-label={`Select ${groupTitle} / ${row.title}`}
          data-testid="exercise-child-radio"
        />
        <span className="truncate text-sm text-slate-800">{row.title}</span>
      </label>
      <ProgressCell pct={row.progressPct} />
      <span className="text-sm text-slate-600" data-testid="exercise-start-date">
        {formatDate(row.startDate)}
      </span>
      <span className="text-sm text-slate-600" data-testid="exercise-complete-date">
        {formatDate(row.completeDate)}
      </span>
    </div>
  );
}

function DetailPanel({
  group,
  child,
  onStudy
}: {
  group: string | null;
  child: ExerciseRowView | null;
  onStudy: (exerciseId: string) => void;
}) {
  if (!group || !child) {
    return (
      <aside
        className="rounded-2xl border border-slate-200 bg-white/85 p-4 text-sm text-slate-500"
        data-testid="exercise-detail"
      >
        Select an exercise to see its details.
      </aside>
    );
  }
  return (
    <aside className="grid h-fit gap-3 rounded-2xl border border-slate-200 bg-white/85 p-4" data-testid="exercise-detail">
      <h2 className="text-base font-black text-slate-900" data-testid="exercise-detail-title">
        {group} / {child.title}
      </h2>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Description</h3>
        <p className="mt-1 text-sm text-slate-700">{child.description}</p>
      </div>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Learning goals</h3>
        <ul className="mt-1 grid gap-1">
          {child.learningGoals.map((goal) => (
            <li key={goal} className="text-sm text-slate-700">
              • {goal}
            </li>
          ))}
        </ul>
      </div>
      <Button
        type="button"
        size="lg"
        onClick={() => onStudy(child.id)}
        data-testid="exercise-study"
        data-exercise-id={child.id}
      >
        <Code2 className="h-4 w-4" aria-hidden="true" />
        Study
      </Button>
    </aside>
  );
}
