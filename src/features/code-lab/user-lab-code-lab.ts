/*
 * Server-only resolver for published user-created labs in the Code Lab (#489).
 * Imports the DB query, so it must never be pulled into a client bundle (only
 * code-lab-service / the lab page use it). Hidden tests include their I/O and
 * stay server-side; the client-facing config comes from the pure
 * labPayloadToCodeLabConfig (visible tests only). Mirrors user-exercise-code-lab.
 */

import { getLabForOwner } from "@/features/user-content/user-content-queries";
import { activeLabContract, labPayloadToCodeLabConfig } from "@/features/user-content/lab-code-lab";
import { contentIdFromUserItemId, isUserLearningItemId, userSkillId } from "@/features/user-content/user-content-id";
import type { LabPayload } from "@/features/user-content/lab-content-types";
import type { CodeTestCase, LearningItemCodeLab } from "./code-lab-types";

/** Hidden tests (with I/O) for grading the lab's active contract — server only. */
export function labHiddenTests(payload: LabPayload, milestoneIndex = 0): CodeTestCase[] {
  const contract = activeLabContract(payload, milestoneIndex);
  return (contract?.tests ?? [])
    .filter((t) => t.hidden)
    .map((t) => ({ name: t.name, stdin: t.input, expectedStdout: t.expectedOutput, matcher: "exact" as const }));
}

/**
 * Resolve a published user lab into its Code Lab execution config + hidden tests
 * for the active contract (default the first milestone / single-task), or null
 * when the id is not a published user lab. The skill tag is the owner skill so
 * code attempts credit mastery like native items.
 */
export async function resolveUserLabExecution(
  itemId: string,
  milestoneIndex = 0
): Promise<{ config: LearningItemCodeLab; hiddenTests: CodeTestCase[]; publishedVersionId: string | null } | null> {
  if (!isUserLearningItemId(itemId)) {
    return null;
  }
  const contentId = contentIdFromUserItemId(itemId);
  if (!contentId) {
    return null;
  }
  const detail = await getLabForOwner(contentId);
  const payload = detail?.publishedPayload;
  if (!payload) {
    return null;
  }
  return {
    config: { ...labPayloadToCodeLabConfig(payload, milestoneIndex), skillTags: [userSkillId(contentId)] },
    hiddenTests: labHiddenTests(payload, milestoneIndex),
    publishedVersionId: detail?.publishedVersionId ?? null
  };
}
