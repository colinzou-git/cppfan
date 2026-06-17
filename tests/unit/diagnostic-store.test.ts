import { describe, expect, it } from "vitest";
import { rowsToDiagnosticScores } from "@/features/interview/diagnostic-store";
import { diagnosticSections } from "@/features/interview/diagnostic";

const REAL = diagnosticSections[0].id;

describe("rowsToDiagnosticScores (#175/#182)", () => {
  it("maps valid section rows to a sectionId->score map", () => {
    const scores = rowsToDiagnosticScores([{ section_id: REAL, score: 0.75 }]);
    expect(scores[REAL]).toBe(0.75);
  });

  it("drops rows whose section id is not a real diagnostic section", () => {
    const scores = rowsToDiagnosticScores([
      { section_id: REAL, score: 0.5 },
      { section_id: "diag.not_real", score: 1 }
    ]);
    expect(Object.keys(scores)).toEqual([REAL]);
  });

  it("clamps scores into [0,1]", () => {
    const scores = rowsToDiagnosticScores([
      { section_id: diagnosticSections[0].id, score: 1.5 },
      { section_id: diagnosticSections[1].id, score: -0.2 }
    ]);
    expect(scores[diagnosticSections[0].id]).toBe(1);
    expect(scores[diagnosticSections[1].id]).toBe(0);
  });
});
