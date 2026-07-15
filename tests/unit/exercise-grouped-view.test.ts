import { describe, expect, it } from "vitest";
import {
  buildGroupedExerciseView,
  statusProgressPct
} from "@/features/exercises/exercise-grouped-view";
import type { ExerciseView } from "@/features/exercises/exercise-view";
import type { ExerciseProgress } from "@/features/exercises/exercise-progress";

function view(id: string, skillTitles: string[]): ExerciseView {
  return {
    id,
    title: `Exercise ${id}`,
    skillIds: skillTitles,
    difficulty: "beginner",
    estimatedMinutes: 10,
    editableFiles: [],
    requiredTests: [],
    hints: [],
    projectLab: "lab",
    skillTitles
  };
}

function progress(
  id: string,
  status: ExerciseProgress["status"],
  completed_at: string | null,
  started_at: string | null = "2026-06-01T00:00:00Z"
): ExerciseProgress {
  return { exercise_id: id, status, reflection: null, started_at, completed_at };
}

describe("exercise grouped view (#447)", () => {
  it("maps status to progress percent (none 0, started 50, completed 100)", () => {
    expect(statusProgressPct("none")).toBe(0);
    expect(statusProgressPct("started")).toBe(50);
    expect(statusProgressPct("completed")).toBe(100);
  });

  it("groups by primary skill title with a badge and derived fields", () => {
    const groups = buildGroupedExerciseView([view("a", ["Loops"]), view("b", ["Loops"])], []);
    expect(groups).toHaveLength(1);
    const group = groups[0];
    expect(group.title).toBe("Loops");
    expect(group.badge).toBe("L");
    expect(group.totalCount).toBe(2);
    expect(group.startedCount).toBe(0);
    expect(group.progressPct).toBe(0);
    expect(group.exercises[0].description).toContain("Loops");
    expect(group.exercises[0].learningGoals).toEqual(["Loops"]);
  });

  it("derives group progress as the rounded average of child rows", () => {
    const groups = buildGroupedExerciseView(
      [view("a", ["Trees"]), view("b", ["Trees"])],
      [progress("a", "completed", "2026-06-01T00:00:00Z")]
    );
    // (100 + 0) / 2 = 50
    expect(groups[0].progressPct).toBe(50);
    expect(groups[0].startedCount).toBe(1);
  });

  it("includes the child start date and the earliest group start date (#472)", () => {
    const groups = buildGroupedExerciseView(
      [view("a", ["Loops"]), view("b", ["Loops"])],
      [
        progress("a", "started", null, "2026-06-05T00:00:00Z"),
        progress("b", "completed", "2026-06-10T00:00:00Z", "2026-06-03T00:00:00Z")
      ]
    );
    const rows = groups[0].exercises;
    expect(rows.find((r) => r.id === "a")?.startDate).toBe("2026-06-05T00:00:00Z");
    expect(rows.find((r) => r.id === "b")?.startDate).toBe("2026-06-03T00:00:00Z");
    // Group start date is the earliest child start date.
    expect(groups[0].startDate).toBe("2026-06-03T00:00:00Z");
  });

  it("group start date is null when no child has started (#472)", () => {
    const groups = buildGroupedExerciseView([view("a", ["DP"])], []);
    expect(groups[0].startDate).toBeNull();
  });

  it("shows a child completion date only when completed", () => {
    const groups = buildGroupedExerciseView(
      [view("a", ["Graphs"]), view("b", ["Graphs"])],
      [progress("a", "completed", "2026-06-02T00:00:00Z"), progress("b", "started", null)]
    );
    const rows = groups[0].exercises;
    expect(rows.find((r) => r.id === "a")?.completeDate).toBe("2026-06-02T00:00:00Z");
    expect(rows.find((r) => r.id === "b")?.completeDate).toBeNull();
  });

  it("group completion date is the latest child date only when all complete", () => {
    const partial = buildGroupedExerciseView(
      [view("a", ["DP"]), view("b", ["DP"])],
      [progress("a", "completed", "2026-06-01T00:00:00Z")]
    );
    expect(partial[0].completeDate).toBeNull();

    const allDone = buildGroupedExerciseView(
      [view("a", ["DP"]), view("b", ["DP"])],
      [progress("a", "completed", "2026-06-01T00:00:00Z"), progress("b", "completed", "2026-06-03T00:00:00Z")]
    );
    expect(allDone[0].completeDate).toBe("2026-06-03T00:00:00Z");
  });

  it("falls back to a General group when an exercise has no skill title", () => {
    const groups = buildGroupedExerciseView([view("a", [])], []);
    expect(groups[0].title).toBe("General");
    expect(groups[0].id).toBe("general");
  });

  it("orders groups by title", () => {
    const groups = buildGroupedExerciseView([view("a", ["Zebra"]), view("b", ["Alpha"])], []);
    expect(groups.map((g) => g.title)).toEqual(["Alpha", "Zebra"]);
  });

  it("collects user-created exercises into a badged \"Your exercises\" group, ordered first (#488)", () => {
    const nativeA: ExerciseView = view("a", ["Arrays"]);
    const userX: ExerciseView = { ...view("user.item.c1", ["strings"]), source: "user" };
    const groups = buildGroupedExerciseView([nativeA, userX], []);
    expect(groups[0].source).toBe("user");
    expect(groups[0].title).toBe("Your exercises");
    expect(groups[0].exercises.map((r) => r.id)).toContain("user.item.c1");
    const native = groups.find((g) => g.title === "Arrays");
    expect(native?.source).toBe("native");
  });

});
