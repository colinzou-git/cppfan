// Server-only: createClient relies on next/headers cookies, so this module
// cannot be imported into a client component.
import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError } from "@/lib/supabase/errors";
import { getChoicesForItem } from "./learning-item-seed";
import type { GradingChoice } from "./grading";

/**
 * Choices including the answer key, read server-side only for grading. Falls
 * back to the bundled seed when Supabase is unconfigured or the migration is
 * not applied. Never expose the result directly to the client.
 */
export async function getGradingChoices(itemId: string): Promise<GradingChoice[]> {
  const supabase = await createClient();

  if (!supabase) {
    return getChoicesForItem(itemId);
  }

  const { data, error } = await supabase
    .from("learning_item_choices")
    .select("id,is_correct,order_index")
    .eq("learning_item_id", itemId)
    .order("order_index", { ascending: true });

  if (error || !data || data.length === 0) {
    return getChoicesForItem(itemId);
  }

  return data as GradingChoice[];
}

/**
 * Outcome of grading via the database RPC (#146). The caller must treat these
 * differently: `unconfigured`/`unavailable` are legitimate non-database modes
 * where seed grading is allowed; `error` is a configured-database failure that
 * must NOT silently fall back to seed answer keys.
 */
export type RpcGradeOutcome =
  | { status: "graded"; isCorrect: boolean; correctChoiceId: string }
  | { status: "unconfigured" } // no Supabase env: demo/seed mode
  | { status: "unavailable" } // configured, but the function/table is not migrated yet
  | { status: "error" }; // configured database failure (permission/network/drift/bad data)

type RpcResult = {
  data: unknown;
  error: { code?: string | null; message?: string | null } | null;
};

/**
 * Pure classification of a grade-RPC result, separated for deterministic tests.
 * Distinguishes not-found / missing-object from permission/network/schema
 * failures so a configured-database error never masquerades as a seed grade.
 */
export function classifyGradeRpc(result: RpcResult): RpcGradeOutcome {
  const { data, error } = result;

  if (error) {
    return isMissingObjectError(error) ? { status: "unavailable" } : { status: "error" };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof (row as { is_correct?: unknown }).is_correct !== "boolean") {
    // Configured database returned no usable row: item/choice missing or drift.
    // Surface it rather than grading against possibly-different seed data.
    return { status: "error" };
  }
  const typed = row as { is_correct: boolean; correct_choice_id?: unknown };
  if (typeof typed.correct_choice_id !== "string") {
    return { status: "error" };
  }
  return { status: "graded", isCorrect: typed.is_correct, correctChoiceId: typed.correct_choice_id };
}

/**
 * Grade a choice via the SECURITY DEFINER database function, which keeps the
 * answer key server-side. Returns a typed outcome (#146): seed grading is only
 * legitimate for `unconfigured`/`unavailable`; an `error` must not be silently
 * graded against the seed.
 */
export async function gradeViaRpc(itemId: string, choiceId: string): Promise<RpcGradeOutcome> {
  const supabase = await createClient();
  if (!supabase) {
    return { status: "unconfigured" };
  }

  const result = await supabase.rpc("grade_learning_item_choice", {
    p_item_id: itemId,
    p_choice_id: choiceId
  });

  const outcome = classifyGradeRpc(result);
  if (outcome.status === "error") {
    // Structured, secret-free server log so configured failures are observable.
    console.error(
      `[grading] grade_learning_item_choice failed (code=${result.error?.code ?? "none"}); not falling back to seed`
    );
  }
  return outcome;
}

/**
 * Record an attempt for the signed-in learner. Best effort: returns false when
 * Supabase is unconfigured, the user is not signed in, or the attempts table is
 * not yet migrated, so grading still works offline / pre-migration.
 */
export async function recordAttempt(input: {
  itemId: string;
  choiceId: string;
  isCorrect: boolean;
}): Promise<boolean> {
  const supabase = await createClient();

  if (!supabase) {
    return false;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { error } = await supabase.from("learning_item_attempts").insert({
    user_id: user.id,
    learning_item_id: input.itemId,
    selected_choice_id: input.choiceId,
    is_correct: input.isCorrect
  });

  return !error;
}
