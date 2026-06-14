import { describe, expect, it } from "vitest";
import {
  buildHeatMap,
  classifyArea,
  diagnosticMinutes,
  diagnosticSections,
  generatePlan
} from "@/features/interview/diagnostic";
import { getInterviewProblem } from "@/features/interview/problem-catalog";
import { getLearningItemById } from "@/features/learning-items/learning-item-seed";

describe("diagnostic definition integrity (#175)", () => {
  it("fits the 75-100 minute target and can be split across sessions", () => {
    const total = diagnosticMinutes();
    expect(total).toBeGreaterThanOrEqual(75);
    expect(total).toBeLessThanOrEqual(100);
  });

  it("has unique sections that reference real catalog problems or learning items", () => {
    const ids = diagnosticSections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const section of diagnosticSections) {
      if (section.source.kind === "interview_problem") {
        expect(getInterviewProblem(section.source.problemId), `${section.id} problem`).not.toBeNull();
      } else {
        expect(getLearningItemById(section.source.itemId), `${section.id} item`).not.toBeNull();
      }
      expect(section.dimensions.length).toBeGreaterThan(0);
    }
  });

  it("covers a coding problem and a C++ debugging task", () => {
    expect(diagnosticSections.some((s) => s.source.kind === "interview_problem")).toBe(true);
    expect(diagnosticSections.some((s) => s.group === "cpp_implementation")).toBe(true);
  });
});

describe("diagnostic scoring is a deterministic heat map, never auto-mastery (#175)", () => {
  it("classifies each area by readiness, not pass/fail", () => {
    expect(classifyArea(0.9)).toBe("interview_ready");
    expect(classifyArea(0.6)).toBe("practice_under_time");
    expect(classifyArea(0.2)).toBe("refresh_first");
    expect(classifyArea(0)).toBe("refresh_first");
  });

  it("builds a per-section heat map and clamps/handles missing scores", () => {
    const heat = buildHeatMap({ "diag.arrays_window": 0.9, "diag.graph_dependency": 2 });
    const byId = new Map(heat.map((e) => [e.sectionId, e]));
    expect(heat.length).toBe(diagnosticSections.length);
    expect(byId.get("diag.arrays_window")?.level).toBe("interview_ready");
    expect(byId.get("diag.graph_dependency")?.score).toBe(1); // clamped
    // A section with no score defaults to refresh_first (safe, suggestion-only).
    expect(byId.get("diag.cpp_debugging")?.level).toBe("refresh_first");
  });
});

describe("deterministic plan generation (#175)", () => {
  it("produces a 4-8 week plan, weakest areas first", () => {
    const heat = buildHeatMap({
      "diag.arrays_window": 0.95,
      "diag.graph_dependency": 0.3,
      "diag.ds_design": 0.6,
      "diag.cpp_debugging": 0.1
    });
    const plan = generatePlan(heat);
    expect(plan.length).toBeGreaterThanOrEqual(4);
    expect(plan.length).toBeLessThanOrEqual(8);
    // The weakest area (lowest score) is scheduled first.
    expect(plan[0].sectionId).toBe("diag.cpp_debugging");
    expect(plan[0].reason).toMatch(/refresh first/i);
  });

  it("is stable: identical evidence yields an identical plan", () => {
    const scores = { "diag.arrays_window": 0.4, "diag.graph_dependency": 0.7 };
    expect(generatePlan(buildHeatMap(scores))).toEqual(generatePlan(buildHeatMap(scores)));
  });

  it("lists catalog problems for areas that have them", () => {
    const heat = buildHeatMap({ "diag.graph_dependency": 0.1 });
    const week = generatePlan(heat).find((w) => w.sectionId === "diag.graph_dependency");
    expect(week?.problemIds).toContain("iv.graph.service-init-order");
  });
});
