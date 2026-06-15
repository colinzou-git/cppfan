import { describe, expect, it } from "vitest";
import { readinessFacets, READINESS_FACET_IDS } from "@/features/interview/readiness-facets";
import type { RubricScore } from "@/features/interview/rubric";

describe("readinessFacets (#180)", () => {
  it("reports all seven skill facets, including the four beyond the core quality trio", () => {
    const facets = readinessFacets([]);
    expect(facets).toHaveLength(7);
    const ids = facets.map((f) => f.id);
    expect(ids).toEqual(READINESS_FACET_IDS);
    for (const id of ["implementation_correctness", "cpp_fluency", "time_management", "follow_up_adaptability"] as const) {
      expect(ids).toContain(id);
    }
  });

  it("leaves an unrated facet null (no invented evidence)", () => {
    const facets = readinessFacets([]);
    expect(facets.every((f) => f.score === null && f.band === null)).toBe(true);
  });

  it("maps a self rubric score to the facet score and band", () => {
    const scores: RubricScore[] = [
      { criterion: "correctness", score: 4, source: "self" },
      { criterion: "time_management", score: 1, source: "self" }
    ];
    const facets = readinessFacets(scores);
    const correctness = facets.find((f) => f.id === "implementation_correctness");
    const timeMgmt = facets.find((f) => f.id === "time_management");
    expect(correctness).toMatchObject({ score: 4, band: "strong" });
    expect(timeMgmt).toMatchObject({ score: 1, band: "needs_work" });
  });

  it("ignores non-self rubric sources", () => {
    const facets = readinessFacets([{ criterion: "cpp_implementation", score: 4, source: "peer" }]);
    expect(facets.find((f) => f.id === "cpp_fluency")?.score).toBeNull();
  });
});
