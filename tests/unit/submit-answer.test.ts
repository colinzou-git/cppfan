import { describe, expect, it } from "vitest";
import { classifySubmitRpc } from "@/features/learning-items/submit-service";

// Atomic submit-RPC classification (#218). Mirrors the grading classifier (#146):
// pre-migration may seed-grade; a configured failure must not.

describe("classifySubmitRpc (#218)", () => {
  it("maps ok and already_processed to a graded success", () => {
    const ok = classifySubmitRpc({
      data: [{ status: "ok", is_correct: true, correct_choice_id: "x.a", enrolled: true, error_tag: null }],
      error: null
    });
    expect(ok).toEqual({ status: "graded", isCorrect: true, correctChoiceId: "x.a", errorTag: null });

    const replay = classifySubmitRpc({
      data: [{ status: "already_processed", is_correct: false, correct_choice_id: "x.a", enrolled: false }],
      error: null
    });
    expect(replay).toEqual({ status: "graded", isCorrect: false, correctChoiceId: "x.a", errorTag: null });
  });

  it("carries the instructional error tag for a wrong answer (#126)", () => {
    const wrong = classifySubmitRpc({
      data: [{ status: "ok", is_correct: false, correct_choice_id: "x.a", error_tag: "cpp.references.copy_vs_alias" }],
      error: null
    });
    expect(wrong).toEqual({
      status: "graded",
      isCorrect: false,
      correctChoiceId: "x.a",
      errorTag: "cpp.references.copy_vs_alias"
    });
  });

  it("maps the invalid status to invalid", () => {
    expect(classifySubmitRpc({ data: [{ status: "invalid" }], error: null })).toEqual({ status: "invalid" });
  });

  it("treats a missing-object error as pre-migration (seed grading allowed)", () => {
    expect(classifySubmitRpc({ data: null, error: { code: "PGRST202" } })).toEqual({ status: "unavailable" });
    expect(classifySubmitRpc({ data: null, error: { code: "42883" } })).toEqual({ status: "unavailable" });
  });

  it("treats any other error as a configured failure (no seed fallback)", () => {
    expect(classifySubmitRpc({ data: null, error: { code: "42501" } })).toEqual({ status: "error" });
    expect(classifySubmitRpc({ data: null, error: { code: "08006" } })).toEqual({ status: "error" });
  });

  it("treats a malformed/empty success row as an error, not a silent pass", () => {
    expect(classifySubmitRpc({ data: [], error: null })).toEqual({ status: "error" });
    expect(classifySubmitRpc({ data: [{ status: "ok", correct_choice_id: "x.a" }], error: null })).toEqual({
      status: "error"
    });
    expect(classifySubmitRpc({ data: [{ status: "ok", is_correct: true }], error: null })).toEqual({
      status: "error"
    });
  });
});
