"use server";

import { revalidatePath } from "next/cache";
import { setExerciseProgress } from "./exercise-progress";
import type { ExerciseStatus } from "./exercise-evidence";
import type { ExerciseActionResult } from "./exercise-action-types";

/**
 * Set the signed-in learner's status for one write-code exercise (start /
 * complete, with an optional reflection). Records code_attempted / code_passed
 * evidence; never auto-declares mastery. `signed_out` lets the UI prompt to sign
 * in instead of failing.
 */
export async function setExercise(input: {
  exerciseId: string;
  status: ExerciseStatus;
  reflection?: string | null;
}): Promise<ExerciseActionResult> {
  const exerciseId = typeof input?.exerciseId === "string" ? input.exerciseId : "";
  const status: ExerciseStatus = input?.status === "completed" ? "completed" : "started";
  if (!exerciseId) {
    return { status: "error" };
  }

  const outcome = await setExerciseProgress({
    exerciseId,
    status,
    reflection: typeof input?.reflection === "string" ? input.reflection : null
  });

  if (outcome === "ok") {
    revalidatePath("/exercises");
    return { status: "ok" };
  }
  if (outcome === "signed_out") {
    return { status: "signed_out" };
  }
  return { status: "error" };
}
