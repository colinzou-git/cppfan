// Server-only: the atomic answer-submission boundary (#218). Grades and persists
// a graded answer through ONE idempotent SECURITY DEFINER RPC
// (submit_learning_item_answer) that commits the attempt, the eligible review
// card, and the skill events in a single transaction — or none. Seed grading is
// used only in deliberate non-database modes (Supabase unconfigured, signed-out
// demo, or pre-migration); a configured-database failure returns a degraded error
// rather than silently grading against the seed (#146).
import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";
import { getErrorTagForChoice } from "@/features/remediation/error-tags";
import { recordErrorPatternTransitions } from "@/features/remediation/error-pattern-recorder";
import { getGradingChoices } from "./attempt-service";
import { gradeChoiceAttempt } from "./grading";

export type SubmitAnswerResult =
  | { status: "invalid" }
  | { status: "error" }
  | {
      status: "graded";
      isCorrect: boolean;
      correctChoiceId: string;
      persisted: boolean;
      /** Instructional misconception tag for a wrong choice, for remediation (#126). */
      errorTag: string | null;
    };

/**
 * Outcome of the atomic submit RPC. `unavailable` (function/table not migrated)
 * permits legitimate seed grading; `error` is a configured-database failure that
 * must NOT fall back to the seed.
 */
export type SubmitRpcOutcome =
  | { status: "graded"; isCorrect: boolean; correctChoiceId: string; errorTag: string | null }
  | { status: "invalid" }
  | { status: "unavailable" }
  | { status: "error" };

type RpcResult = {
  data: unknown;
  error: { code?: string | null; message?: string | null } | null;
};

/**
 * Pure classification of the submit-RPC result (deterministic, unit-tested).
 * `ok` and `already_processed` are both graded successes (idempotent replay
 * returns the prior verdict); `invalid` is an ungradeable item/choice; a
 * missing-object error is pre-migration; any other error is a configured failure.
 */
export function classifySubmitRpc(result: RpcResult): SubmitRpcOutcome {
  const { data, error } = result;

  if (error) {
    return isMissingObjectError(error) ? { status: "unavailable" } : { status: "error" };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const status = (row as { status?: unknown } | null)?.status;
  if (typeof status !== "string") {
    return { status: "error" };
  }
  if (status === "invalid") {
    return { status: "invalid" };
  }
  if (status === "ok" || status === "already_processed") {
    const typed = row as { is_correct?: unknown; correct_choice_id?: unknown; error_tag?: unknown };
    if (typeof typed.is_correct !== "boolean" || typeof typed.correct_choice_id !== "string") {
      return { status: "error" };
    }
    return {
      status: "graded",
      isCorrect: typed.is_correct,
      correctChoiceId: typed.correct_choice_id,
      errorTag: typeof typed.error_tag === "string" ? typed.error_tag : null
    };
  }
  return { status: "error" };
}

async function seedGrade(itemId: string, choiceId: string): Promise<SubmitAnswerResult> {
  const outcome = gradeChoiceAttempt(await getGradingChoices(itemId), choiceId);
  if (outcome.status === "invalid") {
    return { status: "invalid" };
  }
  return {
    status: "graded",
    isCorrect: outcome.isCorrect,
    correctChoiceId: outcome.correctChoiceId,
    persisted: false,
    errorTag: outcome.isCorrect ? null : getErrorTagForChoice(choiceId)
  };
}

/**
 * Grade and atomically persist a graded answer for the signed-in learner. Seed
 * grading (no persistence) applies only when Supabase is unconfigured, the
 * learner is signed out, or the schema is not migrated yet.
 */
export async function submitGradedAnswer(
  itemId: string,
  choiceId: string,
  submissionId: string
): Promise<SubmitAnswerResult> {
  const supabase = await createClient();
  if (!supabase) {
    return seedGrade(itemId, choiceId); // unconfigured / demo
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return seedGrade(itemId, choiceId); // signed-out demo
  }

  const result = await supabase.rpc("submit_learning_item_answer", {
    p_item_id: itemId,
    p_choice_id: choiceId,
    p_submission_id: submissionId
  });

  const outcome = classifySubmitRpc(result);
  if (outcome.status === "unavailable") {
    return seedGrade(itemId, choiceId); // pre-migration
  }
  if (outcome.status === "error") {
    console.error(
      `[submit] submit_learning_item_answer failed (code=${result.error?.code ?? "none"}); not falling back to seed`
    );
    return { status: "error" };
  }
  if (outcome.status === "invalid") {
    return { status: "invalid" };
  }

  // Best-effort: record observed/cleared misconception evidence from the
  // learner's recent attempts (#126). Derived evidence — never blocks the result.
  await recordErrorPatternTransitions(supabase, user.id).catch(() => undefined);

  return {
    status: "graded",
    isCorrect: outcome.isCorrect,
    correctChoiceId: outcome.correctChoiceId,
    persisted: true,
    errorTag: outcome.errorTag
  };
}
