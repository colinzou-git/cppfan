// Pure classification of the apply_review_rating RPC result (#143). Kept out of
// the "use server" action module so it can be exported synchronously and unit
// tested. ok/already_processed are successes (idempotent retry); stale signals a
// concurrent/duplicate rating the UI reconciles; anything else (incl. a missing
// function pre-migration) is an error.

export type RateReviewResult =
  | { status: "error" }
  | { status: "stale" }
  | { status: "ok"; state: string; dueAt: string };

export type RateRpcResult = {
  data: unknown;
  error: { code?: string | null; message?: string | null } | null;
};

export function classifyRateRpc(result: RateRpcResult): RateReviewResult {
  if (result.error) {
    return { status: "error" };
  }
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  const status = (row as { status?: unknown } | null)?.status;
  if (status === "stale") {
    return { status: "stale" };
  }
  if (status === "ok" || status === "already_processed") {
    const typed = row as { state?: unknown; due_at?: unknown };
    if (typeof typed.state === "string" && typeof typed.due_at === "string") {
      return { status: "ok", state: typed.state, dueAt: typed.due_at };
    }
  }
  return { status: "error" };
}
