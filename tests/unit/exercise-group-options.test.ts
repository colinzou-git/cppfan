import { describe, expect, it } from "vitest";
import {
  nativeExerciseGroupOptions,
  isNativeExerciseGroupId,
  nativeExerciseGroupTitle
} from "@/features/exercises/exercise-group-options";
import { exerciseGroupSlug } from "@/features/exercises/exercise-grouped-view";

describe("native exercise group vocabulary (#488)", () => {
  it("derives distinct, slug-keyed, title-sorted options from the catalog", () => {
    const opts = nativeExerciseGroupOptions();
    expect(opts.length).toBeGreaterThan(0);
    // ids are unique
    const ids = opts.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    // each id is the slug of its title
    for (const o of opts) {
      expect(o.id).toBe(exerciseGroupSlug(o.title));
    }
    // sorted by title
    const titles = opts.map((o) => o.title);
    expect([...titles].sort((a, b) => a.localeCompare(b))).toEqual(titles);
  });

  it("validates native group ids and resolves their titles", () => {
    const first = nativeExerciseGroupOptions()[0];
    expect(isNativeExerciseGroupId(first.id)).toBe(true);
    expect(nativeExerciseGroupTitle(first.id)).toBe(first.title);
    expect(isNativeExerciseGroupId("definitely-not-a-group")).toBe(false);
    expect(nativeExerciseGroupTitle("definitely-not-a-group")).toBeNull();
    expect(isNativeExerciseGroupId("")).toBe(false);
  });
});
