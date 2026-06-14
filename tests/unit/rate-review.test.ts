import { describe, expect, it } from "vitest";
import { classifyRateRpc } from "@/features/review/rate-review-result";

// #143: map the apply_review_rating RPC result. ok/already_processed succeed
// (idempotent retry), stale signals a concurrent/duplicate rating, everything
// else (incl. a missing function pre-migration) is an error.

describe("classifyRateRpc (#143)", () => {
  it("treats ok as success with the new state/due", () => {
    expect(classifyRateRpc({ data: [{ status: "ok", state: "review", due_at: "2026-07-01T00:00:00.000Z" }], error: null })).toEqual(
      { status: "ok", state: "review", dueAt: "2026-07-01T00:00:00.000Z" }
    );
  });

  it("treats already_processed as idempotent success", () => {
    expect(
      classifyRateRpc({ data: { status: "already_processed", state: "learning", due_at: "2026-06-20T00:00:00.000Z" }, error: null })
    ).toEqual({ status: "ok", state: "learning", dueAt: "2026-06-20T00:00:00.000Z" });
  });

  it("surfaces a stale concurrent rating", () => {
    expect(classifyRateRpc({ data: [{ status: "stale", state: "review", due_at: "x" }], error: null })).toEqual({
      status: "stale"
    });
  });

  it("treats unauthorized / unknown / db error as error", () => {
    expect(classifyRateRpc({ data: [{ status: "unauthorized", state: null, due_at: null }], error: null }).status).toBe("error");
    expect(classifyRateRpc({ data: null, error: { code: "42883", message: "missing fn" } }).status).toBe("error");
    expect(classifyRateRpc({ data: null, error: { code: "42501", message: "denied" } }).status).toBe("error");
  });

  it("treats an ok row with missing fields as error (no half result)", () => {
    expect(classifyRateRpc({ data: [{ status: "ok" }], error: null }).status).toBe("error");
  });
});
