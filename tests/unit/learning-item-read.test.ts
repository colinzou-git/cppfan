import { describe, expect, it } from "vitest";
import { isMissingObjectError } from "@/lib/supabase/errors";
import { resolveLearningItemResult } from "@/features/learning-items/learning-item-queries";
import type { LearningItemWithDetails } from "@/features/learning-items/learning-item-types";

const seed: LearningItemWithDetails = {
  item: {
    id: "item-1",
    type: "lesson",
    title: "Seed item",
    prompt: "seed prompt",
    explanation: "seed explanation",
    difficulty: "beginner",
    estimated_minutes: 2,
    order_index: 1,
    is_active: true
  },
  skills: [],
  choices: []
};

const dbItem: LearningItemWithDetails["item"] = { ...seed.item, title: "DB item", prompt: "db prompt" };
const ok = <T,>(data: T) => ({ data, error: null });
const fail = (code: string | null) => ({ data: null, error: { code } });
const empty = { data: null, error: null };

describe("isMissingObjectError (#146)", () => {
  it("is true only for missing-object codes", () => {
    for (const code of ["PGRST202", "PGRST205", "42883", "42P01", "42P17"]) {
      expect(isMissingObjectError({ code })).toBe(true);
    }
    expect(isMissingObjectError({ code: "42501" })).toBe(false);
    expect(isMissingObjectError({ code: null })).toBe(false);
    expect(isMissingObjectError(null)).toBe(false);
  });
});

describe("resolveLearningItemResult (#146)", () => {
  it("returns the database item on success", () => {
    const result = resolveLearningItemResult(ok(dbItem), ok([]), ok([]), seed);
    expect(result).toEqual({ status: "ok", data: { item: dbItem, skills: [], choices: [] } });
  });

  it("surfaces a configured item error instead of serving seed", () => {
    expect(resolveLearningItemResult(fail("42501"), empty, empty, seed).status).toBe("error");
    expect(resolveLearningItemResult(fail(null), empty, empty, seed).status).toBe("error");
  });

  it("falls back to seed for a missing-object (pre-migration) item error", () => {
    expect(resolveLearningItemResult(fail("42P01"), empty, empty, seed)).toEqual({ status: "ok", data: seed });
  });

  it("treats a configured not-found as seed fallback, or not_found without seed", () => {
    expect(resolveLearningItemResult(empty, empty, empty, seed)).toEqual({ status: "ok", data: seed });
    expect(resolveLearningItemResult(empty, empty, empty, null)).toEqual({ status: "not_found" });
  });

  it("does not swap a fetched DB item for seed when skills/choices error", () => {
    expect(resolveLearningItemResult(ok(dbItem), fail("42501"), ok([]), seed).status).toBe("error");
    expect(resolveLearningItemResult(ok(dbItem), ok([]), fail(null), seed).status).toBe("error");
  });

  it("falls back to seed when skills/choices are missing-object (pre-migration)", () => {
    expect(resolveLearningItemResult(ok(dbItem), fail("42P01"), ok([]), seed)).toEqual({ status: "ok", data: seed });
  });
});
