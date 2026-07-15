/*
 * Server-only resolver for published user-created exercises in the Code Lab
 * (#488). Imports the DB query, so it must never be pulled into a client bundle
 * (only code-lab-service / the lab page use it). Hidden tests include their I/O
 * and stay server-side; the client-facing config comes from the pure
 * exercisePayloadToCodeLabConfig (visible tests only).
 */

import { getExerciseForOwner } from "@/features/user-content/user-content-queries";
import { exercisePayloadToCodeLabConfig } from "@/features/user-content/exercise-code-lab";
import { contentIdFromUserItemId, isUserLearningItemId, userSkillId } from "@/features/user-content/user-content-id";
import type { ExercisePayload } from "@/features/user-content/exercise-content-types";
import type { CodeTestCase, LearningItemCodeLab } from "./code-lab-types";

/** Hidden tests (with I/O) for grading a user exercise — server-side only. */
export function exerciseHiddenTests(payload: ExercisePayload): CodeTestCase[] {
  return (payload.tests ?? [])
    .filter((t) => t.hidden)
    .map((t) => ({ name: t.name, stdin: t.input, expectedStdout: t.expectedOutput, matcher: "exact" as const }));
}

/**
 * Resolve a published user exercise into its Code Lab execution config + hidden
 * tests, or null when the id is not a published user exercise. The skill tag is
 * the owner skill so code attempts credit mastery like native items.
 */
export async function resolveUserExerciseExecution(
  itemId: string
): Promise<{ config: LearningItemCodeLab; hiddenTests: CodeTestCase[] } | null> {
  if (!isUserLearningItemId(itemId)) {
    return null;
  }
  const contentId = contentIdFromUserItemId(itemId);
  if (!contentId) {
    return null;
  }
  const detail = await getExerciseForOwner(contentId);
  const payload = detail?.publishedPayload;
  if (!payload) {
    return null;
  }
  return {
    config: { ...exercisePayloadToCodeLabConfig(payload), skillTags: [userSkillId(contentId)] },
    hiddenTests: exerciseHiddenTests(payload)
  };
}
