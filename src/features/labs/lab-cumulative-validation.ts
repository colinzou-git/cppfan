"use server";

import { buildRunnerInput, executeRun } from "@/features/code-lab/code-runner";
import { compareOutput } from "@/features/code-lab/code-lab-service";
import { DEFAULT_COMPILER_FLAGS } from "@/features/code-lab/code-lab-defaults";
import { buildCodeExecutionPlanForResolvedItem } from "@/features/code-lab/code-execution-plan";
import type { ResolvedCodeLabItem } from "@/features/code-lab/code-lab-item-resolver";
import { getLabForOwner } from "@/features/user-content/user-content-queries";
import { activeLabContract, labPayloadToCodeLabConfig } from "@/features/user-content/lab-code-lab";
import {
  contentIdFromUserItemId,
  isUserLearningItemId
} from "@/features/user-content/user-content-id";
import type { LabPayload } from "@/features/user-content/lab-content-types";

export type LabCumulativeValidation =
  | { status: "ok"; regressedMilestoneIds: [] }
  | { status: "regressed"; regressedMilestoneIds: string[] }
  | { status: "stale"; regressedMilestoneIds: [] }
  | { status: "unavailable"; regressedMilestoneIds: []; message: string }
  | {
      status: "invalid_definition";
      regressedMilestoneIds: [];
      message: string;
    };

type RequiredMilestone = { milestoneId: string; index: number };

function requiredMilestones(payload: LabPayload): RequiredMilestone[] {
  if (payload.mode === "milestones") {
    return (payload.milestones ?? [])
      .map((milestone, index) => ({
        milestoneId: milestone.id || `milestone-${index}`,
        required: milestone.required,
        index
      }))
      .filter((milestone) => milestone.required)
      .map(({ milestoneId, index }) => ({ milestoneId, index }));
  }
  return [{ milestoneId: "task", index: 0 }];
}

export async function validateLabCumulativeAgainstPayload(input: {
  payload: LabPayload;
  source: string;
  itemId?: string;
  contentVersionId?: string | null;
}): Promise<LabCumulativeValidation> {
  const files = (input.payload.fixtures ?? []).map((fixture) => ({
    name: fixture.filename,
    content: fixture.content
  }));
  const configuredStandard = input.payload.run?.cppStandard?.trim();
  const compilerFlags = configuredStandard
    ? [
        `-std=${configuredStandard}`,
        ...DEFAULT_COMPILER_FLAGS.filter((flag) => !flag.startsWith("-std="))
      ]
    : [...DEFAULT_COMPILER_FLAGS];
  const regressed: string[] = [];

  for (const milestone of requiredMilestones(input.payload)) {
    const contract = activeLabContract(input.payload, milestone.index);
    const tests = contract?.tests ?? [];
    if (tests.length === 0) {
      return {
        status: "invalid_definition",
        regressedMilestoneIds: [],
        message: `Required milestone "${milestone.milestoneId}" has no tests.`
      };
    }
    const config = {
      ...labPayloadToCodeLabConfig(input.payload, milestone.index),
      compilerFlags
    };
    const resolvedItem: ResolvedCodeLabItem = {
      source: "user_lab",
      itemId: input.itemId ?? "user.item.payload-validation",
      contentVersionId: input.contentVersionId ?? undefined,
      milestoneIndex: milestone.index,
      prompt: config.prompt ?? "",
      skillTags: [],
      config,
      hiddenTests: [],
      files
    };
    const planned = buildCodeExecutionPlanForResolvedItem(resolvedItem, input.source);
    if (planned.status !== "ok") {
      return {
        status: "invalid_definition",
        regressedMilestoneIds: [],
        message:
          planned.status === "invalid_contract"
            ? planned.message
            : "The lab execution definition is invalid."
      };
    }

    let passedAll = true;
    for (const test of tests) {
      let run;
      try {
        run = await executeRun(
          buildRunnerInput({
            source: planned.plan.preparedSource,
            stdin: test.input ?? "",
            compilerFlags: planned.plan.compilerFlags,
            files: planned.plan.files
          })
        );
      } catch {
        return {
          status: "unavailable",
          regressedMilestoneIds: [],
          message: "Final validation is temporarily unavailable."
        };
      }
      if (run.status === "runner_unconfigured" || run.status === "runner_error") {
        return {
          status: "unavailable",
          regressedMilestoneIds: [],
          message: "Final validation is temporarily unavailable."
        };
      }
      const passed =
        run.status === "success" && compareOutput(run.stdout, test.expectedOutput ?? "", "exact");
      if (!passed) {
        passedAll = false;
        break;
      }
    }
    if (!passedAll) regressed.push(milestone.milestoneId);
  }

  return regressed.length > 0
    ? { status: "regressed", regressedMilestoneIds: regressed }
    : { status: "ok", regressedMilestoneIds: [] };
}

export async function validateLabCumulative(input: {
  itemId: string;
  contentVersionId?: string | null;
  source: string;
}): Promise<LabCumulativeValidation> {
  if (!input?.itemId || !isUserLearningItemId(input.itemId)) {
    return {
      status: "unavailable",
      regressedMilestoneIds: [],
      message: "This lab is unavailable."
    };
  }
  const contentId = contentIdFromUserItemId(input.itemId);
  if (!contentId) {
    return {
      status: "unavailable",
      regressedMilestoneIds: [],
      message: "This lab is unavailable."
    };
  }
  const detail = await getLabForOwner(contentId);
  if (!detail?.publishedPayload) {
    return {
      status: "unavailable",
      regressedMilestoneIds: [],
      message: "This lab is unavailable."
    };
  }
  if (
    input.contentVersionId &&
    detail.publishedVersionId &&
    input.contentVersionId !== detail.publishedVersionId
  ) {
    return { status: "stale", regressedMilestoneIds: [] };
  }
  return validateLabCumulativeAgainstPayload({
    payload: detail.publishedPayload,
    source: input.source,
    itemId: input.itemId,
    contentVersionId: detail.publishedVersionId
  });
}
