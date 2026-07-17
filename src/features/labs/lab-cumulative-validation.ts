"use server";

/*
 * Cumulative final validation for a user lab before whole-lab completion (#610).
 * Passing each milestone at some point in a session is not enough — a later edit
 * can break an earlier milestone. Before completion is awarded this re-runs the
 * CURRENT shared code against every REQUIRED milestone's tests (for the current
 * published version) and reports which previously-passed milestones now regress,
 * so completion is never granted against code that no longer satisfies them.
 *
 * Reuses the Code Lab runner; when no runner is configured (CI/local) it returns
 * "skipped" so completion still works where execution is unavailable — the same
 * policy as exercise publish validation.
 */

import { buildRunnerInput, executeRun } from "@/features/code-lab/code-runner";
import { compareOutput } from "@/features/code-lab/code-lab-service";
import { DEFAULT_COMPILER_FLAGS } from "@/features/code-lab/code-lab-defaults";
import { getLabForOwner } from "@/features/user-content/user-content-queries";
import { activeLabContract } from "@/features/user-content/lab-code-lab";
import { contentIdFromUserItemId, isUserLearningItemId } from "@/features/user-content/user-content-id";
import type { LabPayload } from "@/features/user-content/lab-content-types";

export type LabCumulativeValidation = {
  status: "ok" | "regressed" | "stale" | "unavailable" | "skipped";
  /** Stable ids of required milestones the current code no longer passes. */
  regressedMilestoneIds: string[];
};

type RequiredMilestone = { milestoneId: string; index: number };

function requiredMilestones(payload: LabPayload): RequiredMilestone[] {
  if (payload.mode === "milestones") {
    return (payload.milestones ?? [])
      .map((m, index) => ({ milestoneId: m.id || `milestone-${index}`, required: m.required, index }))
      .filter((m) => m.required)
      .map(({ milestoneId, index }) => ({ milestoneId, index }));
  }
  return [{ milestoneId: "task", index: 0 }];
}

export async function validateLabCumulative(input: {
  itemId: string;
  contentVersionId?: string | null;
  source: string;
}): Promise<LabCumulativeValidation> {
  if (!input?.itemId || !isUserLearningItemId(input.itemId)) {
    return { status: "unavailable", regressedMilestoneIds: [] };
  }
  const contentId = contentIdFromUserItemId(input.itemId);
  if (!contentId) return { status: "unavailable", regressedMilestoneIds: [] };
  const detail = await getLabForOwner(contentId);
  const payload = detail?.publishedPayload;
  if (!payload) return { status: "unavailable", regressedMilestoneIds: [] };

  // Never validate against a definition that changed under the learner.
  if (input.contentVersionId && detail?.publishedVersionId && input.contentVersionId !== detail.publishedVersionId) {
    return { status: "stale", regressedMilestoneIds: [] };
  }

  const flags = [...DEFAULT_COMPILER_FLAGS];
  const files = (payload.fixtures ?? []).map((f) => ({ name: f.filename, content: f.content }));
  const regressed: string[] = [];

  for (const milestone of requiredMilestones(payload)) {
    const contract = activeLabContract(payload, milestone.index);
    const tests = contract?.tests ?? [];
    let passedAll = true;
    for (const test of tests) {
      const run = await executeRun(
        buildRunnerInput({ source: input.source, stdin: test.input ?? "", compilerFlags: flags, files })
      );
      if (run.status === "runner_unconfigured") {
        // No runner here — cannot re-validate; let completion proceed as before.
        return { status: "skipped", regressedMilestoneIds: [] };
      }
      const passed = run.status === "success" && compareOutput(run.stdout, test.expectedOutput ?? "", "exact");
      if (!passed) {
        passedAll = false;
        break;
      }
    }
    if (!passedAll) {
      regressed.push(milestone.milestoneId);
    }
  }

  return regressed.length > 0
    ? { status: "regressed", regressedMilestoneIds: regressed }
    : { status: "ok", regressedMilestoneIds: [] };
}
