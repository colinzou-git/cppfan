import { describe, expect, it } from "vitest";
import { scoreSkillFromEvents } from "@/features/mastery/mastery-scoring";
import { getCoverageForSkill } from "@/features/mastery/context-coverage";
import { adjustMasteryForContextCoverage } from "@/features/mastery/context-coverage-rules";
import type { ScoringEvent } from "@/features/events/event-types";
import type { CoverageEvent } from "@/features/mastery/context-coverage-types";

// Integration of scoring (status) + context-coverage adjustment, mirroring the
// mastery summary builder. A skill_mastered marker with single-context evidence
// must not stay mastered; multi-context evidence keeps it.

function evaluate(skillId: string, events: (ScoringEvent & CoverageEvent)[]) {
  const score = scoreSkillFromEvents(events);
  return adjustMasteryForContextCoverage({
    skillId,
    currentStatus: score.status,
    coverage: getCoverageForSkill({ skillId, events })
  });
}

describe("mastery + context coverage integration", () => {
  it("one-context recognition success cannot become mastered", () => {
    const events = [
      { event_type: "quiz_correct", event_time: "2026-01-01T00:00:00Z" },
      { event_type: "skill_mastered", event_time: "2026-01-02T00:00:00Z" }
    ] as (ScoringEvent & CoverageEvent)[];
    expect(scoreSkillFromEvents(events).status).toBe("mastered");
    expect(evaluate("cpp.x", events)).toBe("strong");
  });

  it("delayed review + Code Lab + recognition can become mastered", () => {
    const events = [
      { event_type: "quiz_correct", event_time: "2026-01-01T00:00:00Z" },
      { event_type: "code_passed", event_time: "2026-01-02T00:00:00Z" },
      { event_type: "review_completed", event_time: "2026-01-03T00:00:00Z" },
      { event_type: "skill_mastered", event_time: "2026-01-04T00:00:00Z" }
    ] as (ScoringEvent & CoverageEvent)[];
    expect(evaluate("cpp.x", events)).toBe("mastered");
  });

  it("does not invent mastery for a strong (non-marked) skill", () => {
    const events = [
      { event_type: "quiz_correct", event_time: "2026-01-01T00:00:00Z" },
      { event_type: "code_passed", event_time: "2026-01-02T00:00:00Z" }
    ] as (ScoringEvent & CoverageEvent)[];
    // strong stays strong regardless of coverage.
    expect(evaluate("cpp.x", events)).toBe("strong");
  });
});
