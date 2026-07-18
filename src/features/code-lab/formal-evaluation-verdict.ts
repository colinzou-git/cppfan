/*
 * Pure verdict mapping for formal AI / combined evaluation (#609). Kept out of the
 * "use server" action module: a Server Actions file may only export async
 * functions, so this synchronous helper lives here and is imported by both the
 * action and its unit test.
 */

import type { AiOutcome } from "@/features/user-content/user-content-evaluation";

/** Map structured AI review feedback to a formal rubric verdict (pure, #609). */
export function aiVerdictFromFeedback(feedback: { status: string; errorTags?: unknown } | null): AiOutcome {
  if (!feedback || feedback.status === "unavailable" || feedback.status === "invalid") {
    return { available: false, verdict: "unknown" };
  }
  const clean = !Array.isArray(feedback.errorTags) || feedback.errorTags.length === 0;
  return { available: true, verdict: clean ? "pass" : "revise" };
}
