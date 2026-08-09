import { DEFAULT_COMPILER_FLAGS } from "./code-lab-defaults";
import {
  resolveCodeLabItem,
  type CodeLabFile,
  type ResolvedCodeLabItem
} from "./code-lab-item-resolver";
import type { CodeTestCase, LearningItemCodeLab } from "./code-lab-types";
import { buildFunctionExerciseTranslationUnit } from "@/features/user-content/function-exercise-harness";

export type CodeExecutionPlan = {
  itemId: string;
  contentVersionId: string | null;
  milestoneIndex: number | null;
  config: LearningItemCodeLab;
  preparedSource: string;
  files: CodeLabFile[];
  compilerFlags: string[];
  visibleTests: CodeTestCase[];
  hiddenTests: CodeTestCase[];
};

export type ResolveCodeExecutionPlanResult =
  | { status: "ok"; plan: CodeExecutionPlan }
  | { status: "stale_definition" }
  | { status: "item_unavailable" }
  | { status: "invalid_contract"; message: string };

/**
 * The single server-side conversion from a resolved learning item and learner
 * source into the trusted program contract consumed by every executor.
 */
export async function resolveCodeExecutionPlan(input: {
  itemId: string;
  expectedContentVersionId?: string;
  milestoneIndex?: number;
  learnerSource: string;
  compilerFlags?: string[];
}): Promise<ResolveCodeExecutionPlanResult> {
  const resolved = await resolveCodeLabItem({
    itemId: input.itemId,
    expectedContentVersionId: input.expectedContentVersionId,
    milestoneIndex: input.milestoneIndex
  });

  if (resolved.status === "stale_definition") {
    return { status: "stale_definition" };
  }
  if (resolved.status === "not_found") {
    return { status: "item_unavailable" };
  }
  return buildCodeExecutionPlanForResolvedItem(
    resolved.item,
    input.learnerSource,
    input.compilerFlags
  );
}

export function buildCodeExecutionPlanForResolvedItem(
  item: ResolvedCodeLabItem,
  learnerSource: string,
  callerCompilerFlags?: string[]
): ResolveCodeExecutionPlanResult {
  const compilerFlags =
    callerCompilerFlags && callerCompilerFlags.length > 0
      ? callerCompilerFlags
      : item.config.compilerFlags && item.config.compilerFlags.length > 0
        ? item.config.compilerFlags
        : [...DEFAULT_COMPILER_FLAGS];

  let preparedSource = learnerSource;
  if (item.config.mode === "function") {
    const built = buildFunctionExerciseTranslationUnit({
      learnerSource,
      functionSignature: item.config.functionSignature ?? ""
    });
    if (!built.ok) {
      return {
        status: "invalid_contract",
        message: `This function-mode exercise has an invalid author signature: ${built.issues
          .map((issue) => issue.message)
          .join("; ")}`
      };
    }
    preparedSource = built.source;
  }

  return {
    status: "ok",
    plan: {
      itemId: item.itemId,
      contentVersionId: item.contentVersionId ?? null,
      milestoneIndex: item.milestoneIndex ?? null,
      config: item.config,
      preparedSource,
      files: item.files,
      compilerFlags,
      visibleTests: item.config.visibleTests ?? [],
      hiddenTests: item.hiddenTests
    }
  };
}
