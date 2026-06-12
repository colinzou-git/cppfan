import { describe, expect, it } from "vitest";
import { scoreSkillFromEvents } from "@/features/mastery/mastery-scoring";
import type { ScoringEvent } from "@/features/events/event-types";
import type { SkillEventName } from "@/features/events/event-names";

let clock = 0;
function ev(event_type: SkillEventName): ScoringEvent {
  clock += 1;
  return { event_type, event_time: new Date(clock * 1000).toISOString() };
}

describe("scoreSkillFromEvents", () => {
  it("is new with no events", () => {
    expect(scoreSkillFromEvents([]).status).toBe("new");
  });

  it("is learning after only starting a lesson", () => {
    expect(scoreSkillFromEvents([ev("lesson_started")]).status).toBe("learning");
  });

  it("is weak when a single attempt is wrong", () => {
    expect(scoreSkillFromEvents([ev("quiz_attempted"), ev("quiz_wrong")]).status).toBe("weak");
  });

  it("is weak with repeated hint usage", () => {
    const result = scoreSkillFromEvents([ev("quiz_correct"), ev("hint_used"), ev("hint_used")]);
    expect(result.status).toBe("weak");
  });

  it("is strong with consistent correct answers", () => {
    const result = scoreSkillFromEvents([ev("quiz_correct"), ev("quiz_correct"), ev("quiz_correct")]);
    expect(result.status).toBe("strong");
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it("is reviewing when only reviews exist", () => {
    expect(scoreSkillFromEvents([ev("review_completed")]).status).toBe("reviewing");
  });

  it("is mastered when the latest marker is skill_mastered", () => {
    const result = scoreSkillFromEvents([ev("quiz_correct"), ev("quiz_correct"), ev("skill_mastered")]);
    expect(result.status).toBe("mastered");
  });

  it("is regressed when skill_regressed follows skill_mastered", () => {
    const result = scoreSkillFromEvents([ev("skill_mastered"), ev("quiz_wrong"), ev("skill_regressed")]);
    expect(result.status).toBe("regressed");
  });

  it("is learning for a mixed even split", () => {
    expect(scoreSkillFromEvents([ev("quiz_correct"), ev("quiz_wrong")]).status).toBe("learning");
  });
});
