import { describe, expect, it } from "vitest";
import {
  getParsonsBlocksForItem,
  getParsonsSolution,
  parsonsBlocks,
  toPublicParsonsBlock
} from "@/features/learning-items/learning-item-seed";
import { classifyParsonsRpc, gradeParsonsOrder } from "@/features/learning-items/parsons-grading";

const ITEM = "cpp.control_flow.loops.parsons_sum";

describe("Parsons seed integrity (#123)", () => {
  it("has unique block ids", () => {
    const ids = parsonsBlocks.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("non-distractor blocks form a complete 1..n order with no gaps or dupes", () => {
    const orders = getParsonsBlocksForItem(ITEM)
      .filter((b) => !b.is_distractor)
      .map((b) => b.correct_order)
      .sort((a, b) => a - b);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders).toEqual(Array.from({ length: orders.length }, (_, i) => i + 1));
  });

  it("has at least one distractor, and distractors carry correct_order 0", () => {
    const distractors = getParsonsBlocksForItem(ITEM).filter((b) => b.is_distractor);
    expect(distractors.length).toBeGreaterThanOrEqual(1);
    expect(distractors.every((b) => b.correct_order === 0)).toBe(true);
  });

  it("public block payload never carries the answer key", () => {
    for (const block of getParsonsBlocksForItem(ITEM).map(toPublicParsonsBlock)) {
      expect("correct_order" in block).toBe(false);
      expect("is_distractor" in block).toBe(false);
      expect(typeof block.content).toBe("string");
    }
  });

  it("getParsonsSolution returns non-distractor ids in solution order", () => {
    const solution = getParsonsSolution(ITEM);
    const expected = getParsonsBlocksForItem(ITEM)
      .filter((b) => !b.is_distractor)
      .sort((a, b) => a.correct_order - b.correct_order)
      .map((b) => b.id);
    expect(solution).toEqual(expected);
    // The distractor is excluded.
    expect(solution).not.toContain(`${ITEM}.d1`);
  });
});

describe("gradeParsonsOrder (#123)", () => {
  const solution = ["a", "b", "c"];

  it("marks the exact correct order correct", () => {
    expect(gradeParsonsOrder(solution, ["a", "b", "c"])).toEqual({ isCorrect: true, correctCount: 3, total: 3 });
  });

  it("marks a wrong order incorrect with partial structural feedback", () => {
    expect(gradeParsonsOrder(solution, ["b", "a", "c"])).toEqual({ isCorrect: false, correctCount: 1, total: 3 });
  });

  it("a too-short submission is incorrect", () => {
    expect(gradeParsonsOrder(solution, ["a", "b"])).toEqual({ isCorrect: false, correctCount: 2, total: 3 });
  });

  it("an empty solution is never trivially correct", () => {
    expect(gradeParsonsOrder([], []).isCorrect).toBe(false);
  });
});

describe("classifyParsonsRpc (#123/#146)", () => {
  it("grades a valid row", () => {
    expect(
      classifyParsonsRpc({ data: { is_correct: true, correct_count: 5, total: 5 }, error: null })
    ).toEqual({ status: "graded", isCorrect: true, correctCount: 5, total: 5 });
  });

  it("treats a missing function as pre-migration unavailable", () => {
    expect(classifyParsonsRpc({ data: null, error: { code: "42883", message: "x" } }).status).toBe("unavailable");
  });

  it("treats permission/network errors as error (no seed fallback)", () => {
    expect(classifyParsonsRpc({ data: null, error: { code: "42501", message: "denied" } }).status).toBe("error");
    expect(classifyParsonsRpc({ data: null, error: { code: null, message: "fetch failed" } }).status).toBe("error");
  });

  it("treats a malformed/no row as error", () => {
    expect(classifyParsonsRpc({ data: null, error: null }).status).toBe("error");
    expect(classifyParsonsRpc({ data: { is_correct: true }, error: null }).status).toBe("error");
  });
});
