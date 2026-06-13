import { describe, expect, it } from "vitest";
import { classifyGradeRpc } from "@/features/learning-items/attempt-service";

// #146: a configured-database grade RPC must distinguish a legitimate
// pre-migration/missing-object state (seed grading is OK) from a real backend
// failure (must NOT silently grade against the seed).

describe("classifyGradeRpc (#146)", () => {
  it("grades from a valid single-object row", () => {
    expect(classifyGradeRpc({ data: { is_correct: true, correct_choice_id: "c1" }, error: null })).toEqual({
      status: "graded",
      isCorrect: true,
      correctChoiceId: "c1"
    });
  });

  it("grades from a valid array row", () => {
    expect(
      classifyGradeRpc({ data: [{ is_correct: false, correct_choice_id: "c2" }], error: null })
    ).toEqual({ status: "graded", isCorrect: false, correctChoiceId: "c2" });
  });

  it("treats a missing function/table as pre-migration unavailable (seed allowed)", () => {
    for (const code of ["PGRST202", "PGRST205", "42883", "42P01"]) {
      expect(classifyGradeRpc({ data: null, error: { code, message: "x" } }).status).toBe("unavailable");
    }
  });

  it("treats permission denial as an error (no seed fallback)", () => {
    expect(classifyGradeRpc({ data: null, error: { code: "42501", message: "permission denied" } }).status).toBe(
      "error"
    );
  });

  it("treats a network/unknown error as an error", () => {
    expect(classifyGradeRpc({ data: null, error: { code: null, message: "fetch failed" } }).status).toBe("error");
  });

  it("treats a configured no-row result (drift / not found) as an error, not a seed grade", () => {
    expect(classifyGradeRpc({ data: null, error: null }).status).toBe("error");
    expect(classifyGradeRpc({ data: [], error: null }).status).toBe("error");
  });

  it("treats a malformed row as an error", () => {
    expect(classifyGradeRpc({ data: { is_correct: "yes" }, error: null }).status).toBe("error");
    expect(classifyGradeRpc({ data: { is_correct: true }, error: null }).status).toBe("error");
  });
});
