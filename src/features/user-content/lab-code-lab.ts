/*
 * Build a Code Lab config from a published user lab (#489). Pure and
 * client-safe: no I/O and no answer-bearing data. Hidden tests contribute only a
 * count; the reference solution and hidden test I/O never appear here. The
 * active contract is the single-task completion, or — in milestone mode — one
 * milestone (default the first), so a learner never sees a later milestone's
 * hidden criteria. The server-side execution path resolves the full
 * (hidden-inclusive) config separately from the DB.
 */

import type { LearningItemCodeLab } from "@/features/code-lab/code-lab-types";
import type { ExerciseTest, LabCompletionContract, LabPayload } from "./lab-content-types";

/** The completion contract that governs a given view of the lab. */
export function activeLabContract(payload: LabPayload, milestoneIndex = 0): LabCompletionContract | undefined {
  if (payload.mode === "milestones") {
    const list = payload.milestones ?? [];
    if (list.length === 0) return undefined;
    const idx = Math.min(Math.max(0, milestoneIndex), list.length - 1);
    return list[idx];
  }
  return payload.completion;
}

/** A learner-facing prompt for the active view: the task, plus the milestone. */
export function labPrompt(payload: LabPayload, milestoneIndex = 0): string {
  const base = payload.taskDescription || payload.summary || payload.title || "";
  if (payload.mode === "milestones") {
    const list = payload.milestones ?? [];
    if (list.length > 0) {
      const idx = Math.min(Math.max(0, milestoneIndex), list.length - 1);
      const m = list[idx];
      return `${base}\n\n## Milestone ${idx + 1}: ${m.title}\n\n${m.instructions}`;
    }
  }
  return base;
}

/** Learner-safe Code Lab config for a published lab (visible tests only). */
export function labPayloadToCodeLabConfig(payload: LabPayload, milestoneIndex = 0): LearningItemCodeLab {
  const contract = activeLabContract(payload, milestoneIndex);
  const tests: ExerciseTest[] = contract?.tests ?? [];
  const visible = tests.filter((t) => !t.hidden);
  const hiddenCount = tests.length - visible.length;

  return {
    enabled: true,
    language: "cpp",
    mode: "stdin",
    prompt: labPrompt(payload, milestoneIndex) || undefined,
    starterCode: payload.starterCode ?? "",
    visibleTests: visible.map((test) => ({
      name: test.name,
      stdin: test.input,
      expectedStdout: test.expectedOutput,
      matcher: "exact" as const
    })),
    ...(hiddenCount > 0 ? { hiddenTestCount: hiddenCount } : {})
  };
}
