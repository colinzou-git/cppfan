// Server-only: createClient relies on next/headers cookies, so this module
// cannot be imported into a client component.
import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";
import { recordSkillEvents, type RecordSkillEventInput } from "@/features/events/event-service";
import { getExerciseById } from "@/features/exercises/exercise-catalog";
import { setExerciseProgress } from "@/features/exercises/exercise-progress";
import { resolveCodeLabItem } from "./code-lab-item-resolver";
import type { CodeAttemptSummary, CodeRunResult, CodeTestResult } from "./code-lab-types";

/**
 * Best-effort persistence of a code-lab attempt for the signed-in learner
 * (#407). Returns false (without throwing) whenever Supabase is unconfigured,
 * the learner is signed out, or the table is not migrated yet, so Run/Test keep
 * working offline and pre-migration. user_id is stamped from the session and
 * enforced by RLS; the client never supplies it.
 */
export async function recordCodeAttempt(input: {
  itemId: string;
  source: string;
  run?: CodeRunResult | null;
  test?: CodeTestResult | null;
  aiReviewRequested?: boolean;
  /** Immutable published version the browser loaded + server validated (#612). */
  contentVersionId?: string | null;
  /** Active milestone for a user lab attempt (#612). */
  milestoneIndex?: number | null;
}): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return false;

  const runStatus = input.run?.status ?? input.test?.status ?? "ok";
  const { error } = await supabase.from("code_lab_attempts").insert({
    user_id: user.id,
    learning_item_id: input.itemId,
    // Immutable definition identity, so history/completion can distinguish an
    // attempt made against an old published version from the current one (#612).
    content_version_id: input.contentVersionId ?? null,
    milestone_index: input.milestoneIndex ?? null,
    source_code: input.source,
    language: "cpp",
    run_status: runStatus,
    compile_output: input.run?.compileOutput ?? input.test?.compileOutput ?? null,
    stdout: input.run?.stdout ?? null,
    stderr: input.run?.stderr ?? null,
    tests_passed: input.test?.passed ?? null,
    tests_total: input.test?.total ?? null,
    ai_review_requested: input.aiReviewRequested ?? false
  });

  let attemptRecorded = true;
  if (error) {
    attemptRecorded = false;
    // Pre-migration (table absent) and any write failure are non-fatal: the run
    // result is still returned to the learner. Surface real failures in logs.
    if (!isMissingObjectError(error)) {
      console.error(`[code-lab] attempt insert failed (code=${error.code ?? "none"})`);
    }
  }

  const evidenceRecorded = await recordCodeAttemptSkillEvents(input).catch(() => false);

  // #440: a passing real (non-simulated) test run for a write-code exercise
  // auto-completes that exercise. recordEvents:false avoids duplicate code_passed
  // spam — the attempt evidence above already records it.
  if (isPassingRealTestAttempt(input.test) && getExerciseById(input.itemId)) {
    await setExerciseProgress({
      exerciseId: input.itemId,
      status: "completed",
      recordEvents: false
    }).catch(() => "error");
  }

  return attemptRecorded || evidenceRecorded;
}

async function recordCodeAttemptSkillEvents(input: {
  itemId: string;
  source: string;
  run?: CodeRunResult | null;
  test?: CodeTestResult | null;
  aiReviewRequested?: boolean;
  contentVersionId?: string | null;
  milestoneIndex?: number | null;
}): Promise<boolean> {
  const result = input.test ?? input.run;
  if (!result || result.simulated) return false;

  // One shared resolver for skill tags too, so labs/interviews credit mastery
  // like exercises and native items (#611).
  const resolved = await resolveCodeLabItem({ itemId: input.itemId });
  const skillTags = resolved.status === "ok" ? resolved.item.skillTags : [];
  if (skillTags.length === 0) return false;

  const metadata = codeAttemptMetadata(input);
  const events: RecordSkillEventInput[] = skillTags.map((skillId) => ({
    eventType: "code_attempted",
    skillId,
    learningItemId: input.itemId,
    metadata
  }));

  if (isPassingRealTestAttempt(input.test)) {
    events.push(
      ...skillTags.map((skillId) => ({
        eventType: "code_passed" as const,
        skillId,
        learningItemId: input.itemId,
        metadata
      }))
    );
  }

  return recordSkillEvents(events);
}

function isPassingRealTestAttempt(test: CodeTestResult | null | undefined): boolean {
  return Boolean(test && !test.simulated && test.status === "ok" && test.total > 0 && test.passed === test.total);
}

export function codeAttemptMetadata(input: {
  itemId: string;
  run?: CodeRunResult | null;
  test?: CodeTestResult | null;
  aiReviewRequested?: boolean;
  contentVersionId?: string | null;
  milestoneIndex?: number | null;
}): Record<string, unknown> {
  const result = input.test ?? input.run;
  return {
    itemId: input.itemId,
    // Immutable definition identity travels with the evidence (#612), so a
    // version-aware pass query can exclude an old-version pass.
    contentVersionId: input.contentVersionId ?? null,
    milestoneIndex: input.milestoneIndex ?? null,
    provider: result?.provider ?? "none",
    simulated: result?.simulated ?? false,
    runStatus: input.run?.status ?? input.test?.status ?? "ok",
    testsPassed: input.test?.passed ?? null,
    testsTotal: input.test?.total ?? null,
    hiddenPassed: input.test?.hiddenPassed ?? null,
    hiddenTotal: input.test?.hiddenTotal ?? null,
    durationMs: input.run?.durationMs ?? null,
    memoryKb: input.run?.memoryKb ?? null,
    aiReviewRequested: input.aiReviewRequested ?? false
  };
}

/**
 * Item ids (from the given set) for which the signed-in learner has a recorded
 * attempt that passed every visible test (#431). Gates capstone milestone
 * completion now that running happens on the full-screen /lab page rather than
 * inline. Best-effort: returns [] when signed out, unconfigured, or pre-migration.
 */
export async function getPassingCodeLabItemIds(itemIds: string[]): Promise<string[]> {
  if (itemIds.length === 0) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("code_lab_attempts")
    .select("learning_item_id, tests_passed, tests_total")
    .eq("user_id", user.id)
    .in("learning_item_id", itemIds);

  if (error || !data) {
    if (error && !isMissingObjectError(error)) {
      console.error(`[code-lab] passing-attempt query failed (code=${error.code ?? "none"})`);
    }
    return [];
  }

  const passing = new Set<string>();
  for (const row of data) {
    const total = row.tests_total;
    if (typeof total === "number" && total > 0 && row.tests_passed === total) {
      passing.add(row.learning_item_id);
    }
  }
  return [...passing];
}

export function summarizeAttempt(input: {
  itemId: string;
  run?: CodeRunResult | null;
  test?: CodeTestResult | null;
  aiReviewRequested?: boolean;
}): CodeAttemptSummary {
  return {
    itemId: input.itemId,
    runStatus: input.run?.status ?? input.test?.status ?? "ok",
    testsPassed: input.test?.passed ?? null,
    testsTotal: input.test?.total ?? null,
    aiReviewRequested: input.aiReviewRequested ?? false
  };
}
