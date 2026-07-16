/*
 * One shared, server-only resolver for every Code Lab capability (#611).
 *
 * Run, Test, AI review, AI trace, and debug-step explanation all need the same
 * thing: the executable config + prompt + skill tags for the item the learner is
 * working on — native OR a published user exercise / lab / interview problem —
 * at the active milestone, and refused when the loaded content version is stale.
 *
 * Before this module, Run/Test used a combined exercise+lab+interview path while
 * review/trace/debug fell back to exercises only, so AI features saw an empty
 * prompt and missing skill tags for labs/interviews and never knew the active
 * milestone. This is the single contract; kind-specific adapters
 * (resolveUserExerciseExecution / …Lab / …Interview) sit BELOW it to avoid
 * import cycles, and native lookup stays synchronous (no DB call).
 */

import type { CodeTestCase, LearningItemCodeLab } from "./code-lab-types";
import { getCodeLabConfigForItem } from "./code-lab-catalog";
import { getHiddenTestsForItem } from "./code-lab-hidden-tests";
import { resolveUserExerciseExecution } from "./user-exercise-code-lab";
import { resolveUserLabExecution } from "./user-lab-code-lab";
import { resolveUserInterviewExecution } from "./user-interview-code-lab";

export type ResolvedCodeLabSource = "native" | "user_exercise" | "user_lab" | "user_interview";

export type CodeLabFile = { name: string; content: string };

export type ResolvedCodeLabItem = {
  source: ResolvedCodeLabSource;
  itemId: string;
  /** Published content version this resolution reflects (user items only). */
  contentVersionId?: string;
  /** Stable milestone id, populated by #612; index is used until then. */
  milestoneId?: string;
  /** Active milestone index for a multi-milestone lab. */
  milestoneIndex?: number;
  title?: string;
  /** Milestone-aware coding prompt (labs include the active checkpoint). */
  prompt: string;
  skillTags: string[];
  config: LearningItemCodeLab;
  /** Server-only hidden tests (I/O) for grading — never sent to AI context. */
  hiddenTests: CodeTestCase[];
  /** Read-only fixture files mounted alongside the program (labs). */
  files: CodeLabFile[];
};

export type ResolveCodeLabItemResult =
  | { status: "ok"; item: ResolvedCodeLabItem }
  | { status: "not_found" }
  | { status: "stale_definition" };

/**
 * Shown by every capability when the loaded user-content version changed under
 * the learner: refuse rather than execute / evaluate against a different (hidden)
 * definition. Run/Test surface it as `staleDefinition`; AI features reuse the
 * same message.
 */
export const CODE_LAB_STALE_NOTE =
  "This item was republished since you opened it. Reload the page to work against the current definition.";

export async function resolveCodeLabItem(input: {
  itemId: string;
  /** The published version the client loaded; a mismatch is refused as stale. */
  expectedContentVersionId?: string;
  /** Active milestone for a multi-milestone user lab. */
  milestoneIndex?: number;
}): Promise<ResolveCodeLabItemResult> {
  const { itemId } = input;
  const milestoneIndex = input.milestoneIndex ?? 0;

  // Native items resolve a synchronous seed config and never touch the DB.
  const nativeConfig = getCodeLabConfigForItem(itemId);
  if (nativeConfig) {
    return {
      status: "ok",
      item: {
        source: "native",
        itemId,
        prompt: nativeConfig.prompt ?? "",
        skillTags: nativeConfig.skillTags ?? [],
        config: nativeConfig,
        hiddenTests: getHiddenTestsForItem(itemId),
        files: []
      }
    };
  }

  // Exactly one user-content kind resolves a published payload for a given user
  // item id; the others return null. Order mirrors the historic Run/Test chain.
  const exercise = await resolveUserExerciseExecution(itemId);
  if (exercise) {
    return finalizeUser("user_exercise", itemId, exercise.config, exercise.hiddenTests, [], exercise.publishedVersionId, input.expectedContentVersionId);
  }
  const lab = await resolveUserLabExecution(itemId, milestoneIndex);
  if (lab) {
    return finalizeUser("user_lab", itemId, lab.config, lab.hiddenTests, lab.files, lab.publishedVersionId, input.expectedContentVersionId, milestoneIndex);
  }
  const interview = await resolveUserInterviewExecution(itemId);
  if (interview) {
    return finalizeUser("user_interview", itemId, interview.config, interview.hiddenTests, interview.files, interview.publishedVersionId, input.expectedContentVersionId);
  }
  return { status: "not_found" };
}

function finalizeUser(
  source: ResolvedCodeLabSource,
  itemId: string,
  config: LearningItemCodeLab,
  hiddenTests: CodeTestCase[],
  files: CodeLabFile[],
  publishedVersionId: string | null,
  expectedContentVersionId: string | undefined,
  milestoneIndex?: number
): ResolveCodeLabItemResult {
  // Stale only when the caller supplied an expected version and it differs from
  // the current published one — matching Run/Test's isStale contract exactly.
  if (expectedContentVersionId && publishedVersionId && expectedContentVersionId !== publishedVersionId) {
    return { status: "stale_definition" };
  }
  return {
    status: "ok",
    item: {
      source,
      itemId,
      contentVersionId: publishedVersionId ?? undefined,
      milestoneIndex,
      prompt: config.prompt ?? "",
      skillTags: config.skillTags ?? [],
      config,
      hiddenTests,
      files
    }
  };
}
