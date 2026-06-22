// Server-only: createClient relies on next/headers cookies, so this module
// cannot be imported into a client component.
import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";
import { recordSkillEvents, type RecordSkillEventInput } from "@/features/events/event-service";
import { getCodeLabConfigForItem } from "./code-lab-catalog";
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
  return attemptRecorded || evidenceRecorded;
}

async function recordCodeAttemptSkillEvents(input: {
  itemId: string;
  source: string;
  run?: CodeRunResult | null;
  test?: CodeTestResult | null;
  aiReviewRequested?: boolean;
}): Promise<boolean> {
  const result = input.test ?? input.run;
  if (!result || result.simulated) return false;

  const skillTags = getCodeLabConfigForItem(input.itemId)?.skillTags ?? [];
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

function codeAttemptMetadata(input: {
  itemId: string;
  run?: CodeRunResult | null;
  test?: CodeTestResult | null;
  aiReviewRequested?: boolean;
}): Record<string, unknown> {
  const result = input.test ?? input.run;
  return {
    itemId: input.itemId,
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
