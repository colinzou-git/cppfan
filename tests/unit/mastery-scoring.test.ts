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

  it("scores correct completion and Parsons submissions as reconstruction evidence", () => {
    const result = scoreSkillFromEvents([
      { ...ev("completion_submitted"), metadata: { is_correct: true } },
      { ...ev("parsons_submitted"), metadata: { is_correct: true } }
    ]);
    expect(result.status).toBe("strong");
    expect(result.reason).toMatch(/reconstruction/i);
  });

  it("treats Parsons hints as hint evidence", () => {
    const result = scoreSkillFromEvents([
      { ...ev("parsons_submitted"), metadata: { is_correct: true } },
      ev("parsons_hint_used"),
      ev("parsons_hint_used")
    ]);
    expect(result.status).toBe("weak");
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

describe("scoreSkillFromEvents recency and bounds (#144)", () => {
  // A fixed day offset from a 2026 base, for deterministic recency windows.
  function at(event_type: SkillEventName, dayOffset: number): ScoringEvent {
    return { event_type, event_time: new Date(Date.UTC(2026, 0, 1 + dayOffset)).toISOString() };
  }
  const nowAt = (dayOffset: number) => new Date(Date.UTC(2026, 0, 1 + dayOffset)).toISOString();

  it("ignores old successes outside the window so recent failure wins", () => {
    const events = [
      at("quiz_correct", 0),
      at("quiz_correct", 1),
      at("quiz_correct", 2),
      at("quiz_wrong", 200)
    ];
    // Scored as of day 200: the day 0-2 successes are >90 days old and drop out.
    expect(scoreSkillFromEvents(events, nowAt(200)).status).toBe("weak");
  });

  it("recovers from a regressed marker through later correct evidence", () => {
    const events = [at("skill_regressed", 10), at("quiz_correct", 11), at("quiz_correct", 12)];
    expect(scoreSkillFromEvents(events, nowAt(12)).status).toBe("strong");
  });

  it("does not let an old mastered marker override recent failures", () => {
    const events = [at("skill_mastered", 10), at("quiz_wrong", 11), at("quiz_wrong", 12)];
    expect(scoreSkillFromEvents(events, nowAt(12)).status).toBe("weak");
  });

  it("still honors a mastered marker when nothing contradicts it", () => {
    const events = [at("quiz_correct", 10), at("skill_mastered", 11)];
    expect(scoreSkillFromEvents(events, nowAt(11)).status).toBe("mastered");
  });

  it("counts only the most recent capped events", () => {
    // 10 old wrongs then 50 recent corrects (all within window): the cap keeps
    // the recent 50, so the skill reads strong despite the old failures.
    const events = [
      ...Array.from({ length: 10 }, (_, i) => at("quiz_wrong", 100 + i)),
      ...Array.from({ length: 50 }, (_, i) => at("quiz_correct", 120 + i))
    ];
    expect(scoreSkillFromEvents(events, nowAt(170)).status).toBe("strong");
  });

  it("is deterministic for equal timestamps and repeated calls", () => {
    const events = [at("quiz_wrong", 5), at("quiz_correct", 5)];
    const a = scoreSkillFromEvents(events, nowAt(5));
    const b = scoreSkillFromEvents(events, nowAt(5));
    expect(a).toEqual(b);
    expect(a.status).toBe("learning");
  });

  it("falls back to the bounded recent set when all evidence is older than the window", () => {
    const events = [at("quiz_correct", 0), at("quiz_correct", 1)];
    // Even scored far in the future, last-known state is reflected (not dropped).
    expect(scoreSkillFromEvents(events, nowAt(500)).status).toBe("strong");
  });
});
