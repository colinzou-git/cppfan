// Pure view model for the exercises catalog UI (#128): the typed exercises with
// readable practiced-skill titles. DB-independent and unit-testable.
import { exerciseCatalog, type Exercise } from "./exercise-catalog";
import { skillSeed } from "@/features/skills/skill-seed";

export type ExerciseView = Exercise & { skillTitles: string[] };

export function buildExerciseCatalogView(): ExerciseView[] {
  const titleById = new Map(skillSeed.map((skill) => [skill.id, skill.title]));
  return exerciseCatalog.map((exercise) => ({
    ...exercise,
    skillTitles: exercise.skillIds.map((id) => titleById.get(id) ?? id)
  }));
}
