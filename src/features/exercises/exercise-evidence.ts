// Pure write-code evidence mapping (#128). Maps an exercise + progress status to
// the skill events recorded for it: code_attempted on start, code_passed on
// completion, once per practiced skill. Reuses the stable event names (no new
// schema). DB-independent and unit-testable. Evidence only — never declares
// mastery and is separate from FSRS scheduling.
import type { SkillEventName } from "@/features/events/event-names";
import type { RecordSkillEventInput } from "@/features/events/event-service";
import { getExerciseById } from "./exercise-catalog";

export type ExerciseStatus = "started" | "completed";

/** Skill events for an exercise transition; empty for an unknown exercise. */
export function writeCodeEvents(exerciseId: string, status: ExerciseStatus): RecordSkillEventInput[] {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) {
    return [];
  }
  const eventType: SkillEventName = status === "completed" ? "code_passed" : "code_attempted";
  return exercise.skillIds.map((skillId) => ({ eventType, skillId }));
}
