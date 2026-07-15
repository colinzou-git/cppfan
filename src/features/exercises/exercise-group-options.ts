// #488 GAP B: the native exercise-group vocabulary, derived from the static
// catalog. A user-created exercise may be assigned to one of these native topic
// groups (validated by slug) or to a custom owner group. Pure + catalog-derived.
import { buildExerciseCatalogView } from "./exercise-view";
import { exerciseGroupSlug } from "./exercise-grouped-view";

export type ExerciseGroupOption = { id: string; title: string };

/** Distinct native topic groups (slug + display title), sorted by title. */
export function nativeExerciseGroupOptions(): ExerciseGroupOption[] {
  const byId = new Map<string, string>();
  for (const view of buildExerciseCatalogView()) {
    const title = view.skillTitles[0] ?? "General";
    byId.set(exerciseGroupSlug(title), title);
  }
  return [...byId.entries()]
    .map(([id, title]) => ({ id, title }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

/** True when `id` names a native topic group. */
export function isNativeExerciseGroupId(id: string): boolean {
  if (typeof id !== "string" || id.length === 0) return false;
  return nativeExerciseGroupOptions().some((g) => g.id === id);
}

/** Native group title for a slug, or null when it is not a native group id. */
export function nativeExerciseGroupTitle(id: string): string | null {
  return nativeExerciseGroupOptions().find((g) => g.id === id)?.title ?? null;
}
