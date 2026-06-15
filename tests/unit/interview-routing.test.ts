import { describe, expect, it } from "vitest";
import { routePlanTask } from "@/features/interview/interview-routing";
import type { PlanTask } from "@/features/interview/interview-plan";

function task(overrides: Partial<PlanTask>): PlanTask {
  return {
    sessionType: "independent_timed",
    pattern: "arrays_hashing_prefix",
    estimatedMinutes: 45,
    reason: "",
    guidance: "",
    ...overrides
  };
}

describe("routePlanTask (#180)", () => {
  it("routes a conceptual remediation gap to a worked example with an external reference", () => {
    const route = routePlanTask(task({ sessionType: "remediation", pattern: "graphs_paths" }));
    expect(route.kind).toBe("worked_example");
    expect(route.href).toBe("/interview");
    expect(route.externalUrl).toMatch(/^https?:\/\//);
  });

  it("routes a C++ implementation gap to implementation practice (completion-style drills)", () => {
    const route = routePlanTask(task({ sessionType: "independent_timed", pattern: "cpp_implementation" }));
    expect(route.kind).toBe("implementation_practice");
    expect(route.href).toBe("/exercises");
  });

  it("routes a timing/transfer gap to an independent timed problem", () => {
    const route = routePlanTask(task({ sessionType: "independent_timed", pattern: "binary_search" }));
    expect(route.kind).toBe("timed_problem");
    expect(route.href).toBe("/interview/session");
    expect(route.title).toMatch(/under time/i);
  });

  it("routes a mock gap to a mock pack", () => {
    const route = routePlanTask(task({ sessionType: "mock_interview", pattern: null }));
    expect(route.kind).toBe("mock_pack");
    expect(route.href).toBe("/interview/mocks");
  });

  it("routes a quality gap (no pattern) to a concise resource", () => {
    const route = routePlanTask(task({ sessionType: "remediation", pattern: null }));
    expect(route.kind).toBe("quality_resource");
    expect(route.href).toBe("/resources");
  });

  it("is deterministic for identical inputs", () => {
    const t = task({ sessionType: "remediation", pattern: "dp_backtracking" });
    expect(routePlanTask(t)).toEqual(routePlanTask(t));
  });
});
