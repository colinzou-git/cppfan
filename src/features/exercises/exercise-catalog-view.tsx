"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setExercise } from "./exercise-actions";
import type { ExerciseStatus } from "./exercise-evidence";
import type { ExerciseView } from "./exercise-view";
import type { ExerciseProgress } from "./exercise-progress";
import {
  buildGroupedExerciseView,
  statusProgressPct,
  type ExerciseRowView
} from "./exercise-grouped-view";

type Entry = { status: ExerciseStatus; completed_at: string | null };

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : date.toISOString().slice(0, 10);
}

/**
 * Redesigned Exercises catalog (#447): a grouped accordion list with one shared
 * right-side detail panel. Each top-level row is an exercise group; expanding it
 * reveals single-select child exercises. The detail panel shows the selected
 * exercise's title, description, learning goals, and a primary Study button to the
 * full-screen Code Lab. Start/Complete progress actions live in the table columns.
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
  const [progress, setProgress] = useState<Record<string, Entry>>(() =>
    Object.fromEntries(
      initialProgress.map((p) => [p.exercise_id, { status: p.status, completed_at: p.completed_at }])
    )
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Fold live progress into the grouped model so the table reflects edits.
  const groups = useMemo(() => {
    const progressRows: ExerciseProgress[] = Object.entries(progress).map(([exercise_id, entry]) => ({
      exercise_id,
      status: entry.status,
      reflection: null,
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

  function apply(exerciseId: string, status: ExerciseStatus) {
    setNotice(null);
    setPendingId(exerciseId);
    startTransition(async () => {
      const result = await setExercise({ exerciseId, status, reflection: null });
      setPendingId(null);
      if (result.status === "ok") {
        setProgress((prev) => ({
          ...prev,
          [exerciseId]: {
            status,
            completed_at: status === "completed" ? new Date().toISOString() : null
          }
        }));
      } else if (result.status === "signed_out") {
        setNotice("Sign in to save your exercise progress.");
      } else {
        setNotice("Could not save that just now. Please try again.");
      }
    });
  }

  return (
    <section className="grid gap-4" data-testid="exercise-catalog" aria-label="Write-code exercises">
      <p className="text-sm text-slate-600">
        Pick a group, choose an exercise, then open it in the built-in Code Lab to write, run, and test
        your C++.
      </p>

      {notice ? (
        <p className="text-sm font-semibold text-amber-700" role="alert" data-testid="exercise-notice">
          {notice}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/85" data-testid="exercise-table">
          <div className="grid grid-cols-[1fr_8rem_5rem_6rem] gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">
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
                  className="grid w-full grid-cols-[1fr_8rem_5rem_6rem] items-center gap-2 px-4 py-3 text-left hover:bg-slate-50"
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
                  <span className="text-sm text-slate-600">
                    {group.startedCount}/{group.totalCount}
                  </span>
                  <span className="text-sm text-slate-600">{formatDate(group.completeDate)}</span>
                </button>

                {expanded
                  ? group.exercises.map((row) => (
                      <ChildRow
                        key={row.id}
                        row={row}
                        groupTitle={group.title}
                        selected={selectedChildId === row.id}
                        pending={pendingId === row.id}
                        onSelect={() => setSelectedChildId(row.id)}
                        onStart={() => apply(row.id, "started")}
                        onComplete={() => apply(row.id, "completed")}
                      />
                    ))
                  : null}
              </div>
            );
          })}
        </div>

        <DetailPanel group={selected?.group.title ?? null} child={selected?.child ?? null} />
      </div>

      {!authenticated ? (
        <p className="text-xs font-medium text-slate-500">Sign in to save exercise progress across sessions.</p>
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
  pending,
  onSelect,
  onStart,
  onComplete
}: {
  row: ExerciseRowView;
  groupTitle: string;
  selected: boolean;
  pending: boolean;
  onSelect: () => void;
  onStart: () => void;
  onComplete: () => void;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_8rem_5rem_6rem] items-center gap-2 border-t border-slate-100 px-4 py-2",
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
      <ProgressCell pct={statusProgressPct(row.status)} />
      <span>
        {row.status === "none" ? (
          <Button type="button" size="sm" onClick={onStart} disabled={pending} data-testid="exercise-start">
            Start
          </Button>
        ) : (
          <span className="text-xs font-semibold text-slate-400">Started</span>
        )}
      </span>
      <span className="text-sm text-slate-600">
        {row.status === "completed" ? (
          formatDate(row.completeDate)
        ) : row.status === "started" ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onComplete}
            disabled={pending}
            data-testid="exercise-complete"
          >
            Complete
          </Button>
        ) : (
          "—"
        )}
      </span>
    </div>
  );
}

function DetailPanel({ group, child }: { group: string | null; child: ExerciseRowView | null }) {
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
      <Button asChild size="lg" data-testid="exercise-study">
        <Link href={`/lab/${encodeURIComponent(child.id)}`}>
          <Code2 className="h-4 w-4" aria-hidden="true" />
          Study
        </Link>
      </Button>
    </aside>
  );
}
