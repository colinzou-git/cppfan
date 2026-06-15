import { describe, expect, it } from "vitest";
import { buildDiagnosticView } from "@/features/interview/diagnostic-view";
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
