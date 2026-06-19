import { createClient } from "@/lib/supabase/server";
import { isMissingObjectError, logConfiguredFailure } from "@/lib/supabase/errors";
import type { EvaluationMutationResult } from "./evaluation-service-types";

export function classifyEvaluationError(error: { code?: string | null; message?: string | null }): EvaluationMutationResult {
  if (isMissingObjectError(error)) return { status: "unavailable" };
  const message = error.message ?? "";
  if (message.includes("stale_evaluation_question")) return { status: "stale" };
  if (message.includes("invalid_evaluation_choice")) return { status: "invalid" };
  logConfiguredFailure("goal-evaluation-mutation", error);
  return { status: "error" };
}

export async function getEvaluationClient() {
  const supabase = await createClient();
  if (!supabase) return { status: "unconfigured" as const };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { status: "signed_out" as const };
  return { status: "ready" as const, supabase };
}
