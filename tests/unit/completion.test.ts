import { describe, expect, it } from "vitest";
import {
  completionBlanks,
  getCompletionBlanksForItem,
  getCompletionSolution,
  getPublicCompletionBlanksForItem,
  toPublicCompletionBlank
} from "@/features/learning-items/learning-item-seed";
import { classifyCompletionRpc, gradeCompletionAnswers } from "@/features/learning-items/completion-grading";

const ITEM = "cpp.control_flow.loops.completion_sum";

describe("completion seed integrity (#123)", () => {
  it("has unique blank ids", () => {
    const ids = completionBlanks.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("blanks form a complete 1..n position order with no gaps or dupes", () => {
    const positions = getCompletionBlanksForItem(ITEM)
      .map((b) => b.position)
      .sort((a, b) => a - b);
    expect(positions.length).toBeGreaterThan(0);
    expect(positions).toEqual(Array.from({ length: positions.length }, (_, i) => i + 1));
  });

  it("public blank payload never carries the answer", () => {
    for (const blank of getCompletionBlanksForItem(ITEM).map(toPublicCompletionBlank)) {
      expect("answer" in blank).toBe(false);
      expect(typeof blank.position).toBe("number");
    }
    // The learner-facing accessor is answer-free and in position order.
    const publicBlanks = getPublicCompletionBlanksForItem(ITEM);
    expect(publicBlanks.map((b) => b.position)).toEqual([1, 2, 3]);
    expect(publicBlanks.every((b) => !("answer" in b))).toBe(true);
  });

  it("getCompletionSolution returns answers in position order", () => {
    expect(getCompletionSolution(ITEM)).toEqual(["0", "+=", "sum"]);
  });
});

describe("gradeCompletionAnswers (#123)", () => {
  const solution = ["0", "+=", "sum"];

  it("marks the exact correct answers correct", () => {
    expect(gradeCompletionAnswers(solution, ["0", "+=", "sum"])).toEqual({
      isCorrect: true,
      correctCount: 3,
      total: 3
    });
  });

  it("is case- and whitespace-insensitive", () => {
    expect(gradeCompletionAnswers(["Sum"], ["  sum  "])).toEqual({ isCorrect: true, correctCount: 1, total: 1 });
  });

  it("marks a wrong answer incorrect with partial feedback", () => {
    expect(gradeCompletionAnswers(solution, ["0", "-=", "sum"])).toEqual({
      isCorrect: false,
      correctCount: 2,
      total: 3
    });
  });

  it("a too-short submission is incorrect", () => {
    expect(gradeCompletionAnswers(solution, ["0", "+="])).toEqual({ isCorrect: false, correctCount: 2, total: 3 });
  });

  it("an empty solution is never trivially correct", () => {
    expect(gradeCompletionAnswers([], []).isCorrect).toBe(false);
  });
});

describe("classifyCompletionRpc (#123/#146)", () => {
  it("grades a valid row", () => {
    expect(
      classifyCompletionRpc({ data: { is_correct: true, correct_count: 3, total: 3 }, error: null })
    ).toEqual({ status: "graded", isCorrect: true, correctCount: 3, total: 3 });
  });

  it("treats a missing function as pre-migration unavailable", () => {
    expect(classifyCompletionRpc({ data: null, error: { code: "42883", message: "x" } }).status).toBe("unavailable");
  });

  it("treats permission/network errors as error (no seed fallback)", () => {
    expect(classifyCompletionRpc({ data: null, error: { code: "42501", message: "denied" } }).status).toBe("error");
    expect(classifyCompletionRpc({ data: null, error: { code: null, message: "fetch failed" } }).status).toBe("error");
  });

  it("treats a malformed/no row as error", () => {
    expect(classifyCompletionRpc({ data: null, error: null }).status).toBe("error");
    expect(classifyCompletionRpc({ data: { is_correct: true }, error: null }).status).toBe("error");
  });
});
