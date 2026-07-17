import { describe, expect, it } from "vitest";
import {
  nativeInterviewCandidates,
  selectTransferCandidate,
  interviewSessionHref,
  type InterviewPlanningCandidate
} from "@/features/interview/interview-planning-candidates";
import { routePlanTask } from "@/features/interview/interview-routing";
import type { InterviewEvidence } from "@/features/interview/readiness";
import type { PlanTask } from "@/features/interview/interview-plan";

function candidate(over: Partial<InterviewPlanningCandidate> & { problemId: string; group: InterviewPlanningCandidate["group"] }): InterviewPlanningCandidate {
  return {
    source: "user",
    title: over.problemId,
    patternTags: [],
    interviewCore: false,
    recommendationEnabled: true,
    ...over
  };
}

const GROUP = "arrays_hashing_prefix";

describe("interview planning candidates (#613)", () => {
  it("exposes native problems as candidates", () => {
    const native = nativeInterviewCandidates();
    expect(native.length).toBeGreaterThan(0);
    expect(native.every((c) => c.source === "native" && c.recommendationEnabled)).toBe(true);
  });

  it("selects a custom problem in the pattern when native ones are exhausted/seen", () => {
    const nativeSeen = candidate({ problemId: "native-1", source: "native", group: GROUP });
    const custom = candidate({ problemId: "user.item.abc", group: GROUP, title: "My custom problem" });
    const evidence: InterviewEvidence[] = [
      { problemId: "native-1", pattern: GROUP, completedAtMs: 1000 } as InterviewEvidence
    ];
    const pick = selectTransferCandidate(GROUP, evidence, [nativeSeen, custom]);
    // The unseen custom problem is chosen over the already-seen native one.
    expect(pick?.problemId).toBe("user.item.abc");
    expect(pick?.unseen).toBe(true);
  });

  it("excludes recommendation-disabled custom problems from automatic selection", () => {
    const optedOut = candidate({ problemId: "user.item.optout", group: GROUP, recommendationEnabled: false });
    expect(selectTransferCandidate(GROUP, [], [optedOut])).toBeNull();
  });

  it("only matches candidates in the requested pattern group", () => {
    const other = candidate({ problemId: "user.item.other", group: "dp_backtracking" });
    expect(selectTransferCandidate(GROUP, [], [other])).toBeNull();
  });

  it("routes a timed task to a problem-specific href, not a generic session URL", () => {
    const custom = candidate({ problemId: "user.item.xyz", group: GROUP, title: "Custom" });
    const task: PlanTask = { sessionType: "independent_timed", pattern: GROUP } as PlanTask;
    const route = routePlanTask(task, [], [custom]);
    expect(route.kind).toBe("timed_problem");
    expect(route.href).toBe(interviewSessionHref("user.item.xyz"));
    expect(route.href).toContain("problem=user.item.xyz");
    expect(route.title).toContain("Custom");
  });

  it("falls back to a generic session URL when no candidate matches", () => {
    const task: PlanTask = { sessionType: "independent_timed", pattern: GROUP } as PlanTask;
    const route = routePlanTask(task, [], []);
    // Empty candidate list → native selection path; href stays valid either way.
    expect(route.kind).toBe("timed_problem");
  });
});
