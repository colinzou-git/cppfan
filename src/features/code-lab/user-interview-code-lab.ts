/*
 * Server-only resolver for published user-created interview problems in the Code
 * Lab (#490). Imports the DB query, so it must never be pulled into a client
 * bundle (only code-lab-service / the lab page use it). Hidden tests include
 * their I/O and stay server-side (the fixed reveal policy keeps them hidden); the
 * client-facing config comes from the pure interviewPayloadToCodeLabConfig
 * (visible tests only). Mirrors user-exercise-code-lab / user-lab-code-lab.
 */

import { getInterviewForOwner } from "@/features/user-content/user-content-queries";
import { interviewPayloadToCodeLabConfig } from "@/features/user-content/interview-code-lab";
import { contentIdFromUserItemId, isUserLearningItemId, userSkillId } from "@/features/user-content/user-content-id";
import type { InterviewProblemPayload } from "@/features/user-content/interview-content-types";
import type { CodeTestCase, LearningItemCodeLab } from "./code-lab-types";

/** Hidden tests (with I/O) for grading an interview problem — server-side only. */
export function interviewHiddenTests(payload: InterviewProblemPayload): CodeTestCase[] {
  return (payload.tests ?? [])
    .filter((t) => t.hidden)
    .map((t) => ({ name: t.name, stdin: t.input, expectedStdout: t.expectedOutput, matcher: "exact" as const }));
}

/**
 * Resolve a published user interview problem into its Code Lab execution config
 * + hidden tests, or null when the id is not a published user interview problem.
 * The skill tag is the owner skill so code attempts credit mastery like native
 * items. Interview problems carry no fixtures.
 */
export async function resolveUserInterviewExecution(
  itemId: string
): Promise<{
  config: LearningItemCodeLab;
  hiddenTests: CodeTestCase[];
  publishedVersionId: string | null;
  files: { name: string; content: string }[];
} | null> {
  if (!isUserLearningItemId(itemId)) {
    return null;
  }
  const contentId = contentIdFromUserItemId(itemId);
  if (!contentId) {
    return null;
  }
  const detail = await getInterviewForOwner(contentId);
  const payload = detail?.publishedPayload;
  if (!payload) {
    return null;
  }
  return {
    config: { ...interviewPayloadToCodeLabConfig(payload), skillTags: [userSkillId(contentId)] },
    hiddenTests: interviewHiddenTests(payload),
    publishedVersionId: detail?.publishedVersionId ?? null,
    files: []
  };
}
