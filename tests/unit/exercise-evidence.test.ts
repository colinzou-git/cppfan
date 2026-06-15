import { describe, expect, it } from "vitest";
import { writeCodeEvents } from "@/features/exercises/exercise-evidence";
import { buildExerciseCatalogView } from "@/features/exercises/exercise-view";
import { getExerciseById } from "@/features/exercises/exercise-catalog";

// Write-code evidence + catalog view (#128). Evidence reuses the stable
// code_attempted / code_passed names, once per practiced skill.

describe("writeCodeEvents (#128)", () => {
  const exercise = getExerciseById("raii-scoped-array")!;

  it("emits code_attempted on start, once per practiced skill", () => {
    const events = writeCodeEvents("raii-scoped-array", "started");
    expect(events.length).toBe(exercise.skillIds.length);
    expect(events.every((e) => e.eventType === "code_attempted")).toBe(true);
    expect(events.map((e) => e.skillId)).toEqual(exercise.skillIds);
  });

  it("emits code_passed on completion", () => {
    const events = writeCodeEvents("raii-scoped-array", "completed");
    expect(events.every((e) => e.eventType === "code_passed")).toBe(true);
    expect(events.length).toBe(exercise.skillIds.length);
  });

  it("emits nothing for an unknown exercise", () => {
    expect(writeCodeEvents("does-not-exist", "started")).toEqual([]);
  });
});

describe("buildExerciseCatalogView (#128)", () => {
  it("resolves practiced-skill ids to readable titles", () => {
    const view = buildExerciseCatalogView();
    expect(view.length).toBeGreaterThan(0);
    for (const exercise of view) {
      expect(exercise.skillTitles.length).toBe(exercise.skillIds.length);
    }
    const raii = view.find((e) => e.id === "raii-scoped-array")!;
    // Titles are resolved (not the raw dotted skill id).
    expect(raii.skillTitles[0]).not.toBe(raii.skillIds[0]);
  });
});
