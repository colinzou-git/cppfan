// Derived grouped view model for the redesigned Exercises page (#447). Groups the
// flat exercise catalog by primary topic and folds in per-learner progress so the
// accordion UI is pure presentation. Derived only — the canonical exercise catalog
// is unchanged. DB-independent and unit-testable.
import type { ExerciseView } from "./exercise-view";
import type { ExerciseProgress } from "./exercise-progress";
import type { ExerciseStatus } from "./exercise-evidence";

export type ExerciseRowStatus = ExerciseStatus | "none";

export type ExerciseRowView = ExerciseView & {
  status: ExerciseRowStatus;
  progressPct: number;
  startDate: string | null;
  completeDate: string | null;
  description: string;
  learningGoals: string[];
};

export type ExerciseGroupView = {
  id: string;
  title: string;
  badge: string;
  exercises: ExerciseRowView[];
  progressPct: number;
  startedCount: number;
  totalCount: number;
  startDate: string | null;
  completeDate: string | null;
};

// Progress percent per status. `started` is a deliberate midpoint so a group with
// some work-in-progress reads as partially advanced.
const STARTED_PCT = 50;

export function statusProgressPct(status: ExerciseRowStatus): number {
  if (status === "completed") return 100;
  if (status === "started") return STARTED_PCT;
  return 0;
}

const FALLBACK_GROUP = "General";

/** Primary topic for an exercise: its first practiced skill title, else fallback. */
function groupTitleFor(exercise: ExerciseView): string {
  return exercise.skillTitles[0] ?? FALLBACK_GROUP;
}

function groupId(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "general";
}

function groupBadge(title: string): string {
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
  return initials || title.slice(0, 2).toUpperCase();
}

function deriveDescription(exercise: ExerciseView): string {
  const skills = exercise.skillTitles.join(", ");
  return `Practice ${skills || "core skills"} by completing this write-code exercise in the Code Lab.`;
}

function buildRow(exercise: ExerciseView, progress: ExerciseProgress | undefined): ExerciseRowView {
  const status: ExerciseRowStatus = progress?.status ?? "none";
  return {
    ...exercise,
    status,
    progressPct: statusProgressPct(status),
    startDate: progress?.started_at ?? null,
    completeDate: status === "completed" ? (progress?.completed_at ?? null) : null,
    description: deriveDescription(exercise),
    learningGoals: exercise.skillTitles
  };
}

/** Latest ISO date among the inputs, or null when none are present. */
function latestDate(dates: (string | null)[]): string | null {
  const present = dates.filter((d): d is string => d !== null);
  if (present.length === 0) return null;
  return present.reduce((latest, d) => (d > latest ? d : latest));
}

/** Earliest ISO date among the inputs, or null when none are present. */
function earliestDate(dates: (string | null)[]): string | null {
  const present = dates.filter((d): d is string => d !== null);
  if (present.length === 0) return null;
  return present.reduce((earliest, d) => (d < earliest ? d : earliest));
}

export function buildGroupedExerciseView(
  views: ExerciseView[],
  progress: ExerciseProgress[]
): ExerciseGroupView[] {
  const progressById = new Map(progress.map((p) => [p.exercise_id, p]));
  const byGroup = new Map<string, ExerciseRowView[]>();

  for (const view of views) {
    const title = groupTitleFor(view);
    const row = buildRow(view, progressById.get(view.id));
    const list = byGroup.get(title) ?? [];
    list.push(row);
    byGroup.set(title, list);
  }

  const groups: ExerciseGroupView[] = [];
  for (const [title, rows] of byGroup) {
    const totalCount = rows.length;
    const startedCount = rows.filter((r) => r.status !== "none").length;
    const progressPct = Math.round(rows.reduce((sum, r) => sum + r.progressPct, 0) / totalCount);
    const allComplete = rows.every((r) => r.status === "completed");
    groups.push({
      id: groupId(title),
      title,
      badge: groupBadge(title),
      exercises: rows,
      progressPct,
      startedCount,
      totalCount,
      startDate: earliestDate(rows.map((r) => r.startDate)),
      completeDate: allComplete ? latestDate(rows.map((r) => r.completeDate)) : null
    });
  }

  // Stable, readable ordering: by group title.
  groups.sort((a, b) => a.title.localeCompare(b.title));
  return groups;
}
