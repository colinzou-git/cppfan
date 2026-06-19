import { describe, expect, it } from "vitest";
import { buildDiagnosticResultView, buildDiagnosticView } from "@/features/interview/diagnostic-view";
import { diagnosticMinutes, diagnosticSections } from "@/features/interview/diagnostic";

// Diagnostic overview view (#175): surfaces the assembled baseline sections.

describe("buildDiagnosticView (#175)", () => {
  const view = buildDiagnosticView();

  it("covers every diagnostic section and matches the total time budget", () => {
    expect(view.sections.map((s) => s.id)).toEqual(diagnosticSections.map((s) => s.id));
    expect(view.totalMinutes).toBe(diagnosticMinutes());
  });

  it("resolves a readable source title and dimension labels for each section", () => {
    for (const section of view.sections) {
      expect(section.sourceTitle.length).toBeGreaterThan(0);
      expect(section.dimensionLabels.length).toBeGreaterThan(0);
      // Labels are humanized, not raw snake_case dimension ids.
      expect(section.dimensionLabels.every((d) => !d.includes("_"))).toBe(true);
    }
  });
});

describe("buildDiagnosticResultView (#175)", () => {
  it("withholds the plan until scores exist", () => {
    const result = buildDiagnosticResultView({});
    expect(result.hasScores).toBe(false);
    expect(result.plan).toEqual([]);
    expect(result.heatMap.length).toBe(diagnosticSections.length);
  });

  it("resolves a saved heat map into a transparent plan with next steps", () => {
    const result = buildDiagnosticResultView({
      "diag.arrays_window": 0.9,
      "diag.graph_dependency": 0.3,
      "diag.ds_design": 0.7,
      "diag.cpp_debugging": 0.2
    });

    expect(result.hasScores).toBe(true);
    expect(result.plan.length).toBeGreaterThanOrEqual(4);
    expect(result.plan[0].reason).toMatch(/refresh first/i);
    expect(result.plan[0].nextStep.href).toMatch(/^\/(exercises|interview)/);
    expect(result.plan.some((week) => week.problemTitles.length > 0)).toBe(true);
  });
});
