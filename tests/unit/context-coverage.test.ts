import { describe, expect, it } from "vitest";
import {
  buildSkillContextCoverage,
  coveredContexts,
  getCoverageForSkill,
  getEvidenceContextForEvent
} from "@/features/mastery/context-coverage";
import type { CoverageEvent } from "@/features/mastery/context-coverage-types";

describe("getEvidenceContextForEvent", () => {
  it("maps event types to contexts deterministically", () => {
    expect(getEvidenceContextForEvent({ event_type: "quiz_correct" })).toBe("recognition");
    expect(getEvidenceContextForEvent({ event_type: "completion_submitted" })).toBe("completion");
    expect(getEvidenceContextForEvent({ event_type: "parsons_submitted" })).toBe("parsons");
    expect(getEvidenceContextForEvent({ event_type: "code_passed" })).toBe("code_lab");
    expect(getEvidenceContextForEvent({ event_type: "review_completed" })).toBe("delayed_review");
    expect(getEvidenceContextForEvent({ event_type: "capstone_milestone_completed" })).toBe(
      "project_milestone"
    );
    expect(getEvidenceContextForEvent({ event_type: "hint_used" })).toBeNull();
  });
});

describe("getCoverageForSkill", () => {
  it("counts evidence and successes/failures per context", () => {
    const events: CoverageEvent[] = [
      { event_type: "quiz_correct", event_time: "2026-01-01" },
      { event_type: "quiz_wrong", event_time: "2026-01-02" },
      { event_type: "code_passed", event_time: "2026-01-03" }
    ];
    const coverage = getCoverageForSkill({ skillId: "cpp.x", events });
    expect(coverage.contexts.recognition.count).toBe(2);
    expect(coverage.contexts.recognition.recentSuccessCount).toBe(1);
    expect(coverage.contexts.recognition.recentFailureCount).toBe(1);
    expect(coverage.contexts.code_lab.count).toBe(1);
    expect(coverage.contexts.recognition.lastSeenAt).toBe("2026-01-02");
    expect(coveredContexts(coverage).sort()).toEqual(["code_lab", "recognition"]);
  });
});

describe("buildSkillContextCoverage", () => {
  it("groups events by skill_id", () => {
    const coverages = buildSkillContextCoverage([
      { event_type: "quiz_correct", skill_id: "a" },
      { event_type: "code_passed", skill_id: "b" },
      { event_type: "review_completed", skill_id: null }
    ]);
    expect(coverages.map((c) => c.skillId).sort()).toEqual(["a", "b"]);
  });
});
