import { describe, expect, it } from "vitest";
import { completionGate } from "@/features/interview/readiness-report";
import type { ReadinessReport } from "@/features/interview/readiness";

function report(
  verdict: ReadinessReport["verdict"],
  overrides: Partial<ReadinessReport["dimensions"]> = {}
): Pick<ReadinessReport, "verdict" | "dimensions"> {
  return {
    verdict,
    dimensions: {
      core_pattern_coverage: "met",
      unseen_problem_success: "met",
      no_critical_weak_cluster: "met",
      mock_sessions: "met",
      quality_scores: "met",
      not_single_session: "met",
      ...overrides
    }
  };
}

describe("completionGate (#182)", () => {
  it("declares interview-ready for coding rounds only when the verdict is ready", () => {
    const gate = completionGate(report("ready"));
    expect(gate.ready).toBe(true);
    expect(gate.label).toMatch(/interview-ready for coding rounds/i);
    expect(gate.conditions.every((c) => c.met)).toBe(true);
    expect(gate.conditions).toHaveLength(6);
  });

  it("is not ready and marks the failing condition when a gate is unmet", () => {
    const gate = completionGate(report("not_ready", { mock_sessions: "unmet" }));
    expect(gate.ready).toBe(false);
    expect(gate.label).toMatch(/not yet/i);
    expect(gate.conditions.find((c) => c.id === "mock_sessions")?.met).toBe(false);
    expect(gate.conditions.find((c) => c.id === "core_pattern_coverage")?.met).toBe(true);
  });

  it("is not ready under not_enough_evidence even if dimensions happen to read met", () => {
    const gate = completionGate(report("not_enough_evidence"));
    expect(gate.ready).toBe(false);
  });

  it("never claims a hiring outcome in its label", () => {
    expect(completionGate(report("ready")).label.toLowerCase()).not.toMatch(/hir|guarantee|google/);
  });
});
